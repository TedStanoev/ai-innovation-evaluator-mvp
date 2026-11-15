/**
 * Firestore Database Schema & TypeScript Interfaces
 * Defined per `/plans/firestore-database-schema-indexing-plan.md`
 */

export type Role4HId = "hacker" | "hipster" | "hustler" | "hound";
export type Role4HName = "Hacker" | "Hipster" | "Hustler" | "Hound";

export const ROLE_4H_NAMES: Record<Role4HId, Role4HName> = {
  hacker: "Hacker",
  hipster: "Hipster",
  hustler: "Hustler",
  hound: "Hound",
};

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
  schoolOrOrganization: string; // Used for institutional diversity checks
  gradeOrPosition: string; // Used for cohort/class diversity checks
  questionnaireId: string; // Foreign key reference to `questionnaires/{id}`
  isSelected: boolean; // True if within Top-K cutoff (e.g., Top 96)
  selectionRank: number | null; // 1-based descending rank by TPS
  role: ParticipantRoleProfile | null; // Initialized as `null`; populated by Agent 1
  createdAt: string; // ISO 8601 Timestamp
  updatedAt: string; // ISO 8601 Timestamp
}

export interface QuestionnaireDoc {
  id: string;
  evaluationId: string;
  participantId: string;
  submittedAt: string; // ISO 8601 Timestamp

  // Part 1: General Identification (Unscored)
  generalInfo: {
    fullName: string;
    schoolOrOrganization: string;
    gradeOrPosition: string;
  };

  // Part 2: Candidate Profile Metrics
  profileMetrics: {
    // Section A: Quantitative Inputs
    gpa: number; // Q1 (AI): Academic GPA (3.00 to 6.00)
    extracurricularCount: number; // Q2 (EI): Integer count of projects/competitions (0, 1, 2, 3, 4+)

    // Section B: Qualitative Situational Inputs (Raw 1-5 scale)
    motivationScoreRaw: 1 | 2 | 3 | 4 | 5; // Q3 (MI)
    initiativeScoreRaw: 1 | 2 | 3 | 4 | 5; // Q4 (INI)
    entrepreneurialScoreRaw: 1 | 2 | 3 | 4 | 5; // Q5 (ENI)
  };

  // Part 3: 4H Micro-Role Situational Choices (Hidden role tags mapped on submission)
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
  role: ParticipantRoleProfile; // Guaranteed non-null for assigned team members
}

export interface TeamDoc {
  id: string;
  evaluationId: string;
  name: string; // e.g., "Team 01"
  status: "unconfirmed" | "confirmed"; // Controlled by Human-in-the-Loop Admin

  // Quantitative Quality & Balance Metrics
  compatibilityPercentage: number; // Overall synergy & compatibility score (0-100)
  roleBalance: {
    isComplete4H: boolean; // True iff Hacker=1, Hipster=1, Hustler=1, Hound=1
    hackerCount: number;
    hipsterCount: number;
    hustlerCount: number;
    houndCount: number;
  };
  averageTPS: number; // Arithmetic mean of the 4 members' TPS
  diversityScore: number; // Institutional/class uniqueness score (0-100)
  teamBalanceIndex: number; // Composite TBI metric used for swap optimization

  // Agent Explanation & Roster
  formationExplanation: string; // Concise rationale explaining why these 4 profiles complement each other
  members: TeamMemberSnapshot[]; // Full participant objects (length = 4)

  // Human-in-the-Loop Audit Trail
  confirmedBy: string | null; // Admin UID or email
  confirmedAt: string | null; // ISO 8601 Timestamp
  createdAt: string; // ISO 8601 Timestamp
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

  // Execution Parameters
  config: {
    targetCohortSize: number; // e.g., 96
    teamSize: number; // e.g., 4
    maxTbiSpread: number; // e.g., 15.0 points
  };

  // Unified Entity References
  participantIds: string[];
  teamIds: string[];
  recentThoughtIds: string[]; // Rolling buffer of latest thought document IDs

  // Real-Time Aggregated Telemetry
  metrics: {
    totalParticipants: number;
    profiledParticipants: number;
    selectedParticipants: number;
    totalTeamsFormed: number;
    confirmedTeamsCount: number;
    averageCohortTPS: number;
    currentTbiSpread: number; // TBI_max - TBI_min
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
  message: string; // Human-readable log entry for the UI stream
  metadata?: {
    participantIds?: string[];
    teamIds?: string[];
    tbiDeltaBefore?: number;
    tbiDeltaAfter?: number;
  };
  sequenceNumber: number; // Monotonically increasing integer for deterministic ordering
  timestamp: string; // ISO 8601 Timestamp
}

/**
 * Payload accepted by POST /api/questionnaires
 */
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
