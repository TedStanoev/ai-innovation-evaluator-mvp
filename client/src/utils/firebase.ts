import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import {
  getFirestore,
  doc,
  collection,
  query,
  where,
  onSnapshot,
  Firestore,
  Unsubscribe,
} from "firebase/firestore";
import {
  AgentThoughtDoc,
  EvaluationDoc,
  FullEvaluationSnapshot,
  ParticipantDoc,
  QuestionnaireDoc,
  TeamDoc,
} from "../types";
import { fetchEvaluationSnapshot } from "./api";

export const ENABLE_FIREBASE = import.meta.env.VITE_ENABLE_FIREBASE !== "false";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "YOUR_FIREBASE_API_KEY_HERE",
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "YOUR_FIREBASE_PROJECT_ID.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "YOUR_FIREBASE_PROJECT_ID",
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    "YOUR_FIREBASE_PROJECT_ID.firebasestorage.app",
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "YOUR_FIREBASE_MESSAGING_SENDER_ID",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "YOUR_FIREBASE_APP_ID",
};

export function isFirebaseConfigured(): boolean {
  if (!ENABLE_FIREBASE) return false;
  const { apiKey, projectId } = firebaseConfig;
  return (
    Boolean(apiKey) &&
    Boolean(projectId) &&
    !apiKey.startsWith("YOUR_") &&
    !projectId.startsWith("YOUR_")
  );
}

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

export function getFirestoreClient(): Firestore | null {
  if (!isFirebaseConfigured()) {
    return null;
  }
  if (db) return db;
  try {
    app = getApps().length > 0 ? getApps()[0]! : initializeApp(firebaseConfig);
    db = getFirestore(app);
    return db;
  } catch (err) {
    console.warn("Firebase Client initialization failed:", err);
    return null;
  }
}

/**
 * Subscribes in real time (`onSnapshot`) to the 5 Firestore collections defined in
 * `/plans/firestore-database-schema-indexing-plan.md`:
 * - `evaluations/{evaluationId}`
 * - `questionnaires` (where `evaluationId == evaluationId`)
 * - `participants` (where `evaluationId == evaluationId`)
 * - `teams` (where `evaluationId == evaluationId`)
 * - `agent_thoughts` (where `evaluationId == evaluationId`)
 */
export function subscribeToEvaluationSnapshot(
  evaluationId: string,
  onUpdate: (snapshot: Partial<FullEvaluationSnapshot>) => void
): Unsubscribe {
  const firestore = getFirestoreClient();
  const unsubs: Unsubscribe[] = [];

  if (firestore) {
    try {
      // 1. Master Evaluation document
      unsubs.push(
        onSnapshot(
          doc(firestore, "evaluations", evaluationId),
          (snap) => {
            if (snap.exists()) {
              onUpdate({ evaluation: snap.data() as EvaluationDoc });
            }
          },
          (err) => console.warn("Firestore evaluations onSnapshot error:", err)
        )
      );

      // 2. Questionnaires collection
      unsubs.push(
        onSnapshot(
          query(
            collection(firestore, "questionnaires"),
            where("evaluationId", "==", evaluationId)
          ),
          (snap) => {
            const questionnaires = snap.docs
              .map((d) => d.data() as QuestionnaireDoc)
              .sort((a, b) => a.id.localeCompare(b.id));
            onUpdate({ questionnaires });
          },
          (err) => console.warn("Firestore questionnaires onSnapshot error:", err)
        )
      );

      // 3. Participants collection
      unsubs.push(
        onSnapshot(
          query(
            collection(firestore, "participants"),
            where("evaluationId", "==", evaluationId)
          ),
          (snap) => {
            const participants = snap.docs
              .map((d) => d.data() as ParticipantDoc)
              .sort((a, b) => a.id.localeCompare(b.id));
            onUpdate({ participants });
          },
          (err) => console.warn("Firestore participants onSnapshot error:", err)
        )
      );

      // 4. Teams collection
      unsubs.push(
        onSnapshot(
          query(
            collection(firestore, "teams"),
            where("evaluationId", "==", evaluationId)
          ),
          (snap) => {
            const teams = snap.docs
              .map((d) => d.data() as TeamDoc)
              .sort((a, b) => a.name.localeCompare(b.name));
            onUpdate({ teams });
          },
          (err) => console.warn("Firestore teams onSnapshot error:", err)
        )
      );

      // 5. Agent Thoughts stream
      unsubs.push(
        onSnapshot(
          query(
            collection(firestore, "agent_thoughts"),
            where("evaluationId", "==", evaluationId)
          ),
          (snap) => {
            const agentThoughts = snap.docs
              .map((d) => d.data() as AgentThoughtDoc)
              .sort((a, b) => a.sequenceNumber - b.sequenceNumber);
            onUpdate({ agentThoughts });
          },
          (err) => console.warn("Firestore agent_thoughts onSnapshot error:", err)
        )
      );
    } catch (err) {
      console.warn("Firestore subscription setup warning:", err);
    }
  }

  // Initial snapshot fetch + fallback sync
  let isCancelled = false;
  const syncOnce = async () => {
    if (isCancelled) return;
    try {
      const full = await fetchEvaluationSnapshot(evaluationId);
      if (full && !isCancelled) {
        onUpdate(full);
      }
    } catch {
      // Ignore transient network errors
    }
  };

  void syncOnce();
  const intervalId = setInterval(syncOnce, firestore ? 2000 : 500);

  return () => {
    isCancelled = true;
    clearInterval(intervalId);
    for (const u of unsubs) u();
  };
}
