import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore, doc, onSnapshot, Firestore, Unsubscribe } from "firebase/firestore";
import { CohortEvaluationState } from "../types";

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
 * Subscribes to a student cohort evaluation document using both Firestore `onSnapshot`
 * (when configured) and fast backend state synchronization so thoughts stream in real time.
 */
export function subscribeToCohortEvaluation(
  cohortId: string,
  onUpdate: (data: CohortEvaluationState) => void
): Unsubscribe {
  const firestore = getFirestoreClient();
  let unsubscribeFirestore: Unsubscribe | null = null;

  if (firestore) {
    try {
      const docRef = doc(firestore, "submissions", cohortId);
      unsubscribeFirestore = onSnapshot(
        docRef,
        (snapshot) => {
          if (snapshot.exists()) {
            onUpdate(snapshot.data() as CohortEvaluationState);
          }
        },
        (error) => {
          console.warn(`Firestore onSnapshot warning for ${cohortId}:`, error);
        }
      );
    } catch {
      // Continue with backend sync
    }
  }

  return () => {
    if (unsubscribeFirestore) unsubscribeFirestore();
  };
}
