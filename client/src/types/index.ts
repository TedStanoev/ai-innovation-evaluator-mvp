export interface ThoughtLogEntry {
  agent: string;
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

export interface CohortEvaluationState {
  id: string;
  status: "pending" | "analyzing" | "auditing" | "needs_review" | "evaluated";
  totalScore?: number;
  students?: StudentQuestionnaire[];
  evaluatedStudents?: EvaluatedStudentProfile[];
  teams?: FormedTeam[];
  thoughtLogs?: ThoughtLogEntry[];
  agent1RawOutput?: string;
  agent2RawOutput?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Judge" | "Organizer";
  avatar: string;
}
