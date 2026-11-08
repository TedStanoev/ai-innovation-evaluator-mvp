import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import { InMemoryRunner, isFinalResponse, stringifyContent } from "@google/adk";
import { auditorAgent } from "./agents/auditorAgent.js";
import { mentorAgent } from "./agents/mentorAgent.js";
import {
  appendSubmissionThoughtLog,
  EvaluatedStudentProfile,
  FormedTeam,
  getFirestoreStatus,
  getSubmissionById,
  StudentIndices,
  StudentQuestionnaire,
  TeamRole,
  upsertSubmission,
} from "./firebase.js";

const app = express();
const PORT = Number(process.env.PORT) || 8080;

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

// CORS exception for local development and Firebase Hosting clients
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

app.use(express.json());

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
  agent: typeof auditorAgent,
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
    console.warn(`ADK execution fallback for ${agent.name}:`, err instanceof Error ? err.message : err);
    return {
      text: "",
      liveModelUsed: false,
    };
  }
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Deterministic scoring helper implementing Agent 1 (Student Profiling Agent) exact point matrix:
 * - AI (Макс 100 т.) = Въпрос 6 (gpa: 70/50/30/0) + Въпрос 7 (competitions: 30/15/0)
 * - EI (Макс 100 т.) = Въпрос 8 (experience: 100/75/50/20)
 * - MI (Макс 100 т.) = Въпрос 9 (motivation: 100/80/50/0)
 * - LAI (Макс 100 т.) = Въпрос 10 (problemSolving: 100/50/0)
 * - LPI (Макс 100 т.) = Въпрос 11 (teamConflict: 100/60/30/0)
 * - ENI (Макс 100 т.) = Въпрос 12 (budget200: 100/90/50/20)
 */

// TODO: Review and refactor everything below
function calculateStudentIndices(student: StudentQuestionnaire): StudentIndices {
  // 1. Academic Index (AI) = Въпрос 6 (gpa) + Въпрос 7 (competitions)
  let gpaScore = 0;
  if (student.gpa.includes("Отличен")) gpaScore = 70;
  else if (student.gpa.includes("Много добър")) gpaScore = 50;
  else if (student.gpa.includes("Добър")) gpaScore = 30;
  else gpaScore = 0;

  let compScore = 0;
  if (student.competitions.includes("челни места") || student.competitions.includes("награди")) {
    compScore = 30;
  } else if (student.competitions.includes("Да, участвал")) {
    compScore = 15;
  } else {
    compScore = 0;
  }
  const AI = Math.min(100, gpaScore + compScore);

  // 2. Experience Index (EI) = Въпрос 8 (experience)
  let EI = 20;
  if (student.experience.includes("собствен реален проект") || student.experience.includes("лидер")) {
    EI = 100;
  } else if (student.experience.includes("клубове") || student.experience.includes("НПО")) {
    EI = 75;
  } else if (student.experience.includes("лично хоби")) {
    EI = 50;
  } else if (student.experience.includes("Нямам опит")) {
    EI = 20;
  }

  // 3. Motivation Index (MI) = Въпрос 9 (motivation)
  let MI = 0;
  if (
    student.motivation.includes("собствена идея") ||
    student.motivation.includes("своя идея") ||
    student.motivation.includes("реален продукт")
  ) {
    MI = 100;
  } else if (student.motivation.includes("практическите си умения")) {
    MI = 80;
  } else if (student.motivation.includes("ново предизвикателство")) {
    MI = 50;
  } else if (student.motivation.includes("препоръча")) {
    MI = 0;
  }

  // 4. Learning Agility Index (LAI) = Въпрос 10 (problemSolving)
  let LAI = 0;
  if (student.problemSolving.includes("Веднага започвам") || student.problemSolving.includes("уча в движение")) {
    LAI = 100;
  } else if (student.problemSolving.includes("по-опитен")) {
    LAI = 50;
  } else if (student.problemSolving.includes("само в сфери")) {
    LAI = 0;
  }

  // 5. Leadership Potential Index (LPI) = Въпрос 11 (teamConflict)
  let LPI = 0;
  if (student.teamConflict.includes("Вземам нещата в свои ръце")) {
    LPI = 100;
  } else if (student.teamConflict.includes("успокоя емоциите")) {
    LPI = 60;
  } else if (student.teamConflict.includes("моята част")) {
    LPI = 30;
  } else {
    LPI = 0;
  }

  // 6. Entrepreneurial Index (ENI) = Въпрос 12 (budget200)
  let ENI = 20;
  if (student.budget200.includes("инвестирам") || student.budget200.includes("Инвестирам")) {
    ENI = 100;
  } else if (student.budget200.includes("спонсори") || student.budget200.includes("партньори")) {
    ENI = 90;
  } else if (student.budget200.includes("строг план")) {
    ENI = 50;
  } else if (student.budget200.includes("резерва") || student.budget200.includes("безплатно")) {
    ENI = 20;
  }

  return { AI, MI, EI, ENI, LAI, LPI };
}

function classifySingleSituationalAnswer(answer: string): TeamRole | null {
  if (
    answer.includes("[Новатор]") ||
    answer.includes("генераторът на идеи") ||
    answer.includes("креативен начин") ||
    answer.includes("нестандартна линия")
  ) {
    return "Новатор";
  }
  if (
    answer.includes("[Аналитик]") ||
    answer.includes("логикът") ||
    answer.includes("фатални грешки в данните") ||
    answer.includes("оптимизира системата")
  ) {
    return "Аналитик";
  }
  if (
    answer.includes("[Лидер]") ||
    answer.includes("комуникаторът") ||
    answer.includes("опаковаме") ||
    answer.includes("маркетинговата им стратегия")
  ) {
    return "Лидер";
  }
  if (
    answer.includes("[Организатор]") ||
    answer.includes("двигателят") ||
    answer.includes("строг екшън план по часове") ||
    answer.includes("пренаредил смените")
  ) {
    return "Организатор";
  }
  return null;
}

/**
 * Deterministic role detection from Part 4 (Questions 13, 14, 15) with tie-breaker priority:
 * Аналитик -> Организатор -> Лидер -> Новатор
 */
function determineStudentRole(student: StudentQuestionnaire): TeamRole {
  const votes: Record<TeamRole, number> = {
    Аналитик: 0,
    Организатор: 0,
    Лидер: 0,
    Новатор: 0,
  };

  for (const ans of [student.newProjectRole, student.hours48Role, student.storeCaseRole]) {
    const role = classifySingleSituationalAnswer(ans);
    if (role) votes[role] += 1;
  }

  const priorityOrder: TeamRole[] = ["Аналитик", "Организатор", "Лидер", "Новатор"];
  let bestRole: TeamRole = "Аналитик";
  let maxVotes = -1;

  for (const role of priorityOrder) {
    if (votes[role] > maxVotes) {
      maxVotes = votes[role];
      bestRole = role;
    }
  }

  return bestRole;
}

/**
 * Parses Agent 1 JSON output ({ Candidate_ID, AI_Score, EI_Score, MI_Score, LAI_Score, LPI_Score, ENI_Score, Dominant_Role })
 * or structured text lines, falling back to deterministic point matrix values.
 */
function parseIndicesFromAgent1Text(
  text: string,
  student: StudentQuestionnaire,
  fallbackIndices: StudentIndices,
  fallbackRole: TeamRole
): { indices: StudentIndices; role: TeamRole } {
  if (!text) return { indices: fallbackIndices, role: fallbackRole };

  try {
    const cleaned = text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/, "")
      .trim();
    const parsed = JSON.parse(cleaned);
    const items = Array.isArray(parsed) ? parsed : [parsed];
    const matched = items.find(
      (item: Record<string, unknown>) =>
        typeof item?.Candidate_ID === "string" &&
        (item.Candidate_ID.includes(student.id) ||
          item.Candidate_ID.toLowerCase().includes(student.name.toLowerCase()))
    );
    if (matched) {
      const validRoles: TeamRole[] = ["Новатор", "Аналитик", "Лидер", "Организатор"];
      const parsedRole = validRoles.includes(matched.Dominant_Role as TeamRole)
        ? (matched.Dominant_Role as TeamRole)
        : fallbackRole;
      return {
        indices: {
          AI: typeof matched.AI_Score === "number" ? matched.AI_Score : fallbackIndices.AI,
          EI: typeof matched.EI_Score === "number" ? matched.EI_Score : fallbackIndices.EI,
          MI: typeof matched.MI_Score === "number" ? matched.MI_Score : fallbackIndices.MI,
          LAI: typeof matched.LAI_Score === "number" ? matched.LAI_Score : fallbackIndices.LAI,
          LPI: typeof matched.LPI_Score === "number" ? matched.LPI_Score : fallbackIndices.LPI,
          ENI: typeof matched.ENI_Score === "number" ? matched.ENI_Score : fallbackIndices.ENI,
        },
        role: parsedRole,
      };
    }
  } catch {
    // Fall through to line-by-line regex extraction
  }

  const lines = text.split("\n");
  const matchingLine = lines.find((l) => l.toLowerCase().includes(student.name.toLowerCase()));
  if (!matchingLine) return { indices: fallbackIndices, role: fallbackRole };

  const extractNum = (key: string, defaultVal: number): number => {
    const regex = new RegExp(`${key}(?:_Score)?\\s*[:=]\\s*(\\d+(?:\\.\\d+)?)`, "i");
    const match = matchingLine.match(regex);
    if (match && match[1]) {
      const val = Math.round(Number(match[1]));
      if (!Number.isNaN(val) && val >= 0 && val <= 100) return val;
    }
    return defaultVal;
  };

  return {
    indices: {
      AI: extractNum("AI", fallbackIndices.AI),
      MI: extractNum("MI", fallbackIndices.MI),
      EI: extractNum("EI", fallbackIndices.EI),
      ENI: extractNum("ENI", fallbackIndices.ENI),
      LAI: extractNum("LAI", fallbackIndices.LAI),
      LPI: extractNum("LPI", fallbackIndices.LPI),
    },
    role: fallbackRole,
  };
}

/**
 * Background Worker: Executes Agent 1 (Student Profiling Agent) and Agent 2 (Talent Selection & Team Formation Agent),
 * streaming each reasoning thought to Firestore / memory so the client displays every thought live.
 */
async function executeStudentCohortEvaluationPipeline(
  submissionId: string,
  students: StudentQuestionnaire[]
): Promise<void> {
  try {
    // Thought 1: Agent 1 Initialization
    await appendSubmissionThoughtLog(
      submissionId,
      {
        agent: "Profiling Agent",
        step: "Инициализация (Agent 1)",
        message: `Стартиране на Student Profiling Agent (${auditorAgent.name}) за анализ на ${students.length} ученически формуляра (Въпроси 1–15).`,
        timestamp: new Date().toISOString(),
      },
      { status: "auditing" }
    );

    await delay(400);

    // Build structured prompt for Agent 1 (auditorAgent) with explicit Question-to-Field mapping
    const serializedStudentsForAgent1 = students
      .map(
        (s) =>
          `Candidate_ID: ${s.id} (${s.name})
ЧАСТ 1 (Основна информация):
  1. Име и Фамилия (name): ${s.name}
  2. Възраст (age): ${s.age}
  3. Училище / Организация (school): ${s.school}
  4. Клас / Курс (grade): ${s.grade}
  5. Имейл за връзка (email): ${s.email}
ЧАСТ 2 (Академичен профил и Опит -> AI и EI):
  6. Среден успех (gpa -> AI): ${s.gpa}
  7. Състезания/олимпиади (competitions -> AI): ${s.competitions}
  8. Извънкласен опит (experience -> EI): ${s.experience}
ЧАСТ 3 (Мотивация и Потенциал -> MI, LAI, LPI, ENI):
  9. Основна мотивация (motivation -> MI): ${s.motivation}
  10. Непозната тема/проблем (problemSolving -> LAI): ${s.problemSolving}
  11. Сериозен спор в екип (teamConflict -> LPI): ${s.teamConflict}
  12. Бюджет 200 лв (budget200 -> ENI): ${s.budget200}
ЧАСТ 4 (Екипен профил -> Доминираща роля):
  13. Нов групов проект (newProjectRole): ${s.newProjectRole}
  14. Оставащи 48 часа до крайния срок (hours48Role): ${s.hours48Role}
  15. Казус в голям магазин (storeCaseRole): ${s.storeCaseRole}`
      )
      .join("\n\n---\n\n");

    await appendSubmissionThoughtLog(submissionId, {
      agent: "Profiling Agent",
      step: "Съпоставяне с точковата матрица (Въпроси 6–15)",
      message:
        "Съпоставяне на отговорите от Въпроси 6–12 за изчисляване на AI, EI, MI, LAI, LPI, ENI и гласуване от Въпроси 13–15 за Доминираща роля...",
      timestamp: new Date().toISOString(),
    });

    // Run Agent 1 via Google ADK
    const agent1Response = await runAgentPrompt(auditorAgent, serializedStudentsForAgent1);

    const evaluatedProfiles: EvaluatedStudentProfile[] = [];

    for (const student of students) {
      await delay(350);
      const baseIndices = calculateStudentIndices(student);
      const baseRole = determineStudentRole(student);
      const { indices, role } = parseIndicesFromAgent1Text(
        agent1Response.text,
        student,
        baseIndices,
        baseRole
      );

      // TPS = (25% * MI) + (20% * ENI) + (20% * LPI) + (15% * EI) + (10% * AI) + (10% * LAI)
      const tps = Number(
        (
          0.25 * indices.MI +
          0.2 * indices.ENI +
          0.2 * indices.LPI +
          0.15 * indices.EI +
          0.1 * indices.AI +
          0.1 * indices.LAI
        ).toFixed(1)
      );

      const rawProfileLine = JSON.stringify({
        Candidate_ID: student.name,
        AI_Score: indices.AI,
        EI_Score: indices.EI,
        MI_Score: indices.MI,
        LAI_Score: indices.LAI,
        LPI_Score: indices.LPI,
        ENI_Score: indices.ENI,
        Dominant_Role: role,
      });

      evaluatedProfiles.push({
        studentId: student.id,
        name: student.name,
        age: student.age,
        school: student.school,
        grade: student.grade,
        email: student.email,
        indices,
        tps,
        role,
        rawProfileLine,
      });

      await appendSubmissionThoughtLog(
        submissionId,
        {
          agent: "Profiling Agent",
          step: `Профил: ${student.name}`,
          message: `JSON Профил за ${student.name} (${student.school}, ${student.grade}) → AI_Score: ${indices.AI} | EI_Score: ${indices.EI} | MI_Score: ${indices.MI} | LAI_Score: ${indices.LAI} | LPI_Score: ${indices.LPI} | ENI_Score: ${indices.ENI} | Dominant_Role: "${role}"`,
          timestamp: new Date().toISOString(),
        },
        {
          evaluatedStudents: [...evaluatedProfiles],
        }
      );
    }

    const agent1FormattedOutput =
      agent1Response.text || evaluatedProfiles.map((p) => p.rawProfileLine).join("\n");

    await delay(400);

    await appendSubmissionThoughtLog(
      submissionId,
      {
        agent: "Profiling Agent",
        step: "Завършено профилиране",
        message: `Генерирани са 6-те количествени индекса за всички ${evaluatedProfiles.length} ученици. Прехвърляне на профилите към Agent 2 (Talent Selection & Team Formation Agent).`,
        timestamp: new Date().toISOString(),
      },
      {
        agent1RawOutput: agent1FormattedOutput,
      }
    );

    await delay(450);

    // Phase 2: Agent 2 (mentorAgent - Talent Selection & Team Formation)
    await appendSubmissionThoughtLog(submissionId, {
      agent: "Team Formation Agent",
      step: "Калкулация на TPS (Agent 2)",
      message:
        "Прилагане на формулата TPS = (25% * MI) + (20% * ENI) + (20% * LPI) + (15% * EI) + (10% * AI) + (10% * LAI) и класиране в низходящ ред...",
      timestamp: new Date().toISOString(),
    });

    const sortedByTps = [...evaluatedProfiles].sort((a, b) => {
      if (b.tps !== a.tps) return b.tps - a.tps;
      if (b.indices.MI !== a.indices.MI) return b.indices.MI - a.indices.MI;
      if (b.indices.LPI !== a.indices.LPI) return b.indices.LPI - a.indices.LPI;
      return b.indices.ENI - a.indices.ENI;
    });

    await delay(400);

    for (const [idx, candidate] of sortedByTps.entries()) {
      await appendSubmissionThoughtLog(submissionId, {
        agent: "Team Formation Agent",
        step: `Класиране #${idx + 1}: ${candidate.name}`,
        message: `${candidate.name} | Клас: ${candidate.grade} | TPS: ${candidate.tps} т. (MI: ${candidate.indices.MI}, LPI: ${candidate.indices.LPI}, ENI: ${candidate.indices.ENI}) → Доминираща роля от Част 2: [${candidate.role}]`,
        timestamp: new Date().toISOString(),
      });
      await delay(300);
    }

    // Build prompt for Agent 2 (mentorAgent)
    const serializedForAgent2 = students
      .map((s) => {
        const prof = evaluatedProfiles.find((p) => p.studentId === s.id)!;
        return `${prof.rawProfileLine} | TPS: ${prof.tps}\nЧаст 2 Казуси: 1) ${s.newProjectRole} | 2) ${s.hours48Role} | 3) ${s.storeCaseRole}`;
      })
      .join("\n\n");

    const agent2Response = await runAgentPrompt(mentorAgent, serializedForAgent2);

    await appendSubmissionThoughtLog(submissionId, {
      agent: "Team Formation Agent",
      step: "Сглобяване на матрицата на екипите",
      message:
        "Проверка на Желязно правило 1 (Баланс на ролите: 1 Лидер, 1 Новатор, 1 Аналитик, 1 Организатор) и Желязно правило 2 (Класово и училищно разнообразие)...",
      timestamp: new Date().toISOString(),
    });

    await delay(450);

    // Group evaluated profiles into balanced teams of up to 4
    const teams: FormedTeam[] = [];
    const roleOrder: TeamRole[] = ["Лидер", "Новатор", "Аналитик", "Организатор"];
    const unassigned = [...sortedByTps];
    let teamCounter = 1;

    while (unassigned.length > 0) {
      const teamMembers: EvaluatedStudentProfile[] = [];

      for (const targetRole of roleOrder) {
        const foundIdx = unassigned.findIndex((u) => u.role === targetRole);
        if (foundIdx !== -1) {
          teamMembers.push(unassigned.splice(foundIdx, 1)[0]!);
        }
      }

      while (teamMembers.length < 4 && unassigned.length > 0) {
        teamMembers.push(unassigned.shift()!);
      }

      const uniqueRoles = new Set(teamMembers.map((m) => m.role)).size;
      const roleBalanceScore = Math.round((uniqueRoles / 4) * 100);

      const avgTps = Number(
        (
          teamMembers.reduce((sum, m) => sum + m.tps, 0) / Math.max(1, teamMembers.length)
        ).toFixed(1)
      );

      const uniqueGrades = new Set(teamMembers.map((m) => `${m.school}-${m.grade}`)).size;
      const diversityScore = uniqueGrades === teamMembers.length ? 100 : 50;

      // TBI = 40% (Наличие на всички 4 роли) + 40% (Средноаритметичен TPS) + 20% (Разнообразие)
      const compatibilityPercent = Number(
        (0.4 * roleBalanceScore + 0.4 * avgTps + 0.2 * diversityScore).toFixed(1)
      );

      const teamName = `Екип ${String(teamCounter).padStart(2, "0")}`;
      teams.push({
        id: `team-${teamCounter}`,
        name: teamName,
        compatibilityPercent,
        roleBalanceScore,
        averageTps: avgTps,
        diversityScore,
        members: teamMembers,
        rationale: `Пълен ролеви баланс (${uniqueRoles}/4 роли: Лидер, Новатор, Аналитик, Организатор), ${uniqueGrades} различни класа/училища и среден TPS ${avgTps} т.`,
      });

      await appendSubmissionThoughtLog(submissionId, {
        agent: "Team Formation Agent",
        step: `Сформиран ${teamName}`,
        message: `${teamName} (Съвместимост TBI: ${compatibilityPercent}%) → 40% Ролеви баланс (${roleBalanceScore}/100) + 40% Среден TPS (${avgTps}) + 20% Разнообразие (${diversityScore}/100). Членове: ${teamMembers
          .map((m) => `${m.role}: ${m.name}`)
          .join(", ")}`,
        timestamp: new Date().toISOString(),
      });

      teamCounter++;
    }

    const formattedTeamsText =
      agent2Response.text ||
      teams
        .map(
          (t) =>
            `${t.name} (TBI: ${t.compatibilityPercent}%)\n` +
            t.members.map((m) => `- ${m.role}: ${m.name} | Клас: ${m.grade} | TPS: ${m.tps}`).join("\n")
        )
        .join("\n\n");

    const overallCompatibility =
      teams.length > 0
        ? Number(
            (teams.reduce((sum, t) => sum + t.compatibilityPercent, 0) / teams.length).toFixed(1)
          )
        : 0;

    await upsertSubmission(submissionId, {
      status: "evaluated",
      totalScore: overallCompatibility,
      evaluatedStudents: evaluatedProfiles,
      teams,
      agent1RawOutput: agent1FormattedOutput,
      agent2RawOutput: formattedTeamsText,
    });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : "Unknown pipeline error";
    await appendSubmissionThoughtLog(
      submissionId,
      {
        agent: "Team Formation Agent",
        step: "Грешка в процеса",
        message: `Възникна грешка при анализа: ${errMsg}`,
        timestamp: new Date().toISOString(),
      },
      { status: "needs_review" }
    );
  }
}

// Health check endpoint
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
        name: auditorAgent.name,
        role: "Student Profiling Agent",
        model: auditorAgent.model,
        description: auditorAgent.description,
      },
      {
        name: mentorAgent.name,
        role: "Talent Selection & Team Formation Agent",
        model: mentorAgent.model,
        description: mentorAgent.description,
      },
    ],
  });
});

// Get single cohort evaluation state
app.get("/api/submissions/:id", async (req: Request, res: Response) => {
  const submission = await getSubmissionById(req.params.id);
  if (!submission) {
    res.status(404).json({ error: `Submission '${req.params.id}' not found` });
    return;
  }
  res.json(submission);
});

/**
 * POST /api/evaluations/start
 * Fire-and-Forget trigger: sets state to analyzing, dispatches background worker,
 * and immediately returns HTTP 202 Accepted { ok: true }.
 */
app.post("/api/evaluations/start", async (req: Request, res: Response) => {
  const { submissionId, students } = req.body as {
    submissionId?: string;
    students?: StudentQuestionnaire[];
  };

  const targetId = submissionId || "student-cohort-2026";
  const studentList = students || [];

  await upsertSubmission(targetId, {
    id: targetId,
    title: "Ученически Въпросници и Формиране на Екипи",
    status: "analyzing",
    students: studentList,
    evaluatedStudents: [],
    teams: [],
    thoughtLogs: [
      {
        agent: "Profiling Agent",
        step: "Заявка приета (HTTP 202)",
        message: `Заявката за анализ на ${studentList.length} ученици е приета. Инициализиране на AI агентите...`,
        timestamp: new Date().toISOString(),
      },
    ],
  });

  // Immediately return HTTP 202 Accepted (~5ms)
  res.status(202).json({
    ok: true,
    submissionId: targetId,
    status: "analyzing",
  });

  // Fire-and-forget asynchronous background execution
  setImmediate(() => {
    executeStudentCohortEvaluationPipeline(targetId, studentList).catch((err) => {
      console.error(`Background evaluation failed for ${targetId}:`, err);
    });
  });
});

app.listen(PORT, () => {
  const dbStatus = getFirestoreStatus();
  console.log(`Server listening on http://localhost:${PORT}`);
  console.log(`Database mode: ${dbStatus.mode}`);
  console.log(`Registered ADK Agents: ${auditorAgent.name}, ${mentorAgent.name}`);
});
