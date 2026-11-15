import {
  initializeApp as initAdminApp,
  cert,
  getApps as getAdminApps,
  App as AdminApp,
} from "firebase-admin/app";
import {
  getFirestore as getAdminFirestore,
  Firestore as AdminFirestore,
} from "firebase-admin/firestore";
import {
  initializeApp as initWebApp,
  getApps as getWebApps,
  FirebaseApp as WebFirebaseApp,
} from "firebase/app";
import {
  getFirestore as getWebFirestore,
  Firestore as WebFirestore,
  doc as webDoc,
  setDoc as webSetDoc,
  getDoc as webGetDoc,
  collection as webCollection,
  getDocs as webGetDocs,
  query as webQuery,
  where as webWhere,
  deleteDoc as webDeleteDoc,
} from "firebase/firestore";
import {
  AgentThoughtDoc,
  EvaluationDoc,
  EvaluationPipelineStatus,
  ParticipantDoc,
  QuestionnaireDoc,
  QuestionnaireSubmissionInput,
  TeamDoc,
} from "./types/schema.js";

export * from "./types/schema.js";

export const DEFAULT_EVALUATION_ID = "student-cohort-2026";

function isPlaceholder(val?: string): boolean {
  if (!val) return true;
  return (
    val.startsWith("YOUR_") ||
    val.startsWith("MY_") ||
    val === "your_gemini_api_key_here"
  );
}

let adminDb: AdminFirestore | null = null;
let webDb: WebFirestore | null = null;
let firestoreMode: "admin" | "web-sdk" | "memory" = "memory";

const ENABLE_FIRESTORE = process.env.ENABLE_FIRESTORE !== "false";

export function initFirestore(): {
  adminDb: AdminFirestore | null;
  webDb: WebFirestore | null;
  mode: "admin" | "web-sdk" | "memory";
} {
  if (!ENABLE_FIRESTORE) {
    firestoreMode = "memory";
    return { adminDb: null, webDb: null, mode: "memory" };
  }

  if (adminDb || webDb) {
    return { adminDb, webDb, mode: firestoreMode };
  }

  const projectId =
    process.env.FIREBASE_PROJECT_ID ||
    process.env.VITE_FIREBASE_PROJECT_ID ||
    "team-evaluator-973eb";
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const isCloudRun = Boolean(process.env.K_SERVICE);
  const hasAdcFile = Boolean(process.env.GOOGLE_APPLICATION_CREDENTIALS);

  // 1. Try Firebase Admin SDK if service account or ADC is configured
  if (
    (!isPlaceholder(projectId) &&
      !isPlaceholder(clientEmail) &&
      !isPlaceholder(privateKey)) ||
    isCloudRun ||
    hasAdcFile
  ) {
    try {
      let app: AdminApp;
      if (getAdminApps().length > 0) {
        app = getAdminApps()[0]!;
      } else if (
        !isPlaceholder(projectId) &&
        !isPlaceholder(clientEmail) &&
        !isPlaceholder(privateKey)
      ) {
        app = initAdminApp({
          credential: cert({
            projectId,
            clientEmail,
            privateKey,
          }),
        });
      } else {
        app = initAdminApp(projectId && !isPlaceholder(projectId) ? { projectId } : undefined);
      }
      adminDb = getAdminFirestore(app);
      firestoreMode = "admin";
      return { adminDb, webDb: null, mode: "admin" };
    } catch (err) {
      console.warn("Firebase Admin SDK initialization failed, trying Web SDK:", err);
    }
  }

  // 2. Initialize Firebase Web SDK against Cloud Firestore (`team-evaluator-973eb`)
  try {
    const firebaseWebConfig = {
      apiKey:
        process.env.FIREBASE_API_KEY ||
        process.env.VITE_FIREBASE_API_KEY ||
        "AIzaSyC6RLai6GY-hRp9kOvrggdO-nlgG5fVplE",
      authDomain:
        process.env.FIREBASE_AUTH_DOMAIN ||
        process.env.VITE_FIREBASE_AUTH_DOMAIN ||
        `${projectId}.firebaseapp.com`,
      projectId,
      storageBucket:
        process.env.FIREBASE_STORAGE_BUCKET ||
        process.env.VITE_FIREBASE_STORAGE_BUCKET ||
        `${projectId}.firebasestorage.app`,
      messagingSenderId:
        process.env.FIREBASE_MESSAGING_SENDER_ID ||
        process.env.VITE_FIREBASE_MESSAGING_SENDER_ID ||
        "610694951262",
      appId:
        process.env.FIREBASE_APP_ID ||
        process.env.VITE_FIREBASE_APP_ID ||
        "1:610694951262:web:29ab381c17ce803b469fcf",
    };

    const app: WebFirebaseApp =
      getWebApps().length > 0 ? getWebApps()[0]! : initWebApp(firebaseWebConfig);
    webDb = getWebFirestore(app);
    firestoreMode = "web-sdk";
    return { adminDb: null, webDb, mode: "web-sdk" };
  } catch (err) {
    console.warn("Firebase Web SDK initialization failed (using in-memory store):", err);
    firestoreMode = "memory";
    return { adminDb: null, webDb: null, mode: "memory" };
  }
}

export function getFirestoreStatus(): {
  enabled: boolean;
  mode: "firestore" | "memory";
  driver: "admin" | "web-sdk" | "memory";
  projectId: string;
} {
  const { mode } = initFirestore();
  return {
    enabled: mode !== "memory",
    mode: mode !== "memory" ? "firestore" : "memory",
    driver: mode,
    projectId: process.env.FIREBASE_PROJECT_ID || "team-evaluator-973eb",
  };
}

// In-memory mirrors for fast synchronous/fallback access
const memoryEvaluations = new Map<string, EvaluationDoc>();
const memoryQuestionnaires = new Map<string, QuestionnaireDoc>();
const memoryParticipants = new Map<string, ParticipantDoc>();
const memoryTeams = new Map<string, TeamDoc>();
const memoryThoughts = new Map<string, AgentThoughtDoc>();

// Helper to write a document to both root collection `{collectionName}/{docId}`
// AND subcollection `evaluations/{evaluationId}/{collectionName}/{docId}`
async function writeFirestoreDocument<T extends object>(
  collectionName: string,
  docId: string,
  data: T,
  evaluationId?: string
): Promise<void> {
  const { adminDb: aDb, webDb: wDb, mode } = initFirestore();
  if (mode === "memory") return;

  const cleanData = JSON.parse(JSON.stringify(data));

  try {
    if (aDb) {
      await aDb.collection(collectionName).doc(docId).set(cleanData, { merge: true });
      if (evaluationId && collectionName !== "evaluations") {
        await aDb
          .collection("evaluations")
          .doc(evaluationId)
          .collection(collectionName)
          .doc(docId)
          .set(cleanData, { merge: true });
      }
    } else if (wDb) {
      await webSetDoc(webDoc(wDb, collectionName, docId), cleanData, { merge: true });
      if (evaluationId && collectionName !== "evaluations") {
        await webSetDoc(
          webDoc(wDb, "evaluations", evaluationId, collectionName, docId),
          cleanData,
          { merge: true }
        );
      }
    }
  } catch (err) {
    console.warn(`Firestore write failed for ${collectionName}/${docId}:`, err);
  }
}

async function deleteFirestoreDocument(
  collectionName: string,
  docId: string,
  evaluationId?: string
): Promise<void> {
  const { adminDb: aDb, webDb: wDb, mode } = initFirestore();
  if (mode === "memory") return;

  try {
    if (aDb) {
      await aDb.collection(collectionName).doc(docId).delete();
      if (evaluationId && collectionName !== "evaluations") {
        await aDb
          .collection("evaluations")
          .doc(evaluationId)
          .collection(collectionName)
          .doc(docId)
          .delete();
      }
    } else if (wDb) {
      await webDeleteDoc(webDoc(wDb, collectionName, docId));
      if (evaluationId && collectionName !== "evaluations") {
        await webDeleteDoc(
          webDoc(wDb, "evaluations", evaluationId, collectionName, docId)
        );
      }
    }
  } catch (err) {
    console.warn(`Firestore delete failed for ${collectionName}/${docId}:`, err);
  }
}

async function queryByEvaluationId<T>(
  collectionName: string,
  evaluationId: string
): Promise<T[]> {
  const { adminDb: aDb, webDb: wDb, mode } = initFirestore();
  if (mode === "memory") return [];

  try {
    if (aDb) {
      const snap = await aDb
        .collection(collectionName)
        .where("evaluationId", "==", evaluationId)
        .get();
      return snap.docs.map((d) => d.data() as T);
    } else if (wDb) {
      const q = webQuery(
        webCollection(wDb, collectionName),
        webWhere("evaluationId", "==", evaluationId)
      );
      const snap = await webGetDocs(q);
      return snap.docs.map((d) => d.data() as T);
    }
  } catch (err) {
    console.warn(`Firestore query failed on ${collectionName} for ${evaluationId}:`, err);
  }
  return [];
}

// ============================================================================
// 1. Evaluations (`evaluations/{evaluationId}`)
// ============================================================================

export function createDefaultEvaluationDoc(
  evaluationId: string = DEFAULT_EVALUATION_ID,
  title: string = "AI Innovation Evaluator – Campaign 2026"
): EvaluationDoc {
  const now = new Date().toISOString();
  return {
    id: evaluationId,
    title,
    status: "idle",
    config: {
      targetCohortSize: 96,
      teamSize: 4,
      maxTbiSpread: 15.0,
    },
    participantIds: [],
    teamIds: [],
    recentThoughtIds: [],
    metrics: {
      totalParticipants: 0,
      profiledParticipants: 0,
      selectedParticipants: 0,
      totalTeamsFormed: 0,
      confirmedTeamsCount: 0,
      averageCohortTPS: 0,
      currentTbiSpread: 0,
    },
    errorMessage: null,
    createdAt: now,
    updatedAt: now,
  };
}

export async function getEvaluationDoc(
  evaluationId: string = DEFAULT_EVALUATION_ID
): Promise<EvaluationDoc | null> {
  const { adminDb: aDb, webDb: wDb, mode } = initFirestore();
  if (mode !== "memory") {
    try {
      if (aDb) {
        const snap = await aDb.collection("evaluations").doc(evaluationId).get();
        if (snap.exists) {
          const data = snap.data() as EvaluationDoc;
          memoryEvaluations.set(evaluationId, data);
          return data;
        }
      } else if (wDb) {
        const snap = await webGetDoc(webDoc(wDb, "evaluations", evaluationId));
        if (snap.exists()) {
          const data = snap.data() as EvaluationDoc;
          memoryEvaluations.set(evaluationId, data);
          return data;
        }
      }
    } catch (err) {
      console.warn(`Failed to read evaluation ${evaluationId} from Firestore:`, err);
    }
  }
  return memoryEvaluations.get(evaluationId) ?? null;
}

export async function upsertEvaluationDoc(
  evaluationId: string,
  patch: Partial<EvaluationDoc>
): Promise<EvaluationDoc> {
  const existing =
    (await getEvaluationDoc(evaluationId)) ?? createDefaultEvaluationDoc(evaluationId);

  const updated: EvaluationDoc = {
    ...existing,
    ...patch,
    id: evaluationId,
    config: {
      ...existing.config,
      ...(patch.config ?? {}),
    },
    metrics: {
      ...existing.metrics,
      ...(patch.metrics ?? {}),
    },
    updatedAt: new Date().toISOString(),
  };

  memoryEvaluations.set(evaluationId, updated);
  await writeFirestoreDocument("evaluations", evaluationId, updated);
  return updated;
}

// ============================================================================
// 2. Questionnaires (`questionnaires/{questionnaireId}`) & Participants (`participants/{participantId}`)
// ============================================================================

export async function saveQuestionnaireSubmission(
  input: QuestionnaireSubmissionInput
): Promise<{
  questionnaire: QuestionnaireDoc;
  participant: ParticipantDoc;
  evaluation: EvaluationDoc;
}> {
  const now = new Date().toISOString();
  const evaluationId = input.evaluationId || DEFAULT_EVALUATION_ID;

  // Deterministic IDs when provided or derived from participant name/index
  const slug = input.generalInfo.fullName
    .toLowerCase()
    .replace(/[^a-z0-9а-я]+/gi, "-")
    .replace(/^-+|-+$/g, "");
  const participantId = input.participantId || `part-${slug || Date.now()}`;
  const questionnaireId = input.id || `quest-${participantId.replace(/^part-/, "")}`;

  const email =
    input.email ||
    `${slug || "student"}@innovation.edu`;

  const questionnaire: QuestionnaireDoc = {
    id: questionnaireId,
    evaluationId,
    participantId,
    submittedAt: input.submittedAt || now,
    generalInfo: {
      fullName: input.generalInfo.fullName.trim(),
      schoolOrOrganization: input.generalInfo.schoolOrOrganization.trim(),
      gradeOrPosition: input.generalInfo.gradeOrPosition.trim(),
    },
    profileMetrics: {
      gpa: Number(input.profileMetrics.gpa),
      extracurricularCount: Math.max(0, Math.round(Number(input.profileMetrics.extracurricularCount))),
      motivationScoreRaw: input.profileMetrics.motivationScoreRaw,
      initiativeScoreRaw: input.profileMetrics.initiativeScoreRaw,
      entrepreneurialScoreRaw: input.profileMetrics.entrepreneurialScoreRaw,
    },
    roleAssessmentAnswers: {
      q1_teamStrength: input.roleAssessmentAnswers.q1_teamStrength,
      q2_deadlineFocus: input.roleAssessmentAnswers.q2_deadlineFocus,
      q3_challengeType: input.roleAssessmentAnswers.q3_challengeType,
      q4_communicationStyle: input.roleAssessmentAnswers.q4_communicationStyle,
    },
  };

  // Strict schema compliance: Upon initial registration, `role` is strictly initialized to `null`
  const participant: ParticipantDoc = {
    id: participantId,
    evaluationId,
    fullName: questionnaire.generalInfo.fullName,
    email,
    schoolOrOrganization: questionnaire.generalInfo.schoolOrOrganization,
    gradeOrPosition: questionnaire.generalInfo.gradeOrPosition,
    questionnaireId,
    isSelected: false,
    selectionRank: null,
    role: null,
    createdAt: now,
    updatedAt: now,
  };

  memoryQuestionnaires.set(questionnaire.id, questionnaire);
  memoryParticipants.set(participant.id, participant);

  await Promise.all([
    writeFirestoreDocument("questionnaires", questionnaire.id, questionnaire, evaluationId),
    writeFirestoreDocument("participants", participant.id, participant, evaluationId),
  ]);

  // Update evaluation document participantIds and metrics
  const existingEval =
    (await getEvaluationDoc(evaluationId)) ?? createDefaultEvaluationDoc(evaluationId);
  const participantIds = Array.from(
    new Set([...(existingEval.participantIds || []), participant.id])
  );

  const evaluation = await upsertEvaluationDoc(evaluationId, {
    participantIds,
    metrics: {
      ...existingEval.metrics,
      totalParticipants: participantIds.length,
    },
  });

  return { questionnaire, participant, evaluation };
}

export async function saveBatchQuestionnaireSubmissions(
  inputs: QuestionnaireSubmissionInput[],
  evaluationId: string = DEFAULT_EVALUATION_ID
): Promise<{
  questionnaires: QuestionnaireDoc[];
  participants: ParticipantDoc[];
  evaluation: EvaluationDoc;
}> {
  const questionnaires: QuestionnaireDoc[] = [];
  const participants: ParticipantDoc[] = [];
  const now = new Date().toISOString();

  for (let i = 0; i < inputs.length; i++) {
    const input = inputs[i]!;
    const evalId = input.evaluationId || evaluationId;
    const participantId = input.participantId || `participant-${String(i + 1).padStart(2, "0")}`;
    const questionnaireId = input.id || `questionnaire-${String(i + 1).padStart(2, "0")}`;
    const email =
      input.email || `student${i + 1}@innovation.edu`;

    const questionnaire: QuestionnaireDoc = {
      id: questionnaireId,
      evaluationId: evalId,
      participantId,
      submittedAt: input.submittedAt || now,
      generalInfo: {
        fullName: input.generalInfo.fullName.trim(),
        schoolOrOrganization: input.generalInfo.schoolOrOrganization.trim(),
        gradeOrPosition: input.generalInfo.gradeOrPosition.trim(),
      },
      profileMetrics: {
        gpa: Number(input.profileMetrics.gpa),
        extracurricularCount: Math.max(
          0,
          Math.round(Number(input.profileMetrics.extracurricularCount))
        ),
        motivationScoreRaw: input.profileMetrics.motivationScoreRaw,
        initiativeScoreRaw: input.profileMetrics.initiativeScoreRaw,
        entrepreneurialScoreRaw: input.profileMetrics.entrepreneurialScoreRaw,
      },
      roleAssessmentAnswers: {
        q1_teamStrength: input.roleAssessmentAnswers.q1_teamStrength,
        q2_deadlineFocus: input.roleAssessmentAnswers.q2_deadlineFocus,
        q3_challengeType: input.roleAssessmentAnswers.q3_challengeType,
        q4_communicationStyle: input.roleAssessmentAnswers.q4_communicationStyle,
      },
    };

    const participant: ParticipantDoc = {
      id: participantId,
      evaluationId: evalId,
      fullName: questionnaire.generalInfo.fullName,
      email,
      schoolOrOrganization: questionnaire.generalInfo.schoolOrOrganization,
      gradeOrPosition: questionnaire.generalInfo.gradeOrPosition,
      questionnaireId,
      isSelected: false,
      selectionRank: null,
      role: null,
      createdAt: now,
      updatedAt: now,
    };

    memoryQuestionnaires.set(questionnaire.id, questionnaire);
    memoryParticipants.set(participant.id, participant);
    questionnaires.push(questionnaire);
    participants.push(participant);
  }

  await Promise.all([
    ...questionnaires.map((q) =>
      writeFirestoreDocument("questionnaires", q.id, q, q.evaluationId)
    ),
    ...participants.map((p) =>
      writeFirestoreDocument("participants", p.id, p, p.evaluationId)
    ),
  ]);

  const existingEval =
    (await getEvaluationDoc(evaluationId)) ?? createDefaultEvaluationDoc(evaluationId);
  const allParticipantIds = Array.from(
    new Set([
      ...(existingEval.participantIds || []),
      ...participants.map((p) => p.id),
    ])
  );

  const evaluation = await upsertEvaluationDoc(evaluationId, {
    participantIds: allParticipantIds,
    metrics: {
      ...existingEval.metrics,
      totalParticipants: allParticipantIds.length,
    },
  });

  return { questionnaires, participants, evaluation };
}

export async function getQuestionnairesByEvaluation(
  evaluationId: string = DEFAULT_EVALUATION_ID
): Promise<QuestionnaireDoc[]> {
  const remote = await queryByEvaluationId<QuestionnaireDoc>("questionnaires", evaluationId);
  if (remote.length > 0) {
    for (const q of remote) {
      memoryQuestionnaires.set(q.id, q);
    }
    return remote.sort((a, b) => a.id.localeCompare(b.id));
  }
  return Array.from(memoryQuestionnaires.values())
    .filter((q) => q.evaluationId === evaluationId)
    .sort((a, b) => a.id.localeCompare(b.id));
}

export async function getParticipantsByEvaluation(
  evaluationId: string = DEFAULT_EVALUATION_ID
): Promise<ParticipantDoc[]> {
  const remote = await queryByEvaluationId<ParticipantDoc>("participants", evaluationId);
  if (remote.length > 0) {
    for (const p of remote) {
      memoryParticipants.set(p.id, p);
    }
    return remote.sort((a, b) => a.id.localeCompare(b.id));
  }
  return Array.from(memoryParticipants.values())
    .filter((p) => p.evaluationId === evaluationId)
    .sort((a, b) => a.id.localeCompare(b.id));
}

export async function upsertParticipantDoc(
  participant: ParticipantDoc
): Promise<ParticipantDoc> {
  const updated: ParticipantDoc = {
    ...participant,
    updatedAt: new Date().toISOString(),
  };
  memoryParticipants.set(updated.id, updated);
  await writeFirestoreDocument("participants", updated.id, updated, updated.evaluationId);
  return updated;
}

// ============================================================================
// 3. Teams (`teams/{teamId}`)
// ============================================================================

export async function getTeamsByEvaluation(
  evaluationId: string = DEFAULT_EVALUATION_ID
): Promise<TeamDoc[]> {
  const remote = await queryByEvaluationId<TeamDoc>("teams", evaluationId);
  if (remote.length > 0) {
    for (const t of remote) {
      memoryTeams.set(t.id, t);
    }
    return remote.sort((a, b) => a.name.localeCompare(b.name));
  }
  return Array.from(memoryTeams.values())
    .filter((t) => t.evaluationId === evaluationId)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function clearTeamsForEvaluation(
  evaluationId: string = DEFAULT_EVALUATION_ID
): Promise<void> {
  const existingTeams = await getTeamsByEvaluation(evaluationId);
  await Promise.all(
    existingTeams.map(async (t) => {
      memoryTeams.delete(t.id);
      await deleteFirestoreDocument("teams", t.id, evaluationId);
    })
  );
}

export async function upsertTeamDoc(team: TeamDoc): Promise<TeamDoc> {
  memoryTeams.set(team.id, team);
  await writeFirestoreDocument("teams", team.id, team, team.evaluationId);
  return team;
}

// ============================================================================
// 4. Agent Thoughts (`agent_thoughts/{thoughtId}`)
// ============================================================================

let sequenceCounters = new Map<string, number>();

export async function clearThoughtsForEvaluation(
  evaluationId: string = DEFAULT_EVALUATION_ID
): Promise<void> {
  sequenceCounters.set(evaluationId, 0);
  const existing = await getAgentThoughtsByEvaluation(evaluationId);
  await Promise.all(
    existing.map(async (th) => {
      memoryThoughts.delete(th.id);
      await deleteFirestoreDocument("agent_thoughts", th.id, evaluationId);
    })
  );
}

export async function appendAgentThought(
  evaluationId: string,
  thoughtInput: {
    agentName: AgentThoughtDoc["agentName"];
    phase: AgentThoughtDoc["phase"];
    message: string;
    metadata?: AgentThoughtDoc["metadata"];
  },
  evaluationPatch?: Partial<EvaluationDoc>
): Promise<AgentThoughtDoc> {
  const currentSeq = (sequenceCounters.get(evaluationId) ?? 0) + 1;
  sequenceCounters.set(evaluationId, currentSeq);

  const thoughtId = `${evaluationId}-thought-${String(currentSeq).padStart(4, "0")}`;
  const thought: AgentThoughtDoc = {
    id: thoughtId,
    evaluationId,
    agentName: thoughtInput.agentName,
    phase: thoughtInput.phase,
    message: thoughtInput.message,
    ...(thoughtInput.metadata ? { metadata: thoughtInput.metadata } : {}),
    sequenceNumber: currentSeq,
    timestamp: new Date().toISOString(),
  };

  memoryThoughts.set(thought.id, thought);
  await writeFirestoreDocument("agent_thoughts", thought.id, thought, evaluationId);

  const existingEval =
    (await getEvaluationDoc(evaluationId)) ?? createDefaultEvaluationDoc(evaluationId);
  const recentThoughtIds = [...(existingEval.recentThoughtIds || []), thought.id].slice(-50);

  await upsertEvaluationDoc(evaluationId, {
    ...(evaluationPatch ?? {}),
    recentThoughtIds,
  });

  return thought;
}

export async function getAgentThoughtsByEvaluation(
  evaluationId: string = DEFAULT_EVALUATION_ID
): Promise<AgentThoughtDoc[]> {
  const remote = await queryByEvaluationId<AgentThoughtDoc>("agent_thoughts", evaluationId);
  if (remote.length > 0) {
    for (const th of remote) {
      memoryThoughts.set(th.id, th);
    }
    return remote.sort((a, b) => a.sequenceNumber - b.sequenceNumber);
  }
  return Array.from(memoryThoughts.values())
    .filter((th) => th.evaluationId === evaluationId)
    .sort((a, b) => a.sequenceNumber - b.sequenceNumber);
}

export async function getFullEvaluationSnapshot(
  evaluationId: string = DEFAULT_EVALUATION_ID
): Promise<{
  evaluation: EvaluationDoc;
  questionnaires: QuestionnaireDoc[];
  participants: ParticipantDoc[];
  teams: TeamDoc[];
  agentThoughts: AgentThoughtDoc[];
}> {
  const [evalDoc, questionnaires, participants, teams, agentThoughts] =
    await Promise.all([
      getEvaluationDoc(evaluationId),
      getQuestionnairesByEvaluation(evaluationId),
      getParticipantsByEvaluation(evaluationId),
      getTeamsByEvaluation(evaluationId),
      getAgentThoughtsByEvaluation(evaluationId),
    ]);

  const evaluation = evalDoc ?? createDefaultEvaluationDoc(evaluationId);
  return {
    evaluation,
    questionnaires,
    participants,
    teams,
    agentThoughts,
  };
}
