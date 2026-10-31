export type DeliverableType = "file" | "link";

export interface DeliverableItem {
  id: string;
  name: string;
  label: string;
  type: DeliverableType;
  value: string;
  filename?: string;
  fileSize?: string;
  submittedAt: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  facultyNumber: string;
  major?: string;
  studyYear?: number;
}

export interface Team {
  id: string;
  name: string;
  faculty: string;
  members: TeamMember[];
}

export interface EvaluationCriterion {
  id: string;
  key: string;
  name: string;
  maxPoints: number;
  description: string;
  iconName: string;
}

export type ProjectStatus = "pending" | "auditing" | "evaluated" | "needs_review" | "disqualified";

export interface Agent1AuditReport {
  status: "pending" | "in_progress" | "completed";
  executionTimeMs: number;
  extractedFacts: string[];
  flags: {
    severity: "low" | "medium" | "high";
    category: string;
    description: string;
  }[];
  fileIntegrityCheck: {
    totalRequired: number;
    totalSubmitted: number;
    passedFormatVerification: boolean;
  };
  rawJsonOutput: Record<string, unknown>;
}

export interface Agent2MentorReport {
  status: "pending" | "in_progress" | "completed";
  rubricScores: Record<string, number>; // criterion key -> score
  strengths: string[];
  recommendations: string[];
  diplomaticFeedbackLetter: string;
}

export interface HumanApprovalState {
  approved: boolean;
  approvedBy?: string;
  timestamp?: string;
  manualStatusOverride?: "disqualified" | "approved";
  adminRationale?: string;
}

export interface ProjectSubmission {
  id: string;
  contestId: string;
  teamId: string;
  team: Team;
  title: string;
  summary: string;
  totalScore: number;
  status: ProjectStatus;
  rank: number;
  adminRemarks?: string;
  deliverables: {
    deck: DeliverableItem;
    demo: DeliverableItem;
    leanCanvas: DeliverableItem;
    mvp: DeliverableItem;
    validation: DeliverableItem;
    ethics: DeliverableItem;
    plan90: DeliverableItem;
    prototypeZip: DeliverableItem;
  };
  agentEvaluation: {
    agent1Auditor: Agent1AuditReport;
    agent2Mentor: Agent2MentorReport;
    humanApproval: HumanApprovalState;
  };
}

export interface Contest {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  faculty: string;
  academicYear: string;
  status: "Active" | "Archived" | "Draft";
  maxParticipants?: number;
  dates: {
    submissionDeadline: string;
    evaluationEnd: string;
    finaleDate: string;
  };
  defenseLocation?: string;
  evaluationCriteria: EvaluationCriterion[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Judge" | "Organizer";
  avatar: string;
}
