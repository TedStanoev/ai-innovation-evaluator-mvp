import { CohortEvaluationState, StudentQuestionnaire } from "../types";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

export interface BackendAgentInfo {
  id?: string;
  role?: string;
  name: string;
  model?: string;
  description?: string;
}

export interface HealthResponse {
  status: string;
  service: string;
  timestamp: string;
  database?: {
    enabled: boolean;
    mode: "firestore" | "memory";
  };
  geminiConfigured?: boolean;
  agents: BackendAgentInfo[];
}

export interface StartEvaluationResponse {
  ok: boolean;
  submissionId: string;
  status: string;
}

export async function fetchBackendHealth(): Promise<HealthResponse> {
  const response = await fetch(`${API_BASE_URL}/api/health`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) {
    throw new Error(`Health check failed with status ${response.status}`);
  }
  return response.json();
}

/**
 * Triggers asynchronous student questionnaire analysis & team formation
 * via POST /api/evaluations/start (HTTP 202 Accepted)
 */
export async function startStudentCohortEvaluation(
  cohortId: string,
  students: StudentQuestionnaire[]
): Promise<StartEvaluationResponse> {
  const response = await fetch(`${API_BASE_URL}/api/evaluations/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      submissionId: cohortId,
      students,
    }),
  });
  if (!response.ok && response.status !== 202) {
    throw new Error(`Failed to start student evaluation (${response.status})`);
  }
  return response.json();
}

export async function fetchCohortEvaluationById(
  cohortId: string
): Promise<CohortEvaluationState | null> {
  const response = await fetch(
    `${API_BASE_URL}/api/submissions/${encodeURIComponent(cohortId)}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }
  );
  if (!response.ok) return null;
  return response.json();
}
