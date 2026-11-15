import {
  EvaluationDoc,
  FullEvaluationSnapshot,
  ParticipantDoc,
  QuestionnaireDoc,
  QuestionnaireSubmissionInput,
  TeamDoc,
} from "../types";
import { clientEnv } from "./env";

export const API_BASE_URL = clientEnv.VITE_API_BASE_URL;

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
    driver?: "admin" | "web-sdk" | "memory";
    projectId?: string;
  };
  geminiConfigured?: boolean;
  agents: BackendAgentInfo[];
}

export interface StartEvaluationResponse {
  ok: boolean;
  evaluationId: string;
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
 * POST /api/questionnaires
 * Submits a single questionnaire form or a batch `{ evaluationId, questionnaires }` to Firestore
 */
export async function submitQuestionnaireForm(
  submission: QuestionnaireSubmissionInput
): Promise<{
  ok: boolean;
  questionnaire: QuestionnaireDoc;
  participant: ParticipantDoc;
  evaluation: EvaluationDoc;
}> {
  const response = await fetch(`${API_BASE_URL}/api/questionnaires`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(submission),
  });
  if (!response.ok) {
    throw new Error(`Failed to submit questionnaire (${response.status})`);
  }
  return response.json();
}

export async function submitQuestionnaireBatch(
  evaluationId: string,
  questionnaires: QuestionnaireSubmissionInput[]
): Promise<{
  ok: boolean;
  count: number;
  evaluationId: string;
  questionnaires: QuestionnaireDoc[];
  participants: ParticipantDoc[];
  evaluation: EvaluationDoc;
}> {
  const response = await fetch(`${API_BASE_URL}/api/questionnaires`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      evaluationId,
      questionnaires,
    }),
  });
  if (!response.ok) {
    throw new Error(`Failed to submit questionnaire batch (${response.status})`);
  }
  return response.json();
}

/**
 * POST /api/evaluations/start (HTTP 202 Accepted)
 */
export async function startCohortEvaluation(
  evaluationId: string,
  questionnaires?: QuestionnaireSubmissionInput[]
): Promise<StartEvaluationResponse> {
  const response = await fetch(`${API_BASE_URL}/api/evaluations/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      evaluationId,
      questionnaires,
    }),
  });
  if (!response.ok && response.status !== 202) {
    throw new Error(`Failed to start evaluation (${response.status})`);
  }
  return response.json();
}

export async function fetchEvaluationSnapshot(
  evaluationId: string
): Promise<FullEvaluationSnapshot | null> {
  const response = await fetch(
    `${API_BASE_URL}/api/evaluations/${encodeURIComponent(evaluationId)}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }
  );
  if (!response.ok) return null;
  return response.json();
}

export async function confirmTeamInEvaluation(
  teamId: string,
  evaluationId: string,
  confirmedBy: string = "usr-admin-01"
): Promise<{
  ok: boolean;
  team: TeamDoc;
  evaluation: EvaluationDoc;
}> {
  const response = await fetch(
    `${API_BASE_URL}/api/teams/${encodeURIComponent(teamId)}/confirm`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ evaluationId, confirmedBy }),
    }
  );
  if (!response.ok) {
    throw new Error(`Failed to confirm team (${response.status})`);
  }
  return response.json();
}

export async function swapTeamMembersInEvaluation(params: {
  evaluationId: string;
  sourceTeamId: string;
  sourceParticipantId: string;
  targetParticipantId: string;
}): Promise<{
  ok: boolean;
  teams: TeamDoc[];
  evaluation: EvaluationDoc;
}> {
  const response = await fetch(`${API_BASE_URL}/api/teams/swap`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!response.ok) {
    throw new Error(`Failed to swap team members (${response.status})`);
  }
  return response.json();
}
