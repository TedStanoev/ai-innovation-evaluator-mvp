/**
 * Firestore Database Schema & TypeScript Interfaces (Client)
 * Defined per `/plans/firestore-database-schema-indexing-plan.md`
 */

export type Role4HId = "hacker" | "hipster" | "hustler" | "hound";
export type Role4HName = "Hacker" | "Hipster" | "Hustler" | "Hound";

export interface ParticipantRoleProfile {
  roleId: Role4HId;
  roleName: Role4HName;
  roleVoteBreakdown: {
    hacker: number; // Count of Hacker choices (0-4)
    hipster: number; // Count of Hipster choices (0-4)
    hustler: number; // Count of Hustler choices (0-4)
    hound: number; // Count of Hound choices (0-4)
  };
  indices: {
    AI: number; // Academic Index (0-100)
    EI: number; // Experience Index (0-100)
    INI: number; // Initiative Index (0-100)
    ENI: number; // Entrepreneurial Index (0-100)
    MI: number; // Motivation Index (0-100)
  };
  tps: number; // Total Potential Score: 0.20 * (AI + EI + INI + ENI + MI)
}

export interface ParticipantDoc {
  id: string;
  evaluationId: string;
  fullName: string;
  email: string;
  schoolOrOrganization: string;
  gradeOrPosition: string;
  questionnaireId: string;
  isSelected: boolean;
  selectionRank: number | null;
  role: ParticipantRoleProfile | null;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionnaireDoc {
  id: string;
  evaluationId: string;
  participantId: string;
  submittedAt: string;

  generalInfo: {
    fullName: string;
    schoolOrOrganization: string;
    gradeOrPosition: string;
  };

  profileMetrics: {
    gpa: number;
    extracurricularCount: number;
    motivationScoreRaw: 1 | 2 | 3 | 4 | 5;
    initiativeScoreRaw: 1 | 2 | 3 | 4 | 5;
    entrepreneurialScoreRaw: 1 | 2 | 3 | 4 | 5;
  };

  roleAssessmentAnswers: {
    q1_teamStrength: Role4HId;
    q2_deadlineFocus: Role4HId;
    q3_challengeType: Role4HId;
    q4_communicationStyle: Role4HId;
  };
}

export interface TeamMemberSnapshot {
  participantId: string;
  fullName: string;
  email: string;
  schoolOrOrganization: string;
  gradeOrPosition: string;
  questionnaireId: string;
  role: ParticipantRoleProfile;
}

export interface TeamDoc {
  id: string;
  evaluationId: string;
  name: string;
  status: "unconfirmed" | "confirmed";
  compatibilityPercentage: number;
  roleBalance: {
    isComplete4H: boolean;
    hackerCount: number;
    hipsterCount: number;
    hustlerCount: number;
    houndCount: number;
  };
  averageTPS: number;
  diversityScore: number;
  teamBalanceIndex: number;
  formationExplanation: string;
  members: TeamMemberSnapshot[];
  confirmedBy: string | null;
  confirmedAt: string | null;
  createdAt: string;
}

export type EvaluationPipelineStatus =
  | "idle"
  | "profiling_participants"
  | "forming_teams"
  | "awaiting_confirmation"
  | "completed"
  | "error";

export interface EvaluationDoc {
  id: string;
  title: string;
  status: EvaluationPipelineStatus;
  config: {
    targetCohortSize: number;
    teamSize: number;
    maxTbiSpread: number;
  };
  participantIds: string[];
  teamIds: string[];
  recentThoughtIds: string[];
  metrics: {
    totalParticipants: number;
    profiledParticipants: number;
    selectedParticipants: number;
    totalTeamsFormed: number;
    confirmedTeamsCount: number;
    averageCohortTPS: number;
    currentTbiSpread: number;
  };
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AgentThoughtDoc {
  id: string;
  evaluationId: string;
  agentName: "student_profiling_agent" | "team_formation_agent" | "system";
  phase:
    | "ingestion"
    | "indexing"
    | "selection_cutoff"
    | "role_classification"
    | "matrix_assembly"
    | "tbi_swap"
    | "completed";
  message: string;
  metadata?: {
    participantIds?: string[];
    teamIds?: string[];
    tbiDeltaBefore?: number;
    tbiDeltaAfter?: number;
  };
  sequenceNumber: number;
  timestamp: string;
}

export interface FullEvaluationSnapshot {
  evaluation: EvaluationDoc;
  questionnaires: QuestionnaireDoc[];
  participants: ParticipantDoc[];
  teams: TeamDoc[];
  agentThoughts: AgentThoughtDoc[];
}

export interface QuestionnaireSubmissionInput {
  id?: string;
  participantId?: string;
  evaluationId?: string;
  email?: string;
  submittedAt?: string;
  generalInfo: {
    fullName: string;
    schoolOrOrganization: string;
    gradeOrPosition: string;
  };
  profileMetrics: {
    gpa: number;
    extracurricularCount: number;
    motivationScoreRaw: 1 | 2 | 3 | 4 | 5;
    initiativeScoreRaw: 1 | 2 | 3 | 4 | 5;
    entrepreneurialScoreRaw: 1 | 2 | 3 | 4 | 5;
  };
  roleAssessmentAnswers: {
    q1_teamStrength: Role4HId;
    q2_deadlineFocus: Role4HId;
    q3_challengeType: Role4HId;
    q4_communicationStyle: Role4HId;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Judge" | "Organizer";
  avatar: string;
}
