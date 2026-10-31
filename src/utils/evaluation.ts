import { ProjectSubmission, DeliverableItem } from "../types";

/**
 * Calculates the total score from rubric criterion key-value pairs.
 */
export function calculateTotalScore(scores: Record<string, number>): number {
  return Object.values(scores).reduce((sum, score) => sum + (Number.isFinite(score) ? score : 0), 0);
}

/**
 * Sorts submissions for the official leaderboard:
 * - Descending order by totalScore
 * - Disqualified projects are pushed to the bottom (rank 0 / bottom order)
 */
export function sortSubmissionsForRanking(submissions: ProjectSubmission[]): ProjectSubmission[] {
  return [...submissions].sort((a, b) => {
    const aDisq = a.status === "disqualified";
    const bDisq = b.status === "disqualified";

    if (aDisq && !bDisq) return 1;
    if (!aDisq && bDisq) return -1;
    return b.totalScore - a.totalScore;
  });
}

/**
 * Sorts submissions alphabetically by project title.
 */
export function sortSubmissionsAlphabetically(submissions: ProjectSubmission[]): ProjectSubmission[] {
  return [...submissions].sort((a, b) => a.title.localeCompare(b.title));
}

/**
 * Counts submitted deliverables out of required items.
 */
export function countDeliverables(deliverables: Record<string, DeliverableItem>): {
  count: number;
  total: number;
  isComplete: boolean;
} {
  const keys = Object.keys(deliverables);
  const total = keys.length;
  const count = keys.filter((k) => {
    const item = deliverables[k];
    return item && item.value && item.value.trim().length > 0;
  }).length;

  return {
    count,
    total,
    isComplete: count === total && total > 0,
  };
}

/**
 * Administrative action: Disqualifies a project.
 * AI agents NEVER disqualify autonomously; this is an Admin manual override.
 * Sets totalScore to 0, status to 'disqualified', and attaches admin rationale.
 */
export function disqualifyProject(
  project: ProjectSubmission,
  adminName: string,
  reason: string,
  timestamp: string = new Date().toISOString()
): ProjectSubmission {
  return {
    ...project,
    status: "disqualified",
    totalScore: 0,
    adminRemarks: `DISQUALIFIED BY ADMIN (${adminName}): ${reason}`,
    agentEvaluation: {
      ...project.agentEvaluation,
      humanApproval: {
        approved: false,
        manualStatusOverride: "disqualified",
        approvedBy: adminName,
        timestamp,
        adminRationale: reason,
      },
    },
  };
}

/**
 * Administrative action: Approves AI suggested score and ratifies it.
 */
export function approveProjectScore(
  project: ProjectSubmission,
  adminName: string,
  timestamp: string = new Date().toISOString()
): ProjectSubmission {
  return {
    ...project,
    status: "evaluated",
    agentEvaluation: {
      ...project.agentEvaluation,
      humanApproval: {
        ...project.agentEvaluation.humanApproval,
        approved: true,
        approvedBy: adminName,
        timestamp,
      },
    },
  };
}

/**
 * Updates rubric scores manually by an evaluator/admin.
 */
export function updateProjectRubric(
  project: ProjectSubmission,
  newScores: Record<string, number>
): ProjectSubmission {
  const totalScore = calculateTotalScore(newScores);
  return {
    ...project,
    totalScore,
    agentEvaluation: {
      ...project.agentEvaluation,
      agent2Mentor: {
        ...project.agentEvaluation.agent2Mentor,
        rubricScores: { ...newScores },
      },
    },
  };
}
