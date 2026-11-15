import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  ArrowUpDown,
  Sparkles,
  Users,
  UserCheck,
  FileText,
  ExternalLink,
  Minimize2,
  Check,
  Pencil,
  ArrowLeftRight,
  X,
  RotateCw,
  CheckCircle2,
  School,
  Mail,
  TrendingUp,
  PlusCircle,
  Code2,
  Paintbrush,
  Lightbulb,
  Zap,
  ShieldCheck,
} from "lucide-react";
import {
  AgentThoughtDoc,
  EvaluationDoc,
  EvaluationPipelineStatus,
  ParticipantDoc,
  ParticipantRoleProfile,
  QuestionnaireDoc,
  QuestionnaireSubmissionInput,
  Role4HId,
  Role4HName,
  TeamDoc,
  TeamMemberSnapshot,
} from "../types";
import { ContestItem, mockQuestionnaires } from "../data/mockStudents";
import {
  confirmTeamInEvaluation,
  startCohortEvaluation,
  submitQuestionnaireForm,
  swapTeamMembersInEvaluation,
} from "../utils/api";
import { subscribeToEvaluationSnapshot } from "../utils/firebase";

export type ActiveTab = "participants" | "teams" | "questionnaire";
type SortField = "tps_desc" | "name_asc" | "gpa_desc" | "role_asc";

interface StudentTeamBuilderViewProps {
  activeContest: ContestItem;
  onAgentStatusChange?: (
    status: EvaluationPipelineStatus,
    thoughts: AgentThoughtDoc[]
  ) => void;
  onAutoOpenInspector?: () => void;
}

/**
 * 4H Role Background, Badge Color Coding & Icons
 * Matched to `/plans/design-context.md` (Aura Acrylic / Hyper-Modern Glass)
 */
export const ROLE_4H_THEME: Record<
  Role4HId,
  {
    name: Role4HName;
    rowBg: string;
    iconBox: string;
    badge: string;
    scoreText: string;
    barColor: string;
    strengthsList: string[];
    Icon: React.ComponentType<{ className?: string }>;
  }
> = {
  hacker: {
    name: "Hacker",
    rowBg: "bg-sky-50/75 border-sky-100/90 text-[#0b1c30]",
    iconBox: "bg-sky-100/90 text-sky-600 border-sky-200/60",
    badge: "bg-sky-100/90 text-sky-700 border-sky-200",
    scoreText: "text-sky-600",
    barColor: "bg-sky-500",
    strengthsList: [
      "Логика и програмиране",
      "Техническо изпълнение и прототипиране",
    ],
    Icon: Code2,
  },
  hipster: {
    name: "Hipster",
    rowBg: "bg-purple-50/75 border-purple-100/90 text-[#0b1c30]",
    iconBox: "bg-purple-100/90 text-purple-600 border-purple-200/60",
    badge: "bg-purple-100/90 text-purple-700 border-purple-200",
    scoreText: "text-purple-600",
    barColor: "bg-purple-500",
    strengthsList: [
      "UI/UX дизайн и визуална идентичност",
      "Потребителско преживяване",
    ],
    Icon: Paintbrush,
  },
  hustler: {
    name: "Hustler",
    rowBg: "bg-amber-50/75 border-amber-100/90 text-[#0b1c30]",
    iconBox: "bg-amber-100/90 text-amber-600 border-amber-200/60",
    badge: "bg-amber-100/90 text-amber-700 border-amber-200",
    scoreText: "text-amber-600",
    barColor: "bg-amber-500",
    strengthsList: [
      "Бизнес стратегия и продуктово лидерство",
      "Пазарна валидация и комуникация",
    ],
    Icon: Zap,
  },
  hound: {
    name: "Hound",
    rowBg: "bg-emerald-50/75 border-emerald-100/90 text-[#0b1c30]",
    iconBox: "bg-emerald-100/90 text-emerald-600 border-emerald-200/60",
    badge: "bg-emerald-100/90 text-emerald-700 border-emerald-200",
    scoreText: "text-emerald-600",
    barColor: "bg-emerald-500",
    strengthsList: [
      "Финансово структуриране и планиране",
      "Управление на срокове и координация",
    ],
    Icon: Lightbulb,
  },
};

const MOTIVATION_OPTIONS: { value: 1 | 2 | 3 | 4 | 5; label: string }[] = [
  {
    value: 5,
    label:
      "Имам конкретна идея или ясна цел и търся екип и ресурси, за да я реализирам напълно.",
  },
  {
    value: 4,
    label:
      "Искам да развия специфични умения и да създам ценни контакти за бъдещата си кариера.",
  },
  {
    value: 3,
    label:
      "Темата ми звучи интересно и искам да видя как протича един бизнес формат на практика.",
  },
  {
    value: 2,
    label:
      "Учители или приятели ме посъветваха да се запиша, затова реших да пробвам.",
  },
  {
    value: 1,
    label:
      "Търся разнообразие и начин да изляза от рутината на стандартното ежедневие.",
  },
];

const INITIATIVE_OPTIONS: { value: 1 | 2 | 3 | 4 | 5; label: string }[] = [
  {
    value: 5,
    label:
      "Веднага анализирам ситуацията, предлагам алтернативен план и поемам отговорност за изпълнението му.",
  },
  {
    value: 4,
    label:
      "Свиквам екипа, за да обсъдим заедно вариантите и да изберем решение чрез консенсус.",
  },
  {
    value: 3,
    label:
      "Изчаквам лидера на отбора или менторите да зададат нова посока на действие.",
  },
  {
    value: 2,
    label:
      "Фокусирам се само върху моята лична задача, за да не изоставам поне аз.",
  },
  {
    value: 1,
    label:
      "Чувствам се разочарован/а и изчаквам проблемът да се реши от само себе си.",
  },
];

const ENTREPRENEURIAL_OPTIONS: { value: 1 | 2 | 3 | 4 | 5; label: string }[] = [
  {
    value: 5,
    label:
      "Търся начини да привлека партньори/спонсори или да използвам безплатни ресурси, за да максимизирам резултата.",
  },
  {
    value: 4,
    label:
      "Инвестирам наличния ресурс в създаване на базов прототип (MVP), за да тествам пазара възможно най-бързо.",
  },
  {
    value: 3,
    label:
      "Разпределям бюджета консервативно поравно за всички дейности и стриктно следвам предварителния план.",
  },
  {
    value: 2,
    label:
      "Фокусирам се изцяло върху създаването на продукта, дори ако не останат ресурси за маркетинг и продажби.",
  },
  {
    value: 1,
    label:
      "Ограниченията ме демотивират, предпочитам да работя само когато имам всичко необходимо.",
  },
];

const ROLE_Q1_OPTIONS: { role: Role4HId; text: string }[] = [
  {
    role: "hacker",
    text: "Изграждането на самото решение – логика, програмиране, технически детайли.",
  },
  {
    role: "hipster",
    text: "Оформянето на концепцията – дизайн, визуална идентичност и преживяване на потребителя.",
  },
  {
    role: "hustler",
    text: "Продаването на идеята – водене на преговори, бизнес стратегия и презентиране пред публика.",
  },
  {
    role: "hound",
    text: "Структурирането на процеса – планиране на задачите, сроковете и координация на хората.",
  },
];

const ROLE_Q2_OPTIONS: { role: Role4HId; text: string }[] = [
  {
    role: "hacker",
    text: "Тестване на функционалността и изчистване на последните технически грешки/бъгове.",
  },
  {
    role: "hipster",
    text: "Изглаждане на цветовете, шрифтовете и цялостния дизайн на финалната презентация.",
  },
  {
    role: "hustler",
    text: "Репетиране на речта (питча) и изчистване на ключовите послания, с които ще спечелите журито.",
  },
  {
    role: "hound",
    text: "Финална проверка дали всички изисквания по регламент са спазени и събиране на файловете.",
  },
];

const ROLE_Q3_OPTIONS: { role: Role4HId; text: string }[] = [
  {
    role: "hacker",
    text: "Да реша сложен логически или технически проблем, който другите смятат за невъзможен.",
  },
  {
    role: "hipster",
    text: "Да създам нещо естетически красиво, което предизвиква емоция в хората.",
  },
  {
    role: "hustler",
    text: "Да намеря реален клиент, да продам продукта и да генерирам приходи.",
  },
  {
    role: "hound",
    text: "Да организирам хаоса в подредена система, която работи като швейцарски часовник.",
  },
];

const ROLE_Q4_OPTIONS: { role: Role4HId; text: string }[] = [
  {
    role: "hacker",
    text: "Говоря в факти, данни и конкретни логически стъпки.",
  },
  {
    role: "hipster",
    text: "Използвам метафори, визуални примери и фокус върху креативността.",
  },
  {
    role: "hustler",
    text: "Говоря уверено, убедително и директно към ползите и резултатите.",
  },
  {
    role: "hound",
    text: "Задавам уточняващи въпроси, за да съм сигурен, че всички са разбрали правилата и сроковете.",
  },
];

function computeClientRoleProfile(q: QuestionnaireDoc): ParticipantRoleProfile {
  const {
    gpa,
    extracurricularCount,
    motivationScoreRaw,
    initiativeScoreRaw,
    entrepreneurialScoreRaw,
  } = q.profileMetrics;

  const clampedGpa = Math.max(3.0, Math.min(6.0, Number(gpa) || 3.0));
  const AI = Math.max(
    0,
    Math.min(100, Math.round(((clampedGpa - 3.0) / 3.0) * 100))
  );
  const count = Math.max(0, Math.round(Number(extracurricularCount) || 0));
  const EI =
    count === 0 ? 0 : count === 1 ? 25 : count === 2 ? 50 : count === 3 ? 75 : 100;
  const MI = (Math.max(1, Math.min(5, motivationScoreRaw)) - 1) * 25;
  const INI = (Math.max(1, Math.min(5, initiativeScoreRaw)) - 1) * 25;
  const ENI = (Math.max(1, Math.min(5, entrepreneurialScoreRaw)) - 1) * 25;
  const tps = Number((0.2 * (AI + EI + INI + ENI + MI)).toFixed(1));

  const roleVoteBreakdown: Record<Role4HId, number> = {
    hacker: 0,
    hipster: 0,
    hustler: 0,
    hound: 0,
  };
  const answers: Role4HId[] = [
    q.roleAssessmentAnswers.q1_teamStrength,
    q.roleAssessmentAnswers.q2_deadlineFocus,
    q.roleAssessmentAnswers.q3_challengeType,
    q.roleAssessmentAnswers.q4_communicationStyle,
  ];
  for (const a of answers) {
    roleVoteBreakdown[a] = (roleVoteBreakdown[a] || 0) + 1;
  }

  const affinity: Record<Role4HId, number> = {
    hacker: AI + EI,
    hipster: MI + EI,
    hustler: ENI + INI,
    hound: INI + AI,
  };
  const roles: Role4HId[] = ["hacker", "hipster", "hustler", "hound"];
  roles.sort((a, b) =>
    roleVoteBreakdown[b] !== roleVoteBreakdown[a]
      ? roleVoteBreakdown[b] - roleVoteBreakdown[a]
      : affinity[b] - affinity[a]
  );
  const winning = roles[0]!;

  return {
    roleId: winning,
    roleName: ROLE_4H_THEME[winning].name,
    roleVoteBreakdown,
    indices: { AI, EI, INI, ENI, MI },
    tps,
  };
}

function recalculateTeamMetrics(members: TeamMemberSnapshot[]) {
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

  const teamBalanceIndex = Number(
    (0.7 * avgTps + 0.15 * R + 0.15 * V).toFixed(1)
  );
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
    formationExplanation: `4H Синергия (${members
      .map((m) => `${m.role.roleName}: ${m.fullName}`)
      .join(" • ")}) | TBI: ${teamBalanceIndex} | Съвместимост: ${compatibilityPercentage}% | Разнообразие: ${V}%.`,
  };
}

/**
 * Generates the initial pre-formed teams and thoughts from mockQuestionnaires
 * so the UI immediately matches the reference screenshot on load.
 */
function buildInitialMockData(evaluationId: string) {
  const now = "2026-03-30T10:40:00Z";
  const qDocs: QuestionnaireDoc[] = mockQuestionnaires.map((mq, idx) => ({
    id: mq.id || `questionnaire-0${idx + 1}`,
    evaluationId,
    participantId: mq.participantId || `participant-0${idx + 1}`,
    submittedAt: mq.submittedAt || now,
    generalInfo: mq.generalInfo,
    profileMetrics: mq.profileMetrics,
    roleAssessmentAnswers: mq.roleAssessmentAnswers,
  }));

  const pDocs: ParticipantDoc[] = qDocs.map((q, idx) => {
    const mq = mockQuestionnaires[idx]!;
    const role = computeClientRoleProfile(q);
    return {
      id: q.participantId,
      evaluationId,
      fullName: q.generalInfo.fullName,
      email: mq.email || `student${idx + 1}@innovation.edu`,
      schoolOrOrganization: q.generalInfo.schoolOrOrganization,
      gradeOrPosition: q.generalInfo.gradeOrPosition,
      questionnaireId: q.id,
      isSelected: true,
      selectionRank: idx + 1,
      role,
      createdAt: q.submittedAt,
      updatedAt: now,
    };
  });

  // Sort descending by TPS so Team 01 gets top 4H and Team 02 gets second 4H
  const sorted = [...pDocs].sort(
    (a, b) => (b.role?.tps ?? 0) - (a.role?.tps ?? 0)
  );
  const unassigned = [...sorted];
  const roleOrder: Role4HId[] = ["hacker", "hipster", "hustler", "hound"];
  const builtTeams: TeamDoc[] = [];
  let teamIdx = 1;

  while (unassigned.length > 0) {
    const picked: ParticipantDoc[] = [];
    for (const r of roleOrder) {
      const fIdx = unassigned.findIndex((u) => u.role?.roleId === r);
      if (fIdx !== -1) {
        picked.push(unassigned.splice(fIdx, 1)[0]!);
      }
    }
    while (picked.length < 4 && unassigned.length > 0) {
      picked.push(unassigned.shift()!);
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
    const m = recalculateTeamMetrics(members);
    builtTeams.push({
      id: `${evaluationId}-team-${String(teamIdx).padStart(2, "0")}`,
      evaluationId,
      name: `Отбор ${String(teamIdx).padStart(2, "0")}`,
      status: "unconfirmed",
      ...m,
      members,
      confirmedBy: null,
      confirmedAt: null,
      createdAt: now,
    });
    teamIdx++;
  }

  // Build 15 thoughts matching the badge count (15)
  const thoughts: AgentThoughtDoc[] = [];
  let seq = 1;
  const addTh = (
    agentName: AgentThoughtDoc["agentName"],
    phase: AgentThoughtDoc["phase"],
    message: string
  ) => {
    thoughts.push({
      id: `${evaluationId}-thought-${String(seq).padStart(4, "0")}`,
      evaluationId,
      agentName,
      phase,
      message,
      sequenceNumber: seq++,
      timestamp: now,
    });
  };

  addTh(
    "student_profiling_agent",
    "ingestion",
    `Инициализиране на student_profiling_agent за обработка на ${qDocs.length} подадени въпросника.`
  );
  for (const p of pDocs) {
    const r = p.role!;
    addTh(
      "student_profiling_agent",
      "indexing",
      `Профилиран ${p.fullName} (${p.schoolOrOrganization}) → AI:${r.indices.AI} | EI:${r.indices.EI} | INI:${r.indices.INI} | ENI:${r.indices.ENI} | MI:${r.indices.MI} ⇒ TPS: ${r.tps.toFixed(1)} | 4H Роля: ${r.roleName}`
    );
  }
  addTh(
    "student_profiling_agent",
    "selection_cutoff",
    `Класиране по TPS завършено. Селектирани ${pDocs.length} от ${pDocs.length} кандидати.`
  );
  addTh(
    "team_formation_agent",
    "role_classification",
    `Стартиране на team_formation_agent. 4H разпределение: Hacker (2), Hipster (2), Hustler (2), Hound (2).`
  );
  addTh(
    "team_formation_agent",
    "matrix_assembly",
    `Сглобена първоначална матрица от ${builtTeams.length} екипа по 4 участници със спазване на 4H ролеви баланс.`
  );
  for (const t of builtTeams) {
    addTh(
      "team_formation_agent",
      "matrix_assembly",
      `Записан в Firestore ${t.name} (Съвместимост: ${t.compatibilityPercentage}%, TBI: ${t.teamBalanceIndex}).`
    );
  }
  addTh(
    "system",
    "completed",
    `Двуфазният AI процес завърши успешно. Сформирани ${builtTeams.length} балансирани 4H екипа. Очаква се потвърждение.`
  );

  return { qDocs, pDocs, builtTeams, thoughts };
}

function getMemberStrengths(
  member: TeamMemberSnapshot,
  q?: QuestionnaireDoc
): {
  items: string[];
  topIndices: [string, number][];
} {
  const topIndices = (
    Object.entries(member.role.indices) as [string, number][]
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2);

  const items = [...ROLE_4H_THEME[member.role.roleId].strengthsList];
  if (q) {
    items.push(
      `${q.profileMetrics.extracurricularCount} ${
        q.profileMetrics.extracurricularCount === 1 ? "проект" : "проекта"
      }, Успех ${q.profileMetrics.gpa.toFixed(2)}`
    );
  }

  return { items, topIndices };
}

const PAGE_SIZE = 16;

export default function StudentTeamBuilderView({
  activeContest,
  onAgentStatusChange,
  onAutoOpenInspector,
}: StudentTeamBuilderViewProps) {
  const evaluationId = activeContest.id;

  const initialSeed = useMemo(
    () => buildInitialMockData(evaluationId),
    [evaluationId]
  );

  // Default to "teams" tab so it matches the screenshot view immediately
  const [activeTab, setActiveTab] = useState<ActiveTab>("teams");

  // Firestore / Backend synchronized state
  const [evaluation, setEvaluation] = useState<EvaluationDoc | null>(null);
  const [questionnaires, setQuestionnaires] = useState<QuestionnaireDoc[]>(
    initialSeed.qDocs
  );
  const [participants, setParticipants] = useState<ParticipantDoc[]>(
    initialSeed.pDocs
  );
  const [teams, setTeams] = useState<TeamDoc[]>(initialSeed.builtTeams);
  const [agentThoughts, setAgentThoughts] = useState<AgentThoughtDoc[]>(
    initialSeed.thoughts
  );

  // Participants Table controls
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortField>("tps_desc");
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);
  const [selectedParticipantModal, setSelectedParticipantModal] =
    useState<ParticipantDoc | null>(null);

  // Teams Tab controls
  const [expandedTeamIds, setExpandedTeamIds] = useState<Set<string>>(
    new Set()
  );
  const [editingTeamIds, setEditingTeamIds] = useState<Set<string>>(new Set());
  const [swapModalState, setSwapModalState] = useState<{
    teamId: string;
    teamName: string;
    member: TeamMemberSnapshot;
  } | null>(null);

  // Questionnaire Form (Tab 3) state
  const [formFullName, setFormFullName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formSchool, setFormSchool] = useState("");
  const [formGrade, setFormGrade] = useState("11 А");
  const [formGpa, setFormGpa] = useState("5.75");
  const [formExtracurricular, setFormExtracurricular] = useState<number>(3);
  const [formMotivation, setFormMotivation] = useState<1 | 2 | 3 | 4 | 5>(5);
  const [formInitiative, setFormInitiative] = useState<1 | 2 | 3 | 4 | 5>(4);
  const [formEntrepreneurial, setFormEntrepreneurial] = useState<
    1 | 2 | 3 | 4 | 5
  >(4);
  const [formQ1Role, setFormQ1Role] = useState<Role4HId>("hacker");
  const [formQ2Role, setFormQ2Role] = useState<Role4HId>("hacker");
  const [formQ3Role, setFormQ3Role] = useState<Role4HId>("hacker");
  const [formQ4Role, setFormQ4Role] = useState<Role4HId>("hacker");
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [formSuccessMessage, setFormSuccessMessage] = useState<string | null>(
    null
  );

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Subscribe to active contest snapshot
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
    setExpandedTeamIds(new Set());
    setEditingTeamIds(new Set());
    setSwapModalState(null);
    setQuestionnaires(initialSeed.qDocs);
    setParticipants(initialSeed.pDocs);
    setTeams(initialSeed.builtTeams);
    setAgentThoughts(initialSeed.thoughts);

    const unsubscribe = subscribeToEvaluationSnapshot(
      evaluationId,
      (snapshot) => {
        if (snapshot.evaluation && snapshot.evaluation.status !== "idle") {
          setEvaluation(snapshot.evaluation);
        }
        if (snapshot.questionnaires && snapshot.questionnaires.length > 0) {
          setQuestionnaires(snapshot.questionnaires);
        }
        if (snapshot.participants && snapshot.participants.length > 0) {
          setParticipants(snapshot.participants);
        }
        if (snapshot.teams && snapshot.teams.length > 0) {
          setTeams(snapshot.teams);
        }
        if (snapshot.agentThoughts && snapshot.agentThoughts.length > 0) {
          setAgentThoughts(snapshot.agentThoughts);
        }
      }
    );

    return () => unsubscribe();
  }, [evaluationId, initialSeed]);

  const pipelineStatus: EvaluationPipelineStatus =
    evaluation?.status && evaluation.status !== "idle"
      ? evaluation.status
      : teams.length > 0 && teams.every((t) => t.status === "confirmed")
      ? "completed"
      : teams.length > 0
      ? "awaiting_confirmation"
      : "idle";

  const isProcessingAgents =
    pipelineStatus === "profiling_participants" ||
    pipelineStatus === "forming_teams";

  useEffect(() => {
    onAgentStatusChange?.(pipelineStatus, agentThoughts);
  }, [pipelineStatus, agentThoughts, onAgentStatusChange]);

  const questionnaireByParticipantId = useMemo(() => {
    const map = new Map<string, QuestionnaireDoc>();
    for (const q of questionnaires) {
      map.set(q.participantId, q);
      map.set(q.id, q);
    }
    return map;
  }, [questionnaires]);

  const getQuestionnaire = (p: ParticipantDoc): QuestionnaireDoc | undefined =>
    questionnaireByParticipantId.get(p.questionnaireId) ||
    questionnaireByParticipantId.get(p.id);

  // Filtered & sorted participants for Tab 1
  const filteredAndSortedParticipants = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const filtered = participants.filter((p) => {
      if (!q) return true;
      return (
        p.fullName.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.schoolOrOrganization.toLowerCase().includes(q) ||
        p.gradeOrPosition.toLowerCase().includes(q)
      );
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === "name_asc") {
        return a.fullName.localeCompare(b.fullName, "bg");
      }
      if (sortBy === "gpa_desc") {
        const gpaA = getQuestionnaire(a)?.profileMetrics.gpa ?? 0;
        const gpaB = getQuestionnaire(b)?.profileMetrics.gpa ?? 0;
        return gpaB - gpaA;
      }
      if (sortBy === "role_asc") {
        const rA = a.role?.roleName ?? "ЯЯЯ";
        const rB = b.role?.roleName ?? "ЯЯЯ";
        return rA.localeCompare(rB);
      }
      const tpsA = a.role?.tps ?? -1;
      const tpsB = b.role?.tps ?? -1;
      if (tpsB !== tpsA) return tpsB - tpsA;
      return a.id.localeCompare(b.id);
    });
  }, [participants, searchQuery, sortBy, questionnaireByParticipantId]);

  const visibleParticipants = filteredAndSortedParticipants.slice(
    0,
    visibleCount
  );
  const remainingParticipantsCount = Math.max(
    0,
    filteredAndSortedParticipants.length - visibleCount
  );

  // Trigger Agent Execution Flow ("Профилирай")
  const handleProfileClick = async () => {
    setErrorMessage(null);
    setActiveTab("teams");
    onAutoOpenInspector?.();

    setEvaluation((prev) => ({
      ...(prev ?? {
        id: evaluationId,
        title: activeContest.name,
        config: {
          targetCohortSize: activeContest.targetCohortSize,
          teamSize: 4,
          maxTbiSpread: 15,
        },
        participantIds: participants.map((p) => p.id),
        teamIds: [],
        recentThoughtIds: [],
        metrics: {
          totalParticipants: participants.length,
          profiledParticipants: 0,
          selectedParticipants: 0,
          totalTeamsFormed: 0,
          confirmedTeamsCount: 0,
          averageCohortTPS: 0,
          currentTbiSpread: 0,
        },
        errorMessage: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
      status: "profiling_participants",
    }));
    setTeams([]);

    try {
      const seedPayload = mockQuestionnaires.map((mq) => ({
        ...mq,
        evaluationId,
      }));
      await startCohortEvaluation(evaluationId, seedPayload);
    } catch {
      runLocalFallbackPipeline();
    }
  };

  // Fallback pipeline if Express backend is offline
  const runLocalFallbackPipeline = () => {
    setTimeout(() => {
      setEvaluation((prev) =>
        prev ? { ...prev, status: "forming_teams" } : null
      );
      setTimeout(() => {
        setParticipants(initialSeed.pDocs);
        setTeams(initialSeed.builtTeams);
        setAgentThoughts(initialSeed.thoughts);
        setEvaluation((prev) =>
          prev ? { ...prev, status: "awaiting_confirmation" } : null
        );
      }, 850);
    }, 850);
  };

  // Confirm team action ("Потвърди")
  const handleConfirmTeam = async (teamId: string) => {
    const now = new Date().toISOString();
    setTeams((prev) =>
      prev.map((t) =>
        t.id === teamId
          ? {
              ...t,
              status: "confirmed",
              confirmedBy: "usr-admin-01",
              confirmedAt: now,
            }
          : t
      )
    );
    setEditingTeamIds((prev) => {
      const next = new Set(prev);
      next.delete(teamId);
      return next;
    });

    try {
      await confirmTeamInEvaluation(teamId, evaluationId, "usr-admin-01");
    } catch {
      // Optimistically updated
    }
  };

  // Toggle Expand on a Team Card
  const toggleTeamExpand = (teamId: string) => {
    setExpandedTeamIds((prev) => {
      const next = new Set(prev);
      if (next.has(teamId)) {
        next.delete(teamId);
      } else {
        next.add(teamId);
      }
      return next;
    });
  };

  // Toggle Edit mode ("Промени") on a Team Card
  const toggleTeamEdit = (teamId: string) => {
    setEditingTeamIds((prev) => {
      const next = new Set(prev);
      if (next.has(teamId)) {
        next.delete(teamId);
      } else {
        next.add(teamId);
      }
      return next;
    });
  };

  // Execute Member Swap ("Размени")
  const handleExecuteSwap = async (targetParticipantId: string) => {
    if (!swapModalState) return;
    const { teamId: sourceTeamId, member: sourceMember } = swapModalState;

    setTeams((prevTeams) => {
      const cloned = prevTeams.map((t) => ({
        ...t,
        members: [...t.members],
      }));

      const sTeam = cloned.find((t) => t.id === sourceTeamId);
      if (!sTeam) return prevTeams;

      const sIdx = sTeam.members.findIndex(
        (m) => m.participantId === sourceMember.participantId
      );
      if (sIdx === -1) return prevTeams;

      const tTeam = cloned.find((t) =>
        t.members.some((m) => m.participantId === targetParticipantId)
      );

      if (tTeam) {
        const tIdx = tTeam.members.findIndex(
          (m) => m.participantId === targetParticipantId
        );
        const targetMember = tTeam.members[tIdx]!;
        sTeam.members[sIdx] = targetMember;
        tTeam.members[tIdx] = sourceMember;

        Object.assign(sTeam, recalculateTeamMetrics(sTeam.members));
        Object.assign(tTeam, recalculateTeamMetrics(tTeam.members));
      } else {
        const reserveP = participants.find((p) => p.id === targetParticipantId);
        if (reserveP && reserveP.role) {
          sTeam.members[sIdx] = {
            participantId: reserveP.id,
            fullName: reserveP.fullName,
            email: reserveP.email,
            schoolOrOrganization: reserveP.schoolOrOrganization,
            gradeOrPosition: reserveP.gradeOrPosition,
            questionnaireId: reserveP.questionnaireId,
            role: reserveP.role,
          };
          Object.assign(sTeam, recalculateTeamMetrics(sTeam.members));
        }
      }

      return cloned;
    });

    setSwapModalState(null);

    try {
      const res = await swapTeamMembersInEvaluation({
        evaluationId,
        sourceTeamId,
        sourceParticipantId: sourceMember.participantId,
        targetParticipantId,
      });
      if (res.teams) {
        setTeams(res.teams);
      }
    } catch {
      // Optimistic swap already applied
    }
  };

  // Candidates with the exact same 4H role for the Swap Modal
  const swapCandidates = useMemo(() => {
    if (!swapModalState) return [];
    const targetRoleId = swapModalState.member.role.roleId;
    const currentMemberId = swapModalState.member.participantId;

    const list: {
      participantId: string;
      fullName: string;
      schoolOrOrganization: string;
      gradeOrPosition: string;
      tps: number;
      currentTeamName: string;
      currentTeamId: string | null;
    }[] = [];

    const seenIds = new Set<string>();

    for (const team of teams) {
      for (const m of team.members) {
        seenIds.add(m.participantId);
        if (
          m.role.roleId === targetRoleId &&
          m.participantId !== currentMemberId
        ) {
          list.push({
            participantId: m.participantId,
            fullName: m.fullName,
            schoolOrOrganization: m.schoolOrOrganization,
            gradeOrPosition: m.gradeOrPosition,
            tps: m.role.tps,
            currentTeamName: formatTeamNameBg(team.name),
            currentTeamId: team.id,
          });
        }
      }
    }

    for (const p of participants) {
      if (
        !seenIds.has(p.id) &&
        p.id !== currentMemberId &&
        p.role?.roleId === targetRoleId
      ) {
        list.push({
          participantId: p.id,
          fullName: p.fullName,
          schoolOrOrganization: p.schoolOrOrganization,
          gradeOrPosition: p.gradeOrPosition,
          tps: p.role.tps,
          currentTeamName: "Резерва",
          currentTeamId: null,
        });
      }
    }

    return list.sort((a, b) => b.tps - a.tps);
  }, [swapModalState, teams, participants]);

  // Handle Questionnaire Form Submit (Tab 3: "Анкета")
  const handleQuestionnaireSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFullName.trim() || !formSchool.trim()) return;

    setIsSubmittingForm(true);
    setFormSuccessMessage(null);
    setErrorMessage(null);

    const parsedGpa = Math.max(
      3.0,
      Math.min(6.0, Number(formGpa.replace(",", ".")) || 5.0)
    );

    const payload: QuestionnaireSubmissionInput = {
      evaluationId,
      email:
        formEmail.trim() ||
        `${formFullName
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9а-я]+/gi, ".")}@innovation.edu`,
      submittedAt: new Date().toISOString(),
      generalInfo: {
        fullName: formFullName.trim(),
        schoolOrOrganization: formSchool.trim(),
        gradeOrPosition: formGrade.trim(),
      },
      profileMetrics: {
        gpa: parsedGpa,
        extracurricularCount: formExtracurricular,
        motivationScoreRaw: formMotivation,
        initiativeScoreRaw: formInitiative,
        entrepreneurialScoreRaw: formEntrepreneurial,
      },
      roleAssessmentAnswers: {
        q1_teamStrength: formQ1Role,
        q2_deadlineFocus: formQ2Role,
        q3_challengeType: formQ3Role,
        q4_communicationStyle: formQ4Role,
      },
    };

    try {
      const res = await submitQuestionnaireForm(payload);
      setQuestionnaires((prev) => [...prev, res.questionnaire]);
      setParticipants((prev) => [...prev, res.participant]);
    } catch {
      const newIndex = participants.length + 1;
      const partId = `participant-${String(newIndex).padStart(2, "0")}`;
      const questId = `questionnaire-${String(newIndex).padStart(2, "0")}`;
      const now = new Date().toISOString();

      const newQ: QuestionnaireDoc = {
        id: questId,
        evaluationId,
        participantId: partId,
        submittedAt: now,
        generalInfo: payload.generalInfo,
        profileMetrics: payload.profileMetrics,
        roleAssessmentAnswers: payload.roleAssessmentAnswers,
      };
      const newP: ParticipantDoc = {
        id: partId,
        evaluationId,
        fullName: payload.generalInfo.fullName,
        email: payload.email!,
        schoolOrOrganization: payload.generalInfo.schoolOrOrganization,
        gradeOrPosition: payload.generalInfo.gradeOrPosition,
        questionnaireId: questId,
        isSelected: false,
        selectionRank: null,
        role: null,
        createdAt: now,
        updatedAt: now,
      };
      setQuestionnaires([...questionnaires, newQ]);
      setParticipants([...participants, newP]);
    } finally {
      setIsSubmittingForm(false);
      setFormFullName("");
      setFormEmail("");
      setFormSchool("");
      setFormSuccessMessage(
        "Анкетата е записана успешно! Новият участник е добавен в таб „Участници“ с роля: '-' (очаква профилиране)."
      );
    }
  };

  // KPI Metrics for Top Header Plate
  const totalApplicantsCount = participants.length;
  const selectedCohortCount =
    participants.filter((p) => p.isSelected).length ||
    Math.min(totalApplicantsCount, activeContest.targetCohortSize);
  const totalTeamsCount = teams.length;
  const confirmedTeamsCount = teams.filter(
    (t) => t.status === "confirmed"
  ).length;

  return (
    <div className="max-w-7xl mx-auto w-full space-y-6 pb-10">
      {/* ====================================================================
          2.2. TOP HEADER & TRIPLE KPI ACRYLIC PLATE
         ==================================================================== */}
      <header className="rounded-3xl plate-acrylic p-6 space-y-5">
        {/* Top Row: Contest Title + Edition Pill + Pipeline Status Pill */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl md:text-2xl font-extrabold text-[#0b1c30] tracking-tight">
              {activeContest.name}
            </h1>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-100/90 text-slate-600 border border-slate-200/80">
              {activeContest.editionBadge}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <PipelineStatusBadge status={pipelineStatus} />
          </div>
        </div>

        {/* Bottom Row: 3 Metric KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* KPI 1: Общо кандидати */}
          <div className="rounded-2xl bg-white/95 border border-slate-100/90 px-5 py-4 flex items-center justify-between shadow-[0_8px_24px_-6px_rgba(14,165,233,0.08)]">
            <div>
              <div className="text-xs font-semibold text-slate-400">
                Общо кандидати
              </div>
              <div className="text-2xl font-extrabold text-[#0b1c30] mt-1 leading-none">
                {totalApplicantsCount}
              </div>
            </div>
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-cyan-400 to-sky-500 text-white flex items-center justify-center shadow-[0_8px_18px_-4px_rgba(6,182,212,0.5)] shrink-0">
              <Users className="h-5 w-5" />
            </div>
          </div>

          {/* KPI 2: Селектирани за участие */}
          <div className="rounded-2xl bg-white/95 border border-slate-100/90 px-5 py-4 flex items-center justify-between shadow-[0_8px_24px_-6px_rgba(14,165,233,0.08)]">
            <div>
              <div className="text-xs font-semibold text-slate-400">
                Селектирани за участие
              </div>
              <div className="mt-1 flex items-baseline gap-1.5 leading-none">
                <span className="text-2xl font-extrabold text-[#0b1c30]">
                  {selectedCohortCount}
                </span>
                <span className="text-xs font-medium text-slate-400">
                  (лимит {activeContest.targetCohortSize})
                </span>
              </div>
            </div>
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 text-white flex items-center justify-center shadow-[0_8px_18px_-4px_rgba(14,165,233,0.5)] shrink-0">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>

          {/* KPI 3: Сформирани отбори */}
          <div className="rounded-2xl bg-white/95 border border-slate-100/90 px-5 py-4 flex items-center justify-between shadow-[0_8px_24px_-6px_rgba(14,165,233,0.08)]">
            <div>
              <div className="text-xs font-semibold text-slate-400">
                Сформирани отбори
              </div>
              <div className="mt-1 flex items-baseline gap-1 leading-none">
                <span className="text-2xl font-extrabold text-[#0b1c30]">
                  {confirmedTeamsCount}
                </span>
                <span className="text-sm font-bold text-slate-400">
                  / {totalTeamsCount}
                </span>
                <span className="text-xs font-bold text-[#0d9488] ml-1">
                  потвърдени
                </span>
              </div>
            </div>
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-500 text-white flex items-center justify-center shadow-[0_8px_18px_-4px_rgba(16,185,129,0.5)] shrink-0">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
        </div>
      </header>

      {/* ====================================================================
          2.3. CENTERED FLOATING SEGMENTED CONTROL TABS
         ==================================================================== */}
      <div className="flex flex-col items-center justify-center gap-3">
        <div
          role="tablist"
          aria-label="Секции на работното пространство"
          className="bg-white/90 backdrop-blur-xl p-1.5 rounded-full inline-flex items-center gap-1 border border-white shadow-[0_14px_34px_-8px_rgba(13,148,136,0.16)]"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "participants"}
            onClick={() => setActiveTab("participants")}
            className={`inline-flex items-center gap-2 text-xs transition-all cursor-pointer rounded-full px-5 py-2 ${
              activeTab === "participants"
                ? "bg-gradient-to-r from-sky-500 via-teal-500 to-emerald-500 text-white font-bold shadow-[0_6px_18px_-3px_rgba(13,148,136,0.5)]"
                : "text-slate-600 hover:text-[#0b1c30] font-semibold"
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>Участници</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "teams"}
            onClick={() => setActiveTab("teams")}
            className={`inline-flex items-center gap-2 text-xs transition-all cursor-pointer rounded-full px-5 py-2 ${
              activeTab === "teams"
                ? "bg-gradient-to-r from-sky-500 via-teal-500 to-emerald-500 text-white font-bold shadow-[0_6px_18px_-3px_rgba(13,148,136,0.5)]"
                : "text-slate-600 hover:text-[#0b1c30] font-semibold"
            }`}
          >
            <UserCheck className="h-3.5 w-3.5" />
            <span>Отбори</span>
            {teams.length > 0 && (
              <span
                className={`ml-0.5 px-2 py-0.2 rounded-full text-[11px] font-extrabold ${
                  activeTab === "teams"
                    ? "bg-white/25 text-white"
                    : "bg-teal-100 text-[#0d9488]"
                }`}
              >
                {teams.length}
              </span>
            )}
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "questionnaire"}
            onClick={() => setActiveTab("questionnaire")}
            className={`inline-flex items-center gap-2 text-xs transition-all cursor-pointer rounded-full px-5 py-2 ${
              activeTab === "questionnaire"
                ? "bg-gradient-to-r from-sky-500 via-teal-500 to-emerald-500 text-white font-bold shadow-[0_6px_18px_-3px_rgba(13,148,136,0.5)]"
                : "text-slate-600 hover:text-[#0b1c30] font-semibold"
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Анкета</span>
          </button>
        </div>

        {errorMessage && (
          <div className="text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2">
            {errorMessage}
          </div>
        )}
      </div>

      {/* ====================================================================
          3.1. TAB 1: УЧАСТНИЦИ (Participants Table)
         ==================================================================== */}
      {activeTab === "participants" && (
        <section className="space-y-4">
          {/* Top Control Bar */}
          <div className="rounded-3xl plate-acrylic p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 pl-1">
              <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-sky-400 to-teal-500 text-white flex items-center justify-center shadow-[0_6px_14px_-3px_rgba(13,148,136,0.4)]">
                <Users className="h-4 w-4" />
              </div>
              <div className="text-sm font-bold text-[#0b1c30]">
                Общ брой участници:{" "}
                <span className="text-[#0d9488] font-extrabold">
                  {filteredAndSortedParticipants.length}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Search Input (Търсене) */}
              <div className="relative min-w-[240px] flex-1 sm:flex-initial">
                <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setVisibleCount(PAGE_SIZE);
                  }}
                  placeholder="Търсене по име, имейл, училище, клас..."
                  className="w-full pl-9 pr-3.5 py-2 text-xs rounded-full border border-slate-200/90 bg-white/90 text-[#0b1c30] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0d9488] transition-all shadow-2xs"
                />
              </div>

              {/* Sort Dropdown (Сортиране) */}
              <div className="relative inline-flex items-center">
                <ArrowUpDown className="h-3.5 w-3.5 text-slate-500 absolute left-3.5 pointer-events-none" />
                <select
                  aria-label="Сортиране"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortField)}
                  className="pl-9 pr-8 py-2 text-xs font-bold rounded-full border border-slate-200/90 bg-white/90 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0d9488] cursor-pointer shadow-2xs"
                >
                  <option value="tps_desc">
                    Сортиране: TPS бал (Низходящо)
                  </option>
                  <option value="name_asc">Сортиране: Име (А-Я)</option>
                  <option value="gpa_desc">Сортиране: Успех</option>
                  <option value="role_asc">Сортиране: Роля</option>
                </select>
              </div>

              {/* Primary Action Button: Профилирай */}
              <button
                type="button"
                onClick={handleProfileClick}
                disabled={isProcessingAgents}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-sky-500 via-teal-500 to-emerald-500 hover:brightness-105 disabled:opacity-60 text-white text-xs font-bold border-t border-white/40 shadow-[0_8px_20px_-4px_rgba(13,148,136,0.45)] transition-all cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Профилирай</span>
              </button>
            </div>
          </div>

          {/* Participants Data Table */}
          <div className="rounded-3xl plate-acrylic overflow-hidden">
            <div className="h-1.5 w-full bg-gradient-to-r from-sky-400 via-teal-500 to-emerald-400" />
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-slate-50/80 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                    <th className="py-3.5 pl-6 pr-3">Име</th>
                    <th className="py-3.5 px-3">Имейл</th>
                    <th className="py-3.5 px-3">Училище и клас</th>
                    <th className="py-3.5 px-3">Успех и проекти</th>
                    <th className="py-3.5 px-3">Индекси</th>
                    <th className="py-3.5 px-3">TPS бал</th>
                    <th className="py-3.5 px-3">Роля</th>
                    <th className="py-3.5 pl-3 pr-6 text-right">Анкета</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {visibleParticipants.map((participant) => {
                    const q = getQuestionnaire(participant);
                    const roleProfile = participant.role;
                    const roleTheme = roleProfile
                      ? ROLE_4H_THEME[roleProfile.roleId]
                      : null;
                    const RoleIcon = roleTheme?.Icon;

                    return (
                      <tr
                        key={participant.id}
                        className="transition-colors hover:bg-teal-50/30 bg-white/70"
                      >
                        <td className="py-3.5 pl-6 pr-3 font-extrabold text-[#0b1c30] whitespace-nowrap">
                          {participant.fullName}
                        </td>

                        <td className="py-3.5 px-3 text-slate-500 whitespace-nowrap">
                          {participant.email}
                        </td>

                        <td className="py-3.5 px-3">
                          <div className="font-bold text-[#0b1c30]">
                            {participant.schoolOrOrganization}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {participant.gradeOrPosition} клас
                          </div>
                        </td>

                        <td className="py-3.5 px-3 whitespace-nowrap text-slate-700 font-medium">
                          {q ? (
                            <span>
                              <span className="font-extrabold text-[#0d9488]">
                                {q.profileMetrics.gpa.toFixed(2)}
                              </span>{" "}
                              • {q.profileMetrics.extracurricularCount}{" "}
                              {q.profileMetrics.extracurricularCount === 1
                                ? "проект"
                                : "проекта"}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>

                        <td className="py-3.5 px-3">
                          {roleProfile ? (
                            <div className="flex flex-wrap gap-1 max-w-[230px]">
                              {(
                                Object.entries(roleProfile.indices) as [
                                  string,
                                  number,
                                ][]
                              ).map(([k, v]) => (
                                <span
                                  key={k}
                                  className="px-2 py-0.5 rounded-md bg-slate-100/90 border border-slate-200/80 font-mono text-[10px] font-bold text-[#0b1c30]"
                                >
                                  {k}:{v}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-400 font-mono">-</span>
                          )}
                        </td>

                        <td className="py-3.5 px-3 whitespace-nowrap">
                          {roleProfile && roleTheme ? (
                            <span className="inline-flex items-baseline gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200/90 shadow-2xs">
                              <span
                                className={`font-extrabold text-xs ${roleTheme.scoreText}`}
                              >
                                {roleProfile.tps.toFixed(1)}
                              </span>
                              <span className="text-[10px] font-bold text-slate-400">
                                TPS
                              </span>
                            </span>
                          ) : (
                            <span className="text-slate-400 font-mono">-</span>
                          )}
                        </td>

                        <td className="py-3.5 px-3 whitespace-nowrap">
                          {roleProfile && roleTheme && RoleIcon ? (
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${roleTheme.badge}`}
                            >
                              <RoleIcon className="h-3.5 w-3.5 shrink-0" />
                              <span>{roleProfile.roleName}</span>
                            </span>
                          ) : (
                            <span className="text-slate-400 font-mono">-</span>
                          )}
                        </td>

                        <td className="py-3.5 pl-3 pr-6 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedParticipantModal(participant)
                            }
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-slate-200/90 bg-white/90 hover:bg-teal-50/70 hover:border-teal-200 text-[#0b1c30] font-bold text-xs shadow-2xs transition-all cursor-pointer"
                          >
                            <FileText className="h-3.5 w-3.5 text-[#0d9488]" />
                            <span>Виж отговори</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {remainingParticipantsCount > 0 && (
              <div className="p-4 border-t border-slate-200/70 bg-white/60 flex justify-center">
                <button
                  type="button"
                  onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                  className="px-5 py-2 rounded-full bg-white hover:bg-teal-50 text-[#0b1c30] font-bold text-xs border border-slate-200/90 shadow-xs transition-colors cursor-pointer"
                >
                  Зареди още ({remainingParticipantsCount})
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ====================================================================
          3.2 & 3.3. TAB 2: ОТБОРИ (Teams Grid & Acrylic Comparison Cards)
         ==================================================================== */}
      {activeTab === "teams" && (
        <section className="space-y-5">
          {isProcessingAgents ? (
            /* 3.2.4 Centered Processing State */
            <div className="min-h-[340px] flex items-center justify-center">
              <div className="rounded-3xl plate-acrylic p-8 max-w-md w-full text-center space-y-4">
                <div className="mx-auto h-12 w-12 rounded-2xl bg-gradient-to-br from-sky-400 via-teal-500 to-emerald-500 flex items-center justify-center text-white shadow-[0_8px_18px_-4px_rgba(13,148,136,0.5)]">
                  <RotateCw className="h-6 w-6 animate-spin" />
                </div>
                <h3 className="text-base font-extrabold text-[#0b1c30]">
                  Екипите се обработват от агентите. Моля, изчакайте...
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {pipelineStatus === "profiling_participants"
                    ? "Agent 1 (student_profiling_agent) изчислява 5-те индекса, TPS бала и 4H ролите на кандидатите..."
                    : "Agent 2 (team_formation_agent) сглобява балансирани 4-членни екипи и оптимизира индекса на баланс (TBI)..."}
                </p>
              </div>
            </div>
          ) : teams.length === 0 ? (
            <div className="rounded-3xl plate-acrylic p-10 text-center space-y-4">
              <div className="mx-auto h-12 w-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-[#0d9488]">
                <UserCheck className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-[#0b1c30]">
                  Все още няма сформирани отбори
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Стартирайте AI профилирането, за да разпределите участниците в балансирани 4H екипи.
                </p>
              </div>
              <button
                type="button"
                onClick={handleProfileClick}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-sky-500 via-teal-500 to-emerald-500 text-white text-xs font-bold shadow-[0_8px_20px_-4px_rgba(13,148,136,0.45)] transition-all cursor-pointer"
              >
                <Sparkles className="h-4 w-4" />
                <span>Профилирай участниците</span>
              </button>
            </div>
          ) : (
            /* 2-Column Side-by-Side Team Comparison Grid matching the screenshot */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {teams.map((team, index) => {
                const isExpanded = expandedTeamIds.has(team.id);
                const isEditing =
                  editingTeamIds.has(team.id) && team.status === "unconfirmed";
                const displayTeamName = formatTeamNameBg(team.name);
                const isEven = index % 2 === 0;

                return (
                  <div
                    key={team.id}
                    onClick={() => {
                      if (!isExpanded) {
                        toggleTeamExpand(team.id);
                      }
                    }}
                    style={{ animationDelay: `${index * 120}ms` }}
                    className={`animate-team-card-reveal rounded-3xl plate-acrylic overflow-hidden flex flex-col ${
                      isExpanded
                        ? "col-span-full cursor-default"
                        : "cursor-pointer plate-acrylic-hover hover:scale-[1.015]"
                    }`}
                  >
                    {/* 6px Top Corner Chromatic Accent Trim */}
                    <div
                      className={`h-1.5 w-full shrink-0 ${
                        isEven
                          ? "bg-gradient-to-r from-sky-400 via-teal-400 to-emerald-400"
                          : "bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-500"
                      }`}
                    />

                    {!isExpanded ? (
                      /* ====================================================
                         A. COLLAPSED CARD STATE (Matches Screenshot Exactly)
                         ==================================================== */
                      <div className="p-6 flex flex-col flex-1 space-y-4">
                        {/* Header Row: Team Pill + Status Pill + Разгъни */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-50/95 border border-slate-200/80 text-xs font-extrabold text-[#0b1c30]">
                              <span
                                className={`h-2 w-2 rounded-full ${
                                  isEven ? "bg-sky-500" : "bg-[#0d9488]"
                                }`}
                              />
                              <span>{displayTeamName}</span>
                            </span>
                            <TeamStatusBadge status={team.status} />
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleTeamExpand(team.id);
                            }}
                            title="Разгъни картата"
                            className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/90 shadow-2xs transition-colors cursor-pointer"
                          >
                            <span>Разгъни</span>
                            <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                          </button>
                        </div>

                        {/* Compatibility Gauge Row */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600">
                              <ShieldCheck
                                className={`h-4 w-4 ${
                                  isEven ? "text-[#0d9488]" : "text-sky-600"
                                }`}
                              />
                              <span>Съвместимост</span>
                            </div>
                            <span
                              className={`text-sm font-extrabold ${
                                isEven ? "text-[#0d9488]" : "text-sky-600"
                              }`}
                            >
                              {team.compatibilityPercentage}%
                            </span>
                          </div>

                          <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                isEven
                                  ? "bg-gradient-to-r from-sky-400 via-teal-500 to-emerald-400 shadow-[0_0_10px_rgba(45,212,191,0.55)]"
                                  : "bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-500 shadow-[0_0_10px_rgba(14,165,233,0.5)]"
                              }`}
                              style={{
                                width: `${Math.min(
                                  100,
                                  team.compatibilityPercentage
                                )}%`,
                              }}
                            />
                          </div>
                        </div>

                        {/* Stacked 4-Member Roster */}
                        <div className="space-y-2.5 flex-1 pt-1">
                          {team.members.map((member) => {
                            const roleTheme =
                              ROLE_4H_THEME[member.role.roleId];
                            const RoleIcon = roleTheme.Icon;
                            return (
                              <div
                                key={member.participantId}
                                className="space-y-1.5"
                              >
                                <div
                                  className={`px-4 py-3 rounded-2xl border flex items-center justify-between gap-3 ${roleTheme.rowBg}`}
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div
                                      title={member.role.roleName}
                                      className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 border ${roleTheme.iconBox}`}
                                    >
                                      <RoleIcon className="h-4 w-4" />
                                    </div>
                                    <div className="min-w-0">
                                      <div className="text-xs font-extrabold text-[#0b1c30] truncate">
                                        {member.fullName}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="px-2.5 py-1 rounded-lg bg-white border border-slate-200/80 shadow-2xs inline-flex items-baseline gap-1 shrink-0">
                                    <span
                                      className={`text-xs font-extrabold ${roleTheme.scoreText}`}
                                    >
                                      {member.role.tps.toFixed(1)}
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-400">
                                      TPS
                                    </span>
                                  </div>
                                </div>

                                {isEditing && (
                                  <div className="flex justify-end">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSwapModalState({
                                          teamId: team.id,
                                          teamName: displayTeamName,
                                          member,
                                        });
                                      }}
                                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-white hover:bg-teal-50 text-[#0d9488] border border-teal-200 shadow-2xs transition-colors cursor-pointer"
                                    >
                                      <ArrowLeftRight className="h-3 w-3" />
                                      <span>Смени</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Bottom Action Toolbar */}
                        {team.status === "unconfirmed" && (
                          <div className="pt-3 border-t border-slate-100/90 flex items-center justify-end gap-2.5">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleTeamEdit(team.id);
                              }}
                              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                                isEditing
                                  ? "bg-[#0b1c30] text-white border-[#0b1c30]"
                                  : "bg-slate-50/90 hover:bg-slate-100 text-slate-700 border-slate-200/90"
                              }`}
                            >
                              <Pencil className="h-3.5 w-3.5 text-slate-400" />
                              <span>Промени</span>
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleConfirmTeam(team.id);
                              }}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-sky-500 via-teal-500 to-emerald-500 hover:brightness-105 text-white text-xs font-bold border-t border-white/40 shadow-[0_8px_20px_-4px_rgba(13,148,136,0.45)] transition-all cursor-pointer"
                            >
                              <Check className="h-3.5 w-3.5" />
                              <span>Потвърди</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* ====================================================
                         B. EXPANDED CARD STATE (Aura Acrylic Full-Row View)
                         ==================================================== */
                      <div className="p-6 space-y-5">
                        {/* Expanded Top Row: Pills on Top-Left, Action Buttons on Top-Right */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200/70">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-50 border border-slate-200/80 text-xs font-extrabold text-[#0b1c30]">
                              <span className="h-2 w-2 rounded-full bg-[#0d9488]" />
                              <span>{displayTeamName}</span>
                            </span>
                            <TeamStatusBadge status={team.status} />
                            <span className="px-3 py-1 rounded-full bg-teal-50/80 border border-teal-200/70 text-[#0d9488] text-xs font-bold">
                              4H Иновационен Отбор ({team.members.length}{" "}
                              членове)
                            </span>
                          </div>

                          {/* Top-Right Action Buttons */}
                          <div className="flex flex-wrap items-center gap-2 ml-auto">
                            {team.status === "unconfirmed" && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleConfirmTeam(team.id);
                                }}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-sky-500 via-teal-500 to-emerald-500 hover:brightness-105 text-white text-xs font-bold shadow-[0_8px_20px_-4px_rgba(13,148,136,0.45)] transition-all cursor-pointer"
                              >
                                <Check className="h-3.5 w-3.5" />
                                <span>Потвърди</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleTeamExpand(team.id);
                              }}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                            >
                              <span>Свий</span>
                              <Minimize2 className="h-3.5 w-3.5 text-slate-400" />
                            </button>
                          </div>
                        </div>

                        {/* Compatibility & Telemetry Strip */}
                        <div className="bg-slate-50/85 border border-slate-200/75 rounded-2xl p-4 space-y-3">
                          <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex flex-wrap items-center gap-4">
                              <div className="inline-flex items-center gap-1.5 text-sm font-extrabold text-[#0d9488]">
                                <ShieldCheck className="h-5 w-5 text-[#0d9488]" />
                                <span>
                                  {team.compatibilityPercentage}% Съвместимост
                                </span>
                                <span className="text-xs text-slate-400 font-semibold">
                                  (TBI: {team.teamBalanceIndex})
                                </span>
                              </div>

                              <div className="h-4 w-px bg-slate-200 hidden sm:block" />

                              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 font-semibold">
                                <span>
                                  4H Пълен:{" "}
                                  <strong className="text-[#0b1c30]">
                                    {team.roleBalance.isComplete4H
                                      ? "Да (100%)"
                                      : "Частичен"}
                                  </strong>
                                </span>
                                <span>•</span>
                                <span>
                                  Среден TPS:{" "}
                                  <strong className="text-[#0b1c30]">
                                    {team.averageTPS.toFixed(1)} т.
                                  </strong>
                                </span>
                                <span>•</span>
                                <span>
                                  Разнообразие:{" "}
                                  <strong className="text-[#0b1c30]">
                                    {team.diversityScore}%
                                  </strong>
                                </span>
                              </div>
                            </div>

                            <span className="text-[11px] font-bold text-slate-500">
                              TBI Формула: 70% Среден TPS + 15% 4H Покритие +
                              15% Разнообразие
                            </span>
                          </div>

                          <div className="w-full h-2 rounded-full bg-slate-200/70 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-sky-400 via-teal-500 to-emerald-400 shadow-[0_0_12px_rgba(45,212,191,0.55)] transition-all duration-500"
                              style={{
                                width: `${Math.min(
                                  100,
                                  team.compatibilityPercentage
                                )}%`,
                              }}
                            />
                          </div>
                        </div>

                        {/* Detailed 4-Member Breakdown Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          {team.members.map((member) => {
                            const roleTheme =
                              ROLE_4H_THEME[member.role.roleId];
                            const RoleIcon = roleTheme.Icon;
                            const q =
                              questionnaireByParticipantId.get(
                                member.questionnaireId
                              ) ||
                              questionnaireByParticipantId.get(
                                member.participantId
                              );
                            const strengths = getMemberStrengths(member, q);

                            return (
                              <div
                                key={member.participantId}
                                className={`rounded-2xl border p-4 flex flex-col justify-between gap-3.5 ${roleTheme.rowBg}`}
                              >
                                <div className="space-y-3">
                                  {/* Role Badge + TPS White Pill Insert */}
                                  <div className="flex items-center justify-between gap-2">
                                    <span
                                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${roleTheme.badge}`}
                                    >
                                      <RoleIcon className="h-3.5 w-3.5" />
                                      <span>{member.role.roleName}</span>
                                    </span>

                                    <div className="px-2.5 py-1 rounded-lg bg-white border border-slate-200/80 shadow-2xs inline-flex items-baseline gap-1">
                                      <span
                                        className={`text-xs font-extrabold ${roleTheme.scoreText}`}
                                      >
                                        {member.role.tps.toFixed(1)}
                                      </span>
                                      <span className="text-[10px] font-bold text-slate-400">
                                        TPS
                                      </span>
                                    </div>
                                  </div>

                                  {/* Name + School */}
                                  <div>
                                    <div className="text-sm font-extrabold text-[#0b1c30] leading-snug">
                                      {member.fullName}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[11px] text-slate-600 mt-1 font-medium">
                                      <School className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                                      <span>
                                        {member.schoolOrOrganization} •{" "}
                                        {member.gradeOrPosition} клас
                                      </span>
                                    </div>
                                  </div>

                                  {/* 5-те индекса (AI, EI, INI, ENI, MI) */}
                                  <div className="bg-white/90 rounded-xl p-3 border border-white space-y-2 shadow-2xs">
                                    <div className="flex items-center justify-between text-[11px]">
                                      <span className="font-extrabold text-[#0b1c30]">
                                        5-те индекса
                                      </span>
                                      <span className="font-mono text-[10px] text-slate-400">
                                        0–100
                                      </span>
                                    </div>
                                    <div className="space-y-1.5">
                                      {(
                                        Object.entries(
                                          member.role.indices
                                        ) as [string, number][]
                                      ).map(([idxKey, idxVal]) => (
                                        <div
                                          key={idxKey}
                                          className="flex items-center gap-2 text-[10px]"
                                        >
                                          <span className="w-7 font-mono font-bold text-slate-600">
                                            {idxKey}
                                          </span>
                                          <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                            <div
                                              className={`h-full rounded-full ${roleTheme.barColor}`}
                                              style={{
                                                width: `${Math.min(
                                                  100,
                                                  idxVal
                                                )}%`,
                                              }}
                                            />
                                          </div>
                                          <span className="w-6 text-right font-mono font-bold text-[#0b1c30]">
                                            {idxVal}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Силни страни: Checkmark list + Leading Indices Pills */}
                                  <div className="text-[11px] leading-relaxed bg-white/85 rounded-xl p-3 border border-white space-y-2.5 shadow-2xs">
                                    <div className="font-extrabold text-[#0b1c30]">
                                      Силни страни
                                    </div>

                                    <ul className="space-y-1.5">
                                      {strengths.items.map((item, idx) => (
                                        <li
                                          key={idx}
                                          className="flex items-start gap-1.5 text-slate-600"
                                        >
                                          <Check
                                            className={`h-3.5 w-3.5 shrink-0 mt-0.5 ${roleTheme.scoreText}`}
                                          />
                                          <span>{item}</span>
                                        </li>
                                      ))}
                                    </ul>

                                    <div className="pt-2 border-t border-slate-100/90 space-y-1.5">
                                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                        Водещи индекси
                                      </div>
                                      <div className="flex flex-wrap items-center gap-1.5">
                                        {strengths.topIndices.map(([k, v]) => (
                                          <span
                                            key={k}
                                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${roleTheme.badge}`}
                                          >
                                            <span>{k}</span>
                                            <span>({v})</span>
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {team.status === "unconfirmed" && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSwapModalState({
                                        teamId: team.id,
                                        teamName: displayTeamName,
                                        member,
                                      });
                                    }}
                                    className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-full text-xs font-bold bg-white hover:bg-teal-50 text-[#0d9488] border border-teal-200 shadow-2xs transition-colors cursor-pointer"
                                  >
                                    <ArrowLeftRight className="h-3.5 w-3.5" />
                                    <span>Смени</span>
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* ====================================================================
          3.5. TAB 3: АНКЕТА (Questionnaire Intake Form)
         ==================================================================== */}
      {activeTab === "questionnaire" && (
        <section className="max-w-3xl mx-auto">
          <div className="rounded-3xl plate-acrylic overflow-hidden">
            <div className="h-1.5 w-full bg-gradient-to-r from-sky-400 via-teal-500 to-emerald-400" />
            <div className="px-6 py-5 border-b border-slate-200/70 bg-white/60">
              <h2 className="text-base font-extrabold text-[#0b1c30]">
                Анкета за участие – {activeContest.name}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Попълнете трите части на въпросника, за да регистрирате нов участник в конкурса.
              </p>
            </div>

            <form
              onSubmit={handleQuestionnaireSubmit}
              className="p-6 space-y-6 text-xs"
            >
              {formSuccessMessage && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold">{formSuccessMessage}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab("participants")}
                    className="px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shrink-0 cursor-pointer"
                  >
                    Към Участници
                  </button>
                </div>
              )}

              {/* PART 1 */}
              <div className="p-5 rounded-2xl bg-white/90 border border-slate-200/70 shadow-2xs space-y-4">
                <div className="border-b border-slate-100 pb-2">
                  <h3 className="text-sm font-extrabold text-[#0b1c30]">
                    Част 1: Обща информация
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Идентификация и разпределение на участниците
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Име и фамилия *
                    </label>
                    <input
                      type="text"
                      required
                      value={formFullName}
                      onChange={(e) => setFormFullName(e.target.value)}
                      placeholder="напр. Десислава Тодорова"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50/80 focus:bg-white text-[#0b1c30] focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Имейл *
                    </label>
                    <input
                      type="email"
                      required
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="desislava.todorova@innovation.edu"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50/80 focus:bg-white text-[#0b1c30] focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Училище / Организация *
                    </label>
                    <input
                      type="text"
                      required
                      value={formSchool}
                      onChange={(e) => setFormSchool(e.target.value)}
                      placeholder='напр. СМГ "Паисий Хилендарски"'
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50/80 focus:bg-white text-[#0b1c30] focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Клас / Позиция *
                    </label>
                    <select
                      value={formGrade}
                      onChange={(e) => setFormGrade(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50/80 focus:bg-white text-[#0b1c30] focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
                    >
                      <option value="8 А">8 А</option>
                      <option value="9 А">9 А</option>
                      <option value="10 А">10 А</option>
                      <option value="10 Б">10 Б</option>
                      <option value="11 А">11 А</option>
                      <option value="11 Б">11 Б</option>
                      <option value="11 В">11 В</option>
                      <option value="12 А">12 А</option>
                      <option value="12 Б">12 Б</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* PART 2 */}
              <div className="p-5 rounded-2xl bg-white/90 border border-slate-200/70 shadow-2xs space-y-4">
                <div className="border-b border-slate-100 pb-2">
                  <h3 className="text-sm font-extrabold text-[#0b1c30]">
                    Част 2: Профил на кандидата (AI, EI, MI, INI, ENI)
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Количествени и ситуационни измерители
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      1. Среден успех (3.00 – 6.00)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="3.00"
                      max="6.00"
                      required
                      value={formGpa}
                      onChange={(e) => setFormGpa(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50/80 focus:bg-white text-[#0b1c30] focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      2. Брой извънкласни проекти и състезания
                    </label>
                    <select
                      value={formExtracurricular}
                      onChange={(e) =>
                        setFormExtracurricular(Number(e.target.value))
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50/80 focus:bg-white text-[#0b1c30] focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
                    >
                      <option value={0}>0 участия</option>
                      <option value={1}>1 участие</option>
                      <option value={2}>2 участия</option>
                      <option value={3}>3 участия</option>
                      <option value={4}>4+ участия</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1.5">
                      3. Каква е основната ви мотивация да се включите в тази бизнес работилница? (MI)
                    </label>
                    <select
                      value={formMotivation}
                      onChange={(e) =>
                        setFormMotivation(
                          Number(e.target.value) as 1 | 2 | 3 | 4 | 5
                        )
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/80 focus:bg-white text-[#0b1c30] focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
                    >
                      {MOTIVATION_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1.5">
                      4. Как реагирате, ако по време на работа в екип възникне неочакван проблем и работата блокира? (INI)
                    </label>
                    <select
                      value={formInitiative}
                      onChange={(e) =>
                        setFormInitiative(
                          Number(e.target.value) as 1 | 2 | 3 | 4 | 5
                        )
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/80 focus:bg-white text-[#0b1c30] focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
                    >
                      {INITIATIVE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1.5">
                      5. Разполагате с много ограничен бюджет и кратко време за стартиране на нов проект. Какъв е вашият подход? (ENI)
                    </label>
                    <select
                      value={formEntrepreneurial}
                      onChange={(e) =>
                        setFormEntrepreneurial(
                          Number(e.target.value) as 1 | 2 | 3 | 4 | 5
                        )
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/80 focus:bg-white text-[#0b1c30] focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
                    >
                      {ENTREPRENEURIAL_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* PART 3 */}
              <div className="p-5 rounded-2xl bg-white/90 border border-slate-200/70 shadow-2xs space-y-4">
                <div className="border-b border-slate-100 pb-2">
                  <h3 className="text-sm font-extrabold text-[#0d9488]">
                    Част 3: Ситуационни въпроси за екипна работа
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Изберете твърдението, което ви описва най-точно във всяка ситуация
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1.5">
                      1. Когато започвате работа в нов екип, вашата най-силна страна обикновено е:
                    </label>
                    <select
                      value={formQ1Role}
                      onChange={(e) =>
                        setFormQ1Role(e.target.value as Role4HId)
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/80 focus:bg-white text-[#0b1c30] focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
                    >
                      {ROLE_Q1_OPTIONS.map((o) => (
                        <option key={o.role} value={o.role}>
                          {o.text}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1.5">
                      2. Вашият отбор разполага с 2 часа до финалното предаване на проекта. Върху какво ще се фокусирате вие?
                    </label>
                    <select
                      value={formQ2Role}
                      onChange={(e) =>
                        setFormQ2Role(e.target.value as Role4HId)
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/80 focus:bg-white text-[#0b1c30] focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
                    >
                      {ROLE_Q2_OPTIONS.map((o) => (
                        <option key={o.role} value={o.role}>
                          {o.text}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1.5">
                      3. Какъв тип предизвикателство ви мотивира най-много в един проект?
                    </label>
                    <select
                      value={formQ3Role}
                      onChange={(e) =>
                        setFormQ3Role(e.target.value as Role4HId)
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/80 focus:bg-white text-[#0b1c30] focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
                    >
                      {ROLE_Q3_OPTIONS.map((o) => (
                        <option key={o.role} value={o.role}>
                          {o.text}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1.5">
                      4. Кое от следните изречения описва най-точно вашия стил на общуване?
                    </label>
                    <select
                      value={formQ4Role}
                      onChange={(e) =>
                        setFormQ4Role(e.target.value as Role4HId)
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/80 focus:bg-white text-[#0b1c30] focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
                    >
                      {ROLE_Q4_OPTIONS.map((o) => (
                        <option key={o.role} value={o.role}>
                          {o.text}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="submit"
                  disabled={isSubmittingForm}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-sky-500 via-teal-500 to-emerald-500 hover:brightness-105 disabled:opacity-60 text-white font-bold text-xs border-t border-white/40 shadow-[0_8px_20px_-4px_rgba(13,148,136,0.45)] transition-all cursor-pointer"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>
                    {isSubmittingForm ? "Записване..." : "Подай анкета"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </section>
      )}

      {/* ====================================================================
          QUESTIONNAIRE ANSWERS MODAL ("Виж отговори" in Tab 1)
         ==================================================================== */}
      {selectedParticipantModal && (
        <QuestionnaireModal
          participant={selectedParticipantModal}
          questionnaire={getQuestionnaire(selectedParticipantModal)}
          onClose={() => setSelectedParticipantModal(null)}
        />
      )}

      {/* ====================================================================
          3.4. MEMBER SWAP MODAL ("Размяна на участник – Роля: {Role}")
         ==================================================================== */}
      {swapModalState && (
        <SwapMemberModal
          swapModalState={swapModalState}
          swapCandidates={swapCandidates}
          onClose={() => setSwapModalState(null)}
          onExecuteSwap={handleExecuteSwap}
        />
      )}
    </div>
  );
}

/* ============================================================================
   Subcomponents
   ============================================================================ */

function formatTeamNameBg(rawName: string): string {
  return rawName.replace(/^Team\s+/i, "Отбор ");
}

function PipelineStatusBadge({
  status,
}: {
  status: EvaluationPipelineStatus;
}) {
  const map: Record<
    EvaluationPipelineStatus,
    { label: string; style: string; dot: string }
  > = {
    idle: {
      label: "Готов за профилиране",
      style: "bg-slate-100/90 text-slate-700 border-slate-200/80",
      dot: "bg-slate-400",
    },
    profiling_participants: {
      label: "Профилиране на участници...",
      style: "bg-sky-50/95 text-sky-700 border-sky-200",
      dot: "bg-sky-500 animate-ping",
    },
    forming_teams: {
      label: "Сформиране на отбори...",
      style: "bg-teal-50/95 text-[#0d9488] border-teal-200",
      dot: "bg-[#0d9488] animate-ping",
    },
    awaiting_confirmation: {
      label: "Очаква потвърждение",
      style: "bg-amber-50/95 text-amber-700 border-amber-200/80",
      dot: "bg-amber-500 shadow-[0_0_8px_rgba(217,119,6,0.6)]",
    },
    completed: {
      label: "Потвърдени отбори",
      style: "bg-emerald-50/95 text-emerald-700 border-emerald-200/80",
      dot: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]",
    },
    error: {
      label: "Грешка в пайплайна",
      style: "bg-red-50 text-red-700 border-red-200",
      dot: "bg-red-500",
    },
  };

  const item = map[status] || map.awaiting_confirmation;
  return (
    <span
      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border shadow-2xs ${item.style}`}
    >
      <span className={`h-2 w-2 rounded-full ${item.dot}`} />
      <span>{item.label}</span>
    </span>
  );
}

function TeamStatusBadge({ status }: { status: TeamDoc["status"] }) {
  if (status === "confirmed") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50/95 text-emerald-700 border border-emerald-200/80">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        <span>Потвърден</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50/95 text-amber-700 border border-amber-200/80">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
      <span>Непотвърден</span>
    </span>
  );
}

function SwapMemberModal({
  swapModalState,
  swapCandidates,
  onClose,
  onExecuteSwap,
}: {
  swapModalState: {
    teamId: string;
    teamName: string;
    member: TeamMemberSnapshot;
  };
  swapCandidates: {
    participantId: string;
    fullName: string;
    schoolOrOrganization: string;
    gradeOrPosition: string;
    tps: number;
    currentTeamName: string;
    currentTeamId: string | null;
  }[];
  onClose: () => void;
  onExecuteSwap: (targetParticipantId: string) => void;
}) {
  const roleTheme = ROLE_4H_THEME[swapModalState.member.role.roleId];
  const RoleIcon = roleTheme.Icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-[2px]">
      <div className="rounded-3xl plate-acrylic max-w-2xl w-full overflow-hidden flex flex-col max-h-[85vh]">
        <div className="h-1.5 w-full bg-gradient-to-r from-sky-400 via-teal-500 to-emerald-400" />
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200/70 flex items-center justify-between bg-white/70">
          <div className="flex items-center gap-2.5">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${roleTheme.badge}`}
            >
              <RoleIcon className="h-3.5 w-3.5" />
              <span>{swapModalState.member.role.roleName}</span>
            </span>
            <h3 className="text-sm font-extrabold text-[#0b1c30]">
              Размяна на участник – Роля: {swapModalState.member.role.roleName}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-[#0b1c30] hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Selected Member Reference at the Top */}
        <div className="px-6 py-3.5 border-b border-slate-200/70 bg-white/50">
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
            Избран участник за смяна ({swapModalState.teamName})
          </div>
          <div
            className={`px-4 py-3 rounded-2xl border flex items-center justify-between ${roleTheme.rowBg}`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`h-9 w-9 rounded-xl flex items-center justify-center border ${roleTheme.iconBox}`}
              >
                <RoleIcon className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs font-extrabold text-[#0b1c30]">
                  {swapModalState.member.fullName}
                </div>
                <div className="text-[11px] text-slate-500">
                  {swapModalState.member.schoolOrOrganization} •{" "}
                  {swapModalState.member.gradeOrPosition} клас
                </div>
              </div>
            </div>
            <div className="px-2.5 py-1 rounded-lg bg-white border border-slate-200/80 shadow-2xs inline-flex items-baseline gap-1">
              <span className={`text-xs font-extrabold ${roleTheme.scoreText}`}>
                {swapModalState.member.role.tps.toFixed(1)}
              </span>
              <span className="text-[10px] font-bold text-slate-400">TPS</span>
            </div>
          </div>
        </div>

        {/* Candidate List with the Exact Same 4H Role */}
        <div className="flex-1 overflow-y-auto p-6">
          {swapCandidates.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              Няма други профилирани участници с роля{" "}
              {swapModalState.member.role.roleName}.
            </div>
          ) : (
            <div className="bg-white/90 border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-500 text-[11px] font-extrabold uppercase tracking-wider">
                    <th className="py-3 pl-4 pr-2">Участник</th>
                    <th className="py-3 px-2">Училище и клас</th>
                    <th className="py-3 px-2">TPS бал</th>
                    <th className="py-3 px-2">Текущ отбор</th>
                    <th className="py-3 pl-2 pr-4 text-right">Действие</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {swapCandidates.map((cand) => (
                    <tr
                      key={cand.participantId}
                      className="hover:bg-teal-50/40 transition-colors"
                    >
                      <td className="py-3 pl-4 pr-2 font-extrabold text-[#0b1c30]">
                        <div className="flex items-center gap-2">
                          <RoleIcon className="h-3.5 w-3.5 text-[#0d9488] shrink-0" />
                          <span>{cand.fullName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-slate-600">
                        <div className="font-bold text-slate-800">
                          {cand.schoolOrOrganization}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {cand.gradeOrPosition} клас
                        </div>
                      </td>
                      <td className="py-3 px-2 font-extrabold text-[#0d9488]">
                        {cand.tps.toFixed(1)} TPS
                      </td>
                      <td className="py-3 px-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {cand.currentTeamName}
                        </span>
                      </td>
                      <td className="py-3 pl-2 pr-4 text-right">
                        <button
                          type="button"
                          onClick={() => onExecuteSwap(cand.participantId)}
                          className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-sky-500 via-teal-500 to-emerald-500 text-white font-bold text-xs shadow-2xs transition-all cursor-pointer"
                        >
                          <ArrowLeftRight className="h-3 w-3" />
                          <span>Размени</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function QuestionnaireModal({
  participant,
  questionnaire,
  onClose,
}: {
  participant: ParticipantDoc;
  questionnaire?: QuestionnaireDoc;
  onClose: () => void;
}) {
  const findLabel = (
    list: { value: number; label: string }[],
    val?: number
  ) => list.find((i) => i.value === val)?.label || "-";

  const findRoleText = (
    list: { role: Role4HId; text: string }[],
    role?: Role4HId
  ) => list.find((i) => i.role === role)?.text || "-";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-[2px]">
      <div className="rounded-3xl plate-acrylic max-w-2xl w-full overflow-hidden flex flex-col max-h-[85vh]">
        <div className="h-1.5 w-full bg-gradient-to-r from-sky-400 via-teal-500 to-emerald-400" />
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200/70 flex items-center justify-between bg-white/70">
          <div>
            <h3 className="text-sm font-extrabold text-[#0b1c30]">
              Отговори от анкета – {participant.fullName}
            </h3>
            <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5">
              <span className="inline-flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {participant.email}
              </span>
              <span className="inline-flex items-center gap-1">
                <School className="h-3 w-3" />
                {participant.schoolOrOrganization} ({participant.gradeOrPosition}{" "}
                клас)
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-[#0b1c30] hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {!questionnaire ? (
            <div className="text-center py-8 text-slate-500">
              Няма намерени данни за анкетата на този участник.
            </div>
          ) : (
            <>
              {/* Part 2 */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#0d9488]">
                  Част 2: Количествени и качествени въпроси
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-white/90 border border-slate-200/80 shadow-2xs">
                    <div className="text-slate-400 text-[11px] font-semibold">
                      Среден успех (GPA)
                    </div>
                    <div className="text-sm font-extrabold text-[#0d9488] mt-0.5">
                      {questionnaire.profileMetrics.gpa.toFixed(2)} / 6.00
                    </div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white/90 border border-slate-200/80 shadow-2xs">
                    <div className="text-slate-400 text-[11px] font-semibold">
                      Извънкласни проекти
                    </div>
                    <div className="text-sm font-extrabold text-[#0b1c30] mt-0.5">
                      {questionnaire.profileMetrics.extracurricularCount} участия
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div className="p-3.5 rounded-2xl bg-white/90 border border-slate-200/80 shadow-2xs">
                    <div className="font-bold text-[#0b1c30] mb-1">
                      Мотивация (MI –{" "}
                      {questionnaire.profileMetrics.motivationScoreRaw}/5 т.):
                    </div>
                    <div className="text-slate-600">
                      {findLabel(
                        MOTIVATION_OPTIONS,
                        questionnaire.profileMetrics.motivationScoreRaw
                      )}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/90 border border-slate-200/80 shadow-2xs">
                    <div className="font-bold text-[#0b1c30] mb-1">
                      Инициативност (INI –{" "}
                      {questionnaire.profileMetrics.initiativeScoreRaw}/5 т.):
                    </div>
                    <div className="text-slate-600">
                      {findLabel(
                        INITIATIVE_OPTIONS,
                        questionnaire.profileMetrics.initiativeScoreRaw
                      )}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/90 border border-slate-200/80 shadow-2xs">
                    <div className="font-bold text-[#0b1c30] mb-1">
                      Предприемачески подход (ENI –{" "}
                      {questionnaire.profileMetrics.entrepreneurialScoreRaw}/5
                      т.):
                    </div>
                    <div className="text-slate-600">
                      {findLabel(
                        ENTREPRENEURIAL_OPTIONS,
                        questionnaire.profileMetrics.entrepreneurialScoreRaw
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Part 3 */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-sky-600">
                  Част 3: Ситуационен избор (4H Ролеви профил)
                </h4>
                <div className="space-y-2.5">
                  {(
                    [
                      {
                        qLabel: "1. Най-силна страна в нов екип",
                        role: questionnaire.roleAssessmentAnswers
                          .q1_teamStrength,
                        options: ROLE_Q1_OPTIONS,
                      },
                      {
                        qLabel: "2. Фокус 2 часа преди краен срок",
                        role: questionnaire.roleAssessmentAnswers
                          .q2_deadlineFocus,
                        options: ROLE_Q2_OPTIONS,
                      },
                      {
                        qLabel: "3. Мотивиращо предизвикателство",
                        role: questionnaire.roleAssessmentAnswers
                          .q3_challengeType,
                        options: ROLE_Q3_OPTIONS,
                      },
                      {
                        qLabel: "4. Стил на общуване",
                        role: questionnaire.roleAssessmentAnswers
                          .q4_communicationStyle,
                        options: ROLE_Q4_OPTIONS,
                      },
                    ] as const
                  ).map((item, i) => {
                    const rTheme = ROLE_4H_THEME[item.role];
                    const RoleIcon = rTheme.Icon;
                    return (
                      <div
                        key={i}
                        className="p-3.5 rounded-2xl bg-white/90 border border-slate-200/80 shadow-2xs flex items-start justify-between gap-3"
                      >
                        <div>
                          <div className="font-bold text-[#0b1c30]">
                            {item.qLabel}
                          </div>
                          <div className="text-slate-600 mt-0.5">
                            {findRoleText(item.options, item.role)}
                          </div>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${rTheme.badge}`}
                        >
                          <RoleIcon className="h-3 w-3" />
                          <span>{rTheme.name}</span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="px-6 py-3.5 border-t border-slate-200/70 bg-white/60 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-gradient-to-r from-sky-500 via-teal-500 to-emerald-500 text-white text-xs font-bold shadow-2xs cursor-pointer"
          >
            Затвори
          </button>
        </div>
      </div>
    </div>
  );
}
