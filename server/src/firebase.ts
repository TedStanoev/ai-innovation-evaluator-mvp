import { initializeApp, cert, getApps, App } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";

export interface ThoughtLogEntry {
  agent: "Profiling Agent" | "Team Formation Agent";
  step: string;
  message: string;
  timestamp: string;
}

export type TeamRole = "Лидер" | "Новатор" | "Аналитик" | "Организатор";

export interface StudentQuestionnaire {
  id: string;
  name: string;
  age: number;
  school: string;
  grade: string;
  email: string;
  gpa: string;
  competitions: string;
  experience: string;
  motivation: string;
  problemSolving: string;
  teamConflict: string;
  budget200: string;
  newProjectRole: string;
  hours48Role: string;
  storeCaseRole: string;
}

export interface StudentIndices {
  AI: number;
  MI: number;
  EI: number;
  ENI: number;
  LAI: number;
  LPI: number;
}

export interface EvaluatedStudentProfile {
  studentId: string;
  name: string;
  age: number;
  school: string;
  grade: string;
  email: string;
  indices: StudentIndices;
  tps: number;
  role: TeamRole;
  rawProfileLine: string;
}

export interface FormedTeam {
  id: string;
  name: string;
  compatibilityPercent: number;
  roleBalanceScore: number;
  averageTps: number;
  diversityScore: number;
  members: EvaluatedStudentProfile[];
  rationale: string;
}

export interface SubmissionDocument {
  id: string;
  title: string;
  status: "pending" | "analyzing" | "auditing" | "needs_review" | "evaluated";
  totalScore: number;
  updatedAt?: string;
  students?: StudentQuestionnaire[];
  evaluatedStudents?: EvaluatedStudentProfile[];
  teams?: FormedTeam[];
  agent1RawOutput?: string;
  agent2RawOutput?: string;
  thoughtLogs: ThoughtLogEntry[];
}

function isPlaceholder(val?: string): boolean {
  if (!val) return true;
  return (
    val.startsWith("YOUR_") ||
    val.startsWith("MY_") ||
    val === "your_gemini_api_key_here"
  );
}

let firestoreDb: Firestore | null = null;
let isFirestoreEnabled = false;

export function initFirestore(): Firestore | null {
  if (firestoreDb) return firestoreDb;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const isCloudRun = Boolean(process.env.K_SERVICE);
  const hasAdcFile = Boolean(process.env.GOOGLE_APPLICATION_CREDENTIALS);

  try {
    let app: App;
    if (getApps().length > 0) {
      app = getApps()[0]!;
    } else if (
      !isPlaceholder(projectId) &&
      !isPlaceholder(clientEmail) &&
      !isPlaceholder(privateKey)
    ) {
      app = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      isFirestoreEnabled = true;
    } else if (isCloudRun || hasAdcFile) {
      app = initializeApp(projectId && !isPlaceholder(projectId) ? { projectId } : undefined);
      isFirestoreEnabled = true;
    } else {
      isFirestoreEnabled = false;
      return null;
    }

    firestoreDb = getFirestore(app);
    return firestoreDb;
  } catch (err) {
    console.warn("Firestore Admin initialization skipped (using in-memory store):", err);
    isFirestoreEnabled = false;
    return null;
  }
}

export function getFirestoreStatus(): { enabled: boolean; mode: "firestore" | "memory" } {
  initFirestore();
  return {
    enabled: isFirestoreEnabled,
    mode: isFirestoreEnabled ? "firestore" : "memory",
  };
}

// In-memory store (always kept in sync and acts as primary store when local credentials are placeholders)
const memorySubmissions = new Map<string, SubmissionDocument>();

export async function getSubmissionById(id: string): Promise<SubmissionDocument | null> {
  const local = memorySubmissions.get(id);
  const db = initFirestore();
  if (db && isFirestoreEnabled) {
    try {
      const snap = await db.collection("submissions").doc(id).get();
      if (snap.exists) {
        const data = snap.data() as SubmissionDocument;
        memorySubmissions.set(id, data);
        return data;
      }
    } catch (err) {
      console.warn(`Firestore read failed for ${id}, falling back to memory:`, err);
    }
  }
  return local ?? null;
}

export async function upsertSubmission(
  id: string,
  patch: Partial<SubmissionDocument>
): Promise<SubmissionDocument> {
  const existing = (await getSubmissionById(id)) ?? {
    id,
    title: patch.title ?? "Student Cohort Evaluation",
    status: "pending",
    totalScore: 0,
    thoughtLogs: [],
  };

  const updated: SubmissionDocument = {
    ...existing,
    ...patch,
    id,
    updatedAt: new Date().toISOString(),
    thoughtLogs: patch.thoughtLogs ?? existing.thoughtLogs ?? [],
  };

  memorySubmissions.set(id, updated);

  const db = initFirestore();
  if (db && isFirestoreEnabled) {
    try {
      await db.collection("submissions").doc(id).set(updated, { merge: true });
    } catch (err) {
      console.warn(`Firestore write failed for ${id} (kept in memory):`, err);
    }
  }

  return updated;
}

export async function appendSubmissionThoughtLog(
  id: string,
  log: ThoughtLogEntry,
  additionalPatch: Partial<SubmissionDocument> = {}
): Promise<SubmissionDocument> {
  const existing = await getSubmissionById(id);
  const currentLogs = existing?.thoughtLogs ?? [];
  const nextLogs = [...currentLogs, log];
  return upsertSubmission(id, {
    ...additionalPatch,
    thoughtLogs: nextLogs,
  });
}
