import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import { InMemoryRunner, isFinalResponse, stringifyContent } from "@google/adk";
import { studentProfilingAgent } from "./agents/studentProfilingAgent.js";
import { teamFormationAgent } from "./agents/teamFormationAgent.js";
import {
  appendAgentThought,
  clearTeamsForEvaluation,
  clearThoughtsForEvaluation,
  createDefaultEvaluationDoc,
  DEFAULT_EVALUATION_ID,
  EvaluationDoc,
  getEvaluationDoc,
  getFirestoreStatus,
  getFullEvaluationSnapshot,
  getParticipantsByEvaluation,
  getQuestionnairesByEvaluation,
  getTeamsByEvaluation,
  ParticipantDoc,
  ParticipantRoleProfile,
  QuestionnaireDoc,
  QuestionnaireSubmissionInput,
  ROLE_4H_NAMES,
  Role4HId,
  saveBatchQuestionnaireSubmissions,
  saveQuestionnaireSubmission,
  TeamDoc,
  TeamMemberSnapshot,
  upsertEvaluationDoc,
  upsertParticipantDoc,
  upsertTeamDoc,
} from "./firebase.js";

const app = express();
const PORT = Number(process.env.PORT) || 4000;

const configuredOrigins = (process.env.CLIENT_ORIGIN || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const allowedOrigins = new Set([
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  ...configuredOrigins,
]);

app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        allowedOrigins.has(origin) ||
        origin.endsWith(".web.app") ||
        origin.endsWith(".firebaseapp.com")
      ) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "5mb" }));

function hasValidGeminiApiKey(): boolean {
  const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) return false;
  return (
    apiKey !== "YOUR_KEY_HERE" &&
    apiKey !== "MY_GEMINI_API_KEY" &&
    apiKey !== "your_gemini_api_key_here" &&
    !apiKey.startsWith("YOUR_")
  );
}

async function runAgentPrompt(
  agent: typeof studentProfilingAgent,
  prompt: string
): Promise<{ text: string; liveModelUsed: boolean }> {
  if (!hasValidGeminiApiKey()) {
    return {
      text: "",
      liveModelUsed: false,
    };
  }

  if (!process.env.GOOGLE_GENAI_API_KEY && process.env.GEMINI_API_KEY) {
    process.env.GOOGLE_GENAI_API_KEY = process.env.GEMINI_API_KEY;
  }

  try {
    const runner = new InMemoryRunner({
      agent,
      appName: "ai-innovation-evaluator",
    });

    let finalOutput = "";
    for await (const event of runner.runEphemeral({
      userId: "aiie-pipeline-worker",
      newMessage: {
        role: "user",
        parts: [{ text: prompt }],
      },
    })) {
      const text = stringifyContent(event);
      if (isFinalResponse(event) && text) {
        finalOutput = text;
      } else if (text) {
        finalOutput += text;
      }
    }

    return {
      text: finalOutput.trim(),
      liveModelUsed: Boolean(finalOutput.trim()),
    };
  } catch (err) {
    console.warn(
      `ADK execution fallback for ${agent.name}:`,
      err instanceof Error ? err.message : err
    );
    return {
      text: "",
      liveModelUsed: false,
    };
  }
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ============================================================================
// Deterministic Schema & Algorithmic Calculations (`/plans/firestore-database-schema-indexing-plan.md` & `/plans/agent-roles.md`)
// ============================================================================

/**
 * Computes `ParticipantRoleProfile` from a `QuestionnaireDoc`:
 * - AI = round(((GPA - 3.00) / 3.00) * 100)
 * - EI = 0->0, 1->25, 2->50, 3->75, >=4->100
 * - MI, INI, ENI = (RawScore - 1) * 25
 * - TPS = 0.20 * (AI + EI + INI + ENI + MI)
 * - 4H Role Resolution: majority vote across q1-q4; tie-breaker aligned with highest indices
 */
export function computeParticipantRoleProfile(
  questionnaire: QuestionnaireDoc
): ParticipantRoleProfile {
  const {
    gpa,
    extracurricularCount,
    motivationScoreRaw,
    initiativeScoreRaw,
    entrepreneurialScoreRaw,
  } = questionnaire.profileMetrics;

  const clampedGpa = Math.max(3.0, Math.min(6.0, Number(gpa) || 3.0));
  const AI = Math.max(
    0,
    Math.min(100, Math.round(((clampedGpa - 3.0) / 3.0) * 100))
  );

  const count = Math.max(0, Math.round(Number(extracurricularCount) || 0));
  const EI =
    count === 0
      ? 0
      : count === 1
      ? 25
      : count === 2
      ? 50
      : count === 3
      ? 75
      : 100;

  const clampRaw = (v: number) => Math.max(1, Math.min(5, Math.round(Number(v) || 1)));
  const MI = (clampRaw(motivationScoreRaw) - 1) * 25;
  const INI = (clampRaw(initiativeScoreRaw) - 1) * 25;
  const ENI = (clampRaw(entrepreneurialScoreRaw) - 1) * 25;

  const tps = Number((0.2 * (AI + EI + INI + ENI + MI)).toFixed(1));

  const roleVoteBreakdown: Record<Role4HId, number> = {
    hacker: 0,
    hipster: 0,
    hustler: 0,
    hound: 0,
  };

  const answers: Role4HId[] = [
    questionnaire.roleAssessmentAnswers.q1_teamStrength,
    questionnaire.roleAssessmentAnswers.q2_deadlineFocus,
    questionnaire.roleAssessmentAnswers.q3_challengeType,
    questionnaire.roleAssessmentAnswers.q4_communicationStyle,
  ];

  for (const ans of answers) {
    if (ans in roleVoteBreakdown) {
      roleVoteBreakdown[ans] += 1;
    }
  }

  // Semantic alignment scores for tie-breaking (2-2 ties)
  const semanticAffinity: Record<Role4HId, number> = {
    hacker: AI + EI,
    hipster: MI + EI,
    hustler: ENI + INI,
    hound: INI + AI,
  };

  const roles: Role4HId[] = ["hacker", "hipster", "hustler", "hound"];
  roles.sort((a, b) => {
    if (roleVoteBreakdown[b] !== roleVoteBreakdown[a]) {
      return roleVoteBreakdown[b] - roleVoteBreakdown[a];
    }
    return semanticAffinity[b] - semanticAffinity[a];
  });

  const winningRoleId = roles[0]!;

  return {
    roleId: winningRoleId,
    roleName: ROLE_4H_NAMES[winningRoleId],
    roleVoteBreakdown,
    indices: {
      AI,
      EI,
      INI,
      ENI,
      MI,
    },
    tps,
  };
}

function computeTeamMetrics(members: TeamMemberSnapshot[]): {
  roleBalance: TeamDoc["roleBalance"];
  averageTPS: number;
  diversityScore: number;
  teamBalanceIndex: number;
  compatibilityPercentage: number;
} {
  const counts: Record<Role4HId, number> = {
    hacker: 0,
    hipster: 0,
    hustler: 0,
    hound: 0,
  };

  for (const m of members) {
    counts[m.role.roleId] = (counts[m.role.roleId] || 0) + 1;
  }

  const isComplete4H =
    counts.hacker === 1 &&
    counts.hipster === 1 &&
    counts.hustler === 1 &&
    counts.hound === 1;

  const uniqueRoles = Object.values(counts).filter((c) => c > 0).length;
  const R = isComplete4H ? 100 : Math.round((uniqueRoles / 4) * 100);

  const avgTps =
    members.length > 0
      ? Number(
          (
            members.reduce((sum, m) => sum + m.role.tps, 0) / members.length
          ).toFixed(1)
        )
      : 0;

  const uniqueCohorts = new Set(
    members.map((m) => `${m.schoolOrOrganization}::${m.gradeOrPosition}`)
  ).size;
  const V =
    members.length > 0 && uniqueCohorts === members.length
      ? 100
      : Math.round((uniqueCohorts / Math.max(1, members.length)) * 100);

  // Per `/plans/agent-roles.md`: TBI_j = (0.70 * avgTPS) + (0.15 * R) + (0.15 * V)
  const teamBalanceIndex = Number(
    (0.7 * avgTps + 0.15 * R + 0.15 * V).toFixed(1)
  );

  // Compatibility percentage (0-100)
  const compatibilityPercentage = Number(
    (0.4 * R + 0.4 * avgTps + 0.2 * V).toFixed(1)
  );

  return {
    roleBalance: {
      isComplete4H,
      hackerCount: counts.hacker,
      hipsterCount: counts.hipster,
      hustlerCount: counts.hustler,
      houndCount: counts.hound,
    },
    averageTPS: avgTps,
    diversityScore: V,
    teamBalanceIndex,
    compatibilityPercentage,
  };
}

/**
 * Multi-Agent Pipeline Execution:
 * 1. `student_profiling_agent`: Ingests questionnaires, computes 5 indices + TPS + 4H role, updates `participants/{id}`
 * 2. Sorts descending by TPS (tie-breaker MI -> INI) and marks Top-K `isSelected: true`
 * 3. `team_formation_agent`: Assembles 4-member 4H teams with institutional diversity & runs TBI rebalancing swaps
 * 4. Persists `teams/{id}`, `agent_thoughts/{id}`, and `evaluations/{id}` in Cloud Firestore
 */
async function executeEvaluationPipeline(
  evaluationId: string = DEFAULT_EVALUATION_ID
): Promise<void> {
  try {
    await clearThoughtsForEvaluation(evaluationId);
    await clearTeamsForEvaluation(evaluationId);

    const questionnaires = await getQuestionnairesByEvaluation(evaluationId);
    const existingParticipants = await getParticipantsByEvaluation(evaluationId);
    const participantMap = new Map<string, ParticipantDoc>(
      existingParticipants.map((p) => [p.id, p])
    );

    const evalDoc =
      (await getEvaluationDoc(evaluationId)) ?? createDefaultEvaluationDoc(evaluationId);
    const targetCohortSize = evalDoc.config.targetCohortSize || 96;

    await appendAgentThought(
      evaluationId,
      {
        agentName: "student_profiling_agent",
        phase: "ingestion",
        message: `Инициализиране на student_profiling_agent (${studentProfilingAgent.model}) за обработка на ${questionnaires.length} подадени въпросника в Firestore.`,
        metadata: {
          participantIds: questionnaires.map((q) => q.participantId),
        },
      },
      {
        status: "profiling_participants",
        errorMessage: null,
        teamIds: [],
        metrics: {
          ...evalDoc.metrics,
          totalParticipants: questionnaires.length,
          profiledParticipants: 0,
          selectedParticipants: 0,
          totalTeamsFormed: 0,
          confirmedTeamsCount: 0,
        },
      }
    );

    await delay(250);

    // Optional ADK call for live LLM trace
    const promptForAgent1 = JSON.stringify(
      questionnaires.map((q) => ({
        participantId: q.participantId,
        generalInfo: q.generalInfo,
        profileMetrics: q.profileMetrics,
        roleAssessmentAnswers: q.roleAssessmentAnswers,
      }))
    );
    void runAgentPrompt(studentProfilingAgent, promptForAgent1);

    // Step 1: Index calculation & 4H role resolution per participant
    const profiledParticipants: ParticipantDoc[] = [];

    for (let i = 0; i < questionnaires.length; i++) {
      const q = questionnaires[i]!;
      await delay(90);

      const roleProfile = computeParticipantRoleProfile(q);
      const baseParticipant: ParticipantDoc = participantMap.get(q.participantId) ?? {
        id: q.participantId,
        evaluationId,
        fullName: q.generalInfo.fullName,
        email: `${q.participantId}@innovation.edu`,
        schoolOrOrganization: q.generalInfo.schoolOrOrganization,
        gradeOrPosition: q.generalInfo.gradeOrPosition,
        questionnaireId: q.id,
        isSelected: false,
        selectionRank: null,
        role: null,
        createdAt: q.submittedAt,
        updatedAt: new Date().toISOString(),
      };

      const updatedParticipant = await upsertParticipantDoc({
        ...baseParticipant,
        role: roleProfile,
      });

      profiledParticipants.push(updatedParticipant);

      await appendAgentThought(
        evaluationId,
        {
          agentName: "student_profiling_agent",
          phase: "indexing",
          message: `Профилиран ${updatedParticipant.fullName} (${updatedParticipant.schoolOrOrganization}, ${updatedParticipant.gradeOrPosition}) → AI:${roleProfile.indices.AI} | EI:${roleProfile.indices.EI} | INI:${roleProfile.indices.INI} | ENI:${roleProfile.indices.ENI} | MI:${roleProfile.indices.MI} ⇒ TPS: ${roleProfile.tps} | 4H Роля: ${roleProfile.roleName} (${roleProfile.roleVoteBreakdown[roleProfile.roleId]}/4 гласа)`,
          metadata: {
            participantIds: [updatedParticipant.id],
          },
        },
        {
          metrics: {
            totalParticipants: questionnaires.length,
            profiledParticipants: profiledParticipants.length,
            selectedParticipants: 0,
            totalTeamsFormed: 0,
            confirmedTeamsCount: 0,
            averageCohortTPS: Number(
              (
                profiledParticipants.reduce(
                  (acc, p) => acc + (p.role?.tps ?? 0),
                  0
                ) / profiledParticipants.length
              ).toFixed(1)
            ),
            currentTbiSpread: 0,
          },
        }
      );
    }

    await delay(250);

    // Step 2: Descending sort by TPS with MI -> INI tie-breaking & Top-K cutoff
    const sortedParticipants = [...profiledParticipants].sort((a, b) => {
      const tpsA = a.role?.tps ?? 0;
      const tpsB = b.role?.tps ?? 0;
      if (tpsB !== tpsA) return tpsB - tpsA;
      const miA = a.role?.indices.MI ?? 0;
      const miB = b.role?.indices.MI ?? 0;
      if (miB !== miA) return miB - miA;
      const iniA = a.role?.indices.INI ?? 0;
      const iniB = b.role?.indices.INI ?? 0;
      return iniB - iniA;
    });

    const rankedParticipants: ParticipantDoc[] = [];
    for (let idx = 0; idx < sortedParticipants.length; idx++) {
      const p = sortedParticipants[idx]!;
      const rank = idx + 1;
      const isSelected = rank <= targetCohortSize;
      const saved = await upsertParticipantDoc({
        ...p,
        selectionRank: rank,
        isSelected,
      });
      rankedParticipants.push(saved);
    }

    const selectedCohort = rankedParticipants.filter((p) => p.isSelected && p.role !== null);
    const avgCohortTps =
      selectedCohort.length > 0
        ? Number(
            (
              selectedCohort.reduce((acc, p) => acc + (p.role?.tps ?? 0), 0) /
              selectedCohort.length
            ).toFixed(1)
          )
        : 0;

    await appendAgentThought(
      evaluationId,
      {
        agentName: "student_profiling_agent",
        phase: "selection_cutoff",
        message: `Класиране по TPS завършено (Tie-breaker: MI → INI). Селектирани ${selectedCohort.length} от ${rankedParticipants.length} кандидати (Top-${targetCohortSize}). Среден TPS на випуска: ${avgCohortTps} т.`,
        metadata: {
          participantIds: selectedCohort.map((p) => p.id),
        },
      },
      {
        status: "forming_teams",
        metrics: {
          totalParticipants: rankedParticipants.length,
          profiledParticipants: rankedParticipants.length,
          selectedParticipants: selectedCohort.length,
          totalTeamsFormed: 0,
          confirmedTeamsCount: 0,
          averageCohortTPS: avgCohortTps,
          currentTbiSpread: 0,
        },
      }
    );

    await delay(300);

    // Step 3: Agent 2 (`team_formation_agent`) 4H Role Distribution & Matrix Assembly
    const roleCounts: Record<Role4HId, number> = {
      hacker: 0,
      hipster: 0,
      hustler: 0,
      hound: 0,
    };
    for (const p of selectedCohort) {
      if (p.role) roleCounts[p.role.roleId] += 1;
    }

    await appendAgentThought(
      evaluationId,
      {
        agentName: "team_formation_agent",
        phase: "role_classification",
        message: `Стартиране на team_formation_agent. 4H разпределение в селектирания випуск: Hacker (${roleCounts.hacker}), Hipster (${roleCounts.hipster}), Hustler (${roleCounts.hustler}), Hound (${roleCounts.hound}).`,
      }
    );

    void runAgentPrompt(
      teamFormationAgent,
      JSON.stringify(
        selectedCohort.map((p) => ({
          id: p.id,
          fullName: p.fullName,
          schoolOrOrganization: p.schoolOrOrganization,
          gradeOrPosition: p.gradeOrPosition,
          role: p.role,
        }))
      )
    );

    await delay(250);

    // Build 4-person teams enforcing Constraint 1 (1 Hacker, 1 Hipster, 1 Hustler, 1 Hound)
    // and Constraint 2 (distinct schoolOrOrganization/gradeOrPosition)
    const unassigned = [...selectedCohort];
    const roleOrder: Role4HId[] = ["hacker", "hipster", "hustler", "hound"];
    const assembledTeams: TeamDoc[] = [];
    let teamIdx = 1;

    while (unassigned.length > 0) {
      const picked: ParticipantDoc[] = [];
      const usedCohorts = new Set<string>();

      for (const targetRole of roleOrder) {
        // Prefer candidate with matching role AND distinct school/grade cohort
        let candidateIdx = unassigned.findIndex(
          (u) =>
            u.role?.roleId === targetRole &&
            !usedCohorts.has(`${u.schoolOrOrganization}::${u.gradeOrPosition}`)
        );
        if (candidateIdx === -1) {
          candidateIdx = unassigned.findIndex((u) => u.role?.roleId === targetRole);
        }
        if (candidateIdx !== -1) {
          const chosen = unassigned.splice(candidateIdx, 1)[0]!;
          picked.push(chosen);
          usedCohorts.add(`${chosen.schoolOrOrganization}::${chosen.gradeOrPosition}`);
        }
      }

      // Fill any remaining slots up to 4
      while (picked.length < 4 && unassigned.length > 0) {
        const nextIdx = unassigned.findIndex(
          (u) => !usedCohorts.has(`${u.schoolOrOrganization}::${u.gradeOrPosition}`)
        );
        const chosen =
          nextIdx !== -1
            ? unassigned.splice(nextIdx, 1)[0]!
            : unassigned.shift()!;
        picked.push(chosen);
        usedCohorts.add(`${chosen.schoolOrOrganization}::${chosen.gradeOrPosition}`);
      }

      const members: TeamMemberSnapshot[] = picked.map((p) => ({
        participantId: p.id,
        fullName: p.fullName,
        email: p.email,
        schoolOrOrganization: p.schoolOrOrganization,
        gradeOrPosition: p.gradeOrPosition,
        questionnaireId: p.questionnaireId,
        role: p.role!,
      }));

      const metrics = computeTeamMetrics(members);
      const teamId = `${evaluationId}-team-${String(teamIdx).padStart(2, "0")}`;
      const teamName = `Отбор ${String(teamIdx).padStart(2, "0")}`;

      const teamDoc: TeamDoc = {
        id: teamId,
        evaluationId,
        name: teamName,
        status: "unconfirmed",
        compatibilityPercentage: metrics.compatibilityPercentage,
        roleBalance: metrics.roleBalance,
        averageTPS: metrics.averageTPS,
        diversityScore: metrics.diversityScore,
        teamBalanceIndex: metrics.teamBalanceIndex,
        formationExplanation: `4H баланс (${
          metrics.roleBalance.isComplete4H ? "Пълен 4/4: Hacker, Hipster, Hustler, Hound" : "Частичен"
        }), институционално разнообразие ${metrics.diversityScore}% и среден TPS ${metrics.averageTPS} т. (TBI: ${metrics.teamBalanceIndex}).`,
        members,
        confirmedBy: null,
        confirmedAt: null,
        createdAt: new Date().toISOString(),
      };

      assembledTeams.push(teamDoc);
      teamIdx++;
    }

    await appendAgentThought(
      evaluationId,
      {
        agentName: "team_formation_agent",
        phase: "matrix_assembly",
        message: `Сглобена първоначална матрица от ${assembledTeams.length} екипа по 4 участници със спазване на 4H ролеви баланс и институционално разнообразие.`,
        metadata: {
          teamIds: assembledTeams.map((t) => t.id),
        },
      }
    );

    await delay(250);

    // Step 4: Self-Healing Rebalancing Algorithm (Swap Loop for ΔTBI <= 15.0)
    const getSpread = (list: TeamDoc[]) => {
      if (list.length <= 1) return 0;
      const tbis = list.map((t) => t.teamBalanceIndex);
      return Number((Math.max(...tbis) - Math.min(...tbis)).toFixed(1));
    };

    let currentSpread = getSpread(assembledTeams);
    const maxSpread = evalDoc.config.maxTbiSpread || 15.0;
    let iteration = 0;

    while (currentSpread > maxSpread && iteration < 25 && assembledTeams.length > 1) {
      iteration++;
      const sortedTeams = [...assembledTeams].sort(
        (a, b) => b.teamBalanceIndex - a.teamBalanceIndex
      );
      const maxTeam = sortedTeams[0]!;
      const minTeam = sortedTeams[sortedTeams.length - 1]!;
      const deltaBefore = currentSpread;

      let swapped = false;
      for (let i = 0; i < maxTeam.members.length; i++) {
        const u = maxTeam.members[i]!;
        const j = minTeam.members.findIndex(
          (v) => v.role.roleId === u.role.roleId && u.role.tps > v.role.tps
        );
        if (j !== -1) {
          const v = minTeam.members[j]!;
          maxTeam.members[i] = v;
          minTeam.members[j] = u;

          Object.assign(maxTeam, computeTeamMetrics(maxTeam.members));
          Object.assign(minTeam, computeTeamMetrics(minTeam.members));
          currentSpread = getSpread(assembledTeams);
          swapped = true;

          await appendAgentThought(
            evaluationId,
            {
              agentName: "team_formation_agent",
              phase: "tbi_swap",
              message: `TBI Rebalancing Swap #${iteration}: Размяна на [${u.role.roleName}] ${u.fullName} (${maxTeam.name}) ↔ ${v.fullName} (${minTeam.name}). ΔTBI намален от ${deltaBefore} на ${currentSpread}.`,
              metadata: {
                participantIds: [u.participantId, v.participantId],
                teamIds: [maxTeam.id, minTeam.id],
                tbiDeltaBefore: deltaBefore,
                tbiDeltaAfter: currentSpread,
              },
            }
          );
          break;
        }
      }

      if (!swapped) break;
    }

    // Persist all formed teams to Firestore `teams/{teamId}`
    for (const team of assembledTeams) {
      await delay(200);
      team.formationExplanation = `4H Синергия (${team.members
        .map((m) => `${m.role.roleName}: ${m.fullName}`)
        .join(" • ")}) | TBI: ${team.teamBalanceIndex} | Съвместимост: ${team.compatibilityPercentage}% | Разнообразие: ${team.diversityScore}%.`;
      await upsertTeamDoc(team);

      await appendAgentThought(
        evaluationId,
        {
          agentName: "team_formation_agent",
          phase: "matrix_assembly",
          message: `Записан в Firestore ${team.name} (TBI: ${team.teamBalanceIndex}, Съвместимост: ${team.compatibilityPercentage}%) → ${team.members
            .map((m) => `${m.role.roleName}: ${m.fullName} (${m.role.tps})`)
            .join(", ")}`,
          metadata: {
            teamIds: [team.id],
            participantIds: team.members.map((m) => m.participantId),
          },
        }
      );
    }

    const finalSpread = getSpread(assembledTeams);

    await appendAgentThought(
      evaluationId,
      {
        agentName: "system",
        phase: "completed",
        message: `Двуфазният AI процес завърши успешно. Сформирани ${assembledTeams.length} балансирани 4H екипа (ΔTBI = ${finalSpread} <= ${maxSpread}). Очаква се потвърждение от администратор (awaiting_confirmation).`,
        metadata: {
          teamIds: assembledTeams.map((t) => t.id),
        },
      },
      {
        status: "awaiting_confirmation",
        teamIds: assembledTeams.map((t) => t.id),
        metrics: {
          totalParticipants: rankedParticipants.length,
          profiledParticipants: rankedParticipants.length,
          selectedParticipants: selectedCohort.length,
          totalTeamsFormed: assembledTeams.length,
          confirmedTeamsCount: assembledTeams.filter((t) => t.status === "confirmed").length,
          averageCohortTPS: avgCohortTps,
          currentTbiSpread: finalSpread,
        },
      }
    );
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : "Unknown pipeline error";
    await appendAgentThought(
      evaluationId,
      {
        agentName: "system",
        phase: "completed",
        message: `Грешка в AI пайплайна: ${errMsg}`,
      },
      {
        status: "error",
        errorMessage: errMsg,
      }
    );
  }
}

// ============================================================================
// REST API Endpoints
// ============================================================================

app.get("/api/health", (_req: Request, res: Response) => {
  const firestoreStatus = getFirestoreStatus();
  res.json({
    status: "ok",
    service: "ai-innovation-evaluator-server",
    timestamp: new Date().toISOString(),
    database: firestoreStatus,
    geminiConfigured: hasValidGeminiApiKey(),
    agents: [
      {
        name: studentProfilingAgent.name,
        role: "Student Profiling & Selection Agent",
        model: studentProfilingAgent.model,
        description: studentProfilingAgent.description,
      },
      {
        name: teamFormationAgent.name,
        role: "Team Formation & Quality Control Agent",
        model: teamFormationAgent.model,
        description: teamFormationAgent.description,
      },
    ],
  });
});

/**
 * POST /api/questionnaires
 * Receives a single questionnaire form submission OR a batch `{ evaluationId, questionnaires: [...] }` payload,
 * validates & transforms it into `QuestionnaireDoc` and `ParticipantDoc` (`role: null`),
 * and persists the documents to Cloud Firestore (`questionnaires`, `participants`, `evaluations`).
 */
app.post("/api/questionnaires", async (req: Request, res: Response) => {
  try {
    const body = req.body;

    // Support batch submission `{ questionnaires: [...], evaluationId?: string }` or array `[...]`
    if (Array.isArray(body) || Array.isArray(body?.questionnaires)) {
      const items: QuestionnaireSubmissionInput[] = Array.isArray(body)
        ? body
        : body.questionnaires;
      const evaluationId: string = body?.evaluationId || DEFAULT_EVALUATION_ID;

      if (items.length === 0) {
        res.status(400).json({ error: "No questionnaire submissions provided in batch." });
        return;
      }

      for (const item of items) {
        if (
          !item?.generalInfo?.fullName ||
          !item?.profileMetrics ||
          !item?.roleAssessmentAnswers
        ) {
          res.status(400).json({
            error:
              "Invalid questionnaire item: generalInfo.fullName, profileMetrics, and roleAssessmentAnswers are required.",
          });
          return;
        }
      }

      const result = await saveBatchQuestionnaireSubmissions(items, evaluationId);
      res.status(201).json({
        ok: true,
        count: result.questionnaires.length,
        evaluationId,
        questionnaires: result.questionnaires,
        participants: result.participants,
        evaluation: result.evaluation,
      });
      return;
    }

    // Single questionnaire submission
    const submission = body as QuestionnaireSubmissionInput;
    if (
      !submission?.generalInfo?.fullName ||
      !submission?.profileMetrics ||
      !submission?.roleAssessmentAnswers
    ) {
      res.status(400).json({
        error:
          "Invalid questionnaire submission: generalInfo.fullName, profileMetrics, and roleAssessmentAnswers are required.",
      });
      return;
    }

    const result = await saveQuestionnaireSubmission(submission);
    res.status(201).json({
      ok: true,
      questionnaire: result.questionnaire,
      participant: result.participant,
      evaluation: result.evaluation,
    });
  } catch (err) {
    console.error("Error saving questionnaire submission:", err);
    res.status(500).json({
      error: err instanceof Error ? err.message : "Failed to save questionnaire submission",
    });
  }
});

/**
 * GET /api/evaluations/:id
 * Returns the full evaluation snapshot (`evaluation`, `questionnaires`, `participants`, `teams`, `agentThoughts`)
 */
app.get("/api/evaluations/:id", async (req: Request, res: Response) => {
  const evaluationId = req.params.id || DEFAULT_EVALUATION_ID;
  const snapshot = await getFullEvaluationSnapshot(evaluationId);
  res.json(snapshot);
});

// Alias for legacy route `/api/submissions/:id`
app.get("/api/submissions/:id", async (req: Request, res: Response) => {
  const evaluationId = req.params.id || DEFAULT_EVALUATION_ID;
  const snapshot = await getFullEvaluationSnapshot(evaluationId);
  res.json(snapshot);
});

/**
 * POST /api/evaluations/start
 * Fire-and-Forget trigger: optionally ingests any new questionnaires passed in body,
 * transitions evaluation to `profiling_participants`, dispatches background ADK pipeline,
 * and returns HTTP 202 Accepted immediately.
 */
app.post("/api/evaluations/start", async (req: Request, res: Response) => {
  const { evaluationId, submissionId, questionnaires } = req.body as {
    evaluationId?: string;
    submissionId?: string;
    questionnaires?: QuestionnaireSubmissionInput[];
  };

  const targetEvaluationId = evaluationId || submissionId || DEFAULT_EVALUATION_ID;

  if (Array.isArray(questionnaires) && questionnaires.length > 0) {
    await saveBatchQuestionnaireSubmissions(questionnaires, targetEvaluationId);
  }

  await upsertEvaluationDoc(targetEvaluationId, {
    status: "profiling_participants",
    errorMessage: null,
  });

  res.status(202).json({
    ok: true,
    evaluationId: targetEvaluationId,
    status: "profiling_participants",
  });

  setImmediate(() => {
    executeEvaluationPipeline(targetEvaluationId).catch((err) => {
      console.error(`Background evaluation failed for ${targetEvaluationId}:`, err);
    });
  });
});

/**
 * POST /api/teams/:teamId/confirm
 * Human-in-the-Loop confirmation action for a formed team (`status: 'confirmed'`)
 */
app.post("/api/teams/:teamId/confirm", async (req: Request, res: Response) => {
  const { teamId } = req.params;
  const { evaluationId = DEFAULT_EVALUATION_ID, confirmedBy = "usr-admin-01" } = req.body as {
    evaluationId?: string;
    confirmedBy?: string;
  };

  const teams = await getTeamsByEvaluation(evaluationId);
  const target = teams.find((t) => t.id === teamId);
  if (!target) {
    res.status(404).json({ error: `Team '${teamId}' not found` });
    return;
  }

  const updatedTeam = await upsertTeamDoc({
    ...target,
    status: "confirmed",
    confirmedBy,
    confirmedAt: new Date().toISOString(),
  });

  const allTeams = await getTeamsByEvaluation(evaluationId);
  const confirmedCount = allTeams.filter((t) => t.status === "confirmed").length;
  const evalDoc =
    (await getEvaluationDoc(evaluationId)) ?? createDefaultEvaluationDoc(evaluationId);

  const allConfirmed = allTeams.length > 0 && confirmedCount === allTeams.length;
  const updatedEval: EvaluationDoc = await upsertEvaluationDoc(evaluationId, {
    status: allConfirmed ? "completed" : evalDoc.status,
    metrics: {
      ...evalDoc.metrics,
      confirmedTeamsCount: confirmedCount,
    },
  });

  res.json({
    ok: true,
    team: updatedTeam,
    evaluation: updatedEval,
  });
});

/**
 * POST /api/teams/swap
 * Swaps two participants with the same 4H role between two teams (or with a reserve participant),
 * recalculating averageTPS, diversityScore, compatibilityPercentage, and teamBalanceIndex.
 */
app.post("/api/teams/swap", async (req: Request, res: Response) => {
  try {
    const {
      evaluationId = DEFAULT_EVALUATION_ID,
      sourceTeamId,
      sourceParticipantId,
      targetParticipantId,
    } = req.body as {
      evaluationId?: string;
      sourceTeamId: string;
      sourceParticipantId: string;
      targetParticipantId: string;
    };

    if (!sourceTeamId || !sourceParticipantId || !targetParticipantId) {
      res.status(400).json({
        error: "sourceTeamId, sourceParticipantId, and targetParticipantId are required.",
      });
      return;
    }

    const teams = await getTeamsByEvaluation(evaluationId);
    const participants = await getParticipantsByEvaluation(evaluationId);

    const sourceTeam = teams.find((t) => t.id === sourceTeamId);
    if (!sourceTeam) {
      res.status(404).json({ error: `Source team '${sourceTeamId}' not found.` });
      return;
    }

    const sourceIdx = sourceTeam.members.findIndex(
      (m) => m.participantId === sourceParticipantId
    );
    if (sourceIdx === -1) {
      res.status(404).json({
        error: `Participant '${sourceParticipantId}' not found in team '${sourceTeamId}'.`,
      });
      return;
    }

    const sourceMember = sourceTeam.members[sourceIdx]!;
    const targetTeam = teams.find((t) =>
      t.members.some((m) => m.participantId === targetParticipantId)
    );

    if (targetTeam) {
      const targetIdx = targetTeam.members.findIndex(
        (m) => m.participantId === targetParticipantId
      );
      const targetMember = targetTeam.members[targetIdx]!;

      sourceTeam.members[sourceIdx] = targetMember;
      targetTeam.members[targetIdx] = sourceMember;

      const sourceMetrics = computeTeamMetrics(sourceTeam.members);
      Object.assign(sourceTeam, sourceMetrics, {
        formationExplanation: `4H Синергия (${sourceTeam.members
          .map((m) => `${m.role.roleName}: ${m.fullName}`)
          .join(" • ")}) | TBI: ${sourceMetrics.teamBalanceIndex} | Съвместимост: ${sourceMetrics.compatibilityPercentage}% | Разнообразие: ${sourceMetrics.diversityScore}%.`,
      });

      const targetMetrics = computeTeamMetrics(targetTeam.members);
      Object.assign(targetTeam, targetMetrics, {
        formationExplanation: `4H Синергия (${targetTeam.members
          .map((m) => `${m.role.roleName}: ${m.fullName}`)
          .join(" • ")}) | TBI: ${targetMetrics.teamBalanceIndex} | Съвместимост: ${targetMetrics.compatibilityPercentage}% | Разнообразие: ${targetMetrics.diversityScore}%.`,
      });

      await Promise.all([upsertTeamDoc(sourceTeam), upsertTeamDoc(targetTeam)]);
    } else {
      // Target is an unassigned / reserve participant
      const reserveDoc = participants.find((p) => p.id === targetParticipantId);
      if (!reserveDoc || !reserveDoc.role) {
        res.status(404).json({
          error: `Target participant '${targetParticipantId}' not found or not profiled.`,
        });
        return;
      }

      const reserveSnapshot: TeamMemberSnapshot = {
        participantId: reserveDoc.id,
        fullName: reserveDoc.fullName,
        email: reserveDoc.email,
        schoolOrOrganization: reserveDoc.schoolOrOrganization,
        gradeOrPosition: reserveDoc.gradeOrPosition,
        questionnaireId: reserveDoc.questionnaireId,
        role: reserveDoc.role,
      };

      sourceTeam.members[sourceIdx] = reserveSnapshot;
      const sourceMetrics = computeTeamMetrics(sourceTeam.members);
      Object.assign(sourceTeam, sourceMetrics, {
        formationExplanation: `4H Синергия (${sourceTeam.members
          .map((m) => `${m.role.roleName}: ${m.fullName}`)
          .join(" • ")}) | TBI: ${sourceMetrics.teamBalanceIndex} | Съвместимост: ${sourceMetrics.compatibilityPercentage}% | Разнообразие: ${sourceMetrics.diversityScore}%.`,
      });

      await upsertTeamDoc(sourceTeam);
    }

    const updatedTeams = await getTeamsByEvaluation(evaluationId);
    const tbis = updatedTeams.map((t) => t.teamBalanceIndex);
    const currentTbiSpread =
      tbis.length > 1
        ? Number((Math.max(...tbis) - Math.min(...tbis)).toFixed(1))
        : 0;

    const evalDoc =
      (await getEvaluationDoc(evaluationId)) ?? createDefaultEvaluationDoc(evaluationId);
    const updatedEval = await upsertEvaluationDoc(evaluationId, {
      metrics: {
        ...evalDoc.metrics,
        currentTbiSpread,
      },
    });

    res.json({
      ok: true,
      teams: updatedTeams,
      evaluation: updatedEval,
    });
  } catch (err) {
    res.status(500).json({
      error: err instanceof Error ? err.message : "Failed to swap team members",
    });
  }
});

app.listen(PORT, () => {
  const dbStatus = getFirestoreStatus();
  console.log(`Server listening on http://localhost:${PORT}`);
  console.log(
    `Database mode: ${dbStatus.mode} (driver: ${dbStatus.driver}, project: ${dbStatus.projectId})`
  );
  console.log(
    `Registered ADK Agents: ${studentProfilingAgent.name}, ${teamFormationAgent.name}`
  );
});
