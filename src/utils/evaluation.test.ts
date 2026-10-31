import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateTotalScore,
  sortSubmissionsForRanking,
  sortSubmissionsAlphabetically,
  countDeliverables,
  disqualifyProject,
  approveProjectScore,
  updateProjectRubric,
} from "./evaluation";
import { ProjectSubmission, DeliverableItem } from "../types";

function createMockSubmission(id: string, title: string, score: number, status: any = "evaluated"): ProjectSubmission {
  const dummyDeliverable: DeliverableItem = {
    id: "d1",
    name: "Doc",
    label: "Doc",
    type: "file",
    value: "path/to/file.pdf",
    submittedAt: "2026-10-31",
  };

  return {
    id,
    contestId: "contest-1",
    teamId: `team-${id}`,
    team: {
      id: `team-${id}`,
      name: `Team ${id}`,
      faculty: "Faculty of CS",
      members: [],
    },
    title,
    summary: "A summary",
    totalScore: score,
    status,
    rank: 0,
    deliverables: {
      deck: dummyDeliverable,
      demo: dummyDeliverable,
      leanCanvas: dummyDeliverable,
      mvp: dummyDeliverable,
      validation: dummyDeliverable,
      ethics: dummyDeliverable,
      plan90: dummyDeliverable,
      prototypeZip: dummyDeliverable,
    },
    agentEvaluation: {
      agent1Auditor: {
        status: "completed",
        executionTimeMs: 1200,
        extractedFacts: ["Fact 1"],
        flags: [],
        fileIntegrityCheck: { totalRequired: 8, totalSubmitted: 8, passedFormatVerification: true },
        rawJsonOutput: {},
      },
      agent2Mentor: {
        status: "completed",
        rubricScores: { problem: 10, aiTools: 15 },
        strengths: ["Great idea"],
        recommendations: ["More tests"],
        diplomaticFeedbackLetter: "Well done.",
      },
      humanApproval: { approved: false },
    },
  };
}

test("calculateTotalScore sums numeric rubric values accurately", () => {
  const scores = { problem: 12, aiTools: 18, prototype: 20, leanCanvas: 12 };
  assert.equal(calculateTotalScore(scores), 62);
  assert.equal(calculateTotalScore({}), 0);
});

test("sortSubmissionsForRanking orders descending by score and pushes disqualified to bottom", () => {
  const sub1 = createMockSubmission("1", "Alpha", 85, "evaluated");
  const sub2 = createMockSubmission("2", "Beta", 95, "evaluated");
  const sub3 = createMockSubmission("3", "Gamma", 92, "disqualified");
  const sub4 = createMockSubmission("4", "Delta", 78, "evaluated");

  const ranked = sortSubmissionsForRanking([sub1, sub2, sub3, sub4]);
  assert.equal(ranked[0].id, "2"); // 95
  assert.equal(ranked[1].id, "1"); // 85
  assert.equal(ranked[2].id, "4"); // 78
  assert.equal(ranked[3].id, "3"); // disqualified sinks to bottom
});

test("sortSubmissionsAlphabetically sorts alphabetically by project title", () => {
  const subA = createMockSubmission("1", "Zeta Agent", 90);
  const subB = createMockSubmission("2", "Alpha Solver", 80);
  const subC = createMockSubmission("3", "Beta Copilot", 85);

  const sorted = sortSubmissionsAlphabetically([subA, subB, subC]);
  assert.equal(sorted[0].title, "Alpha Solver");
  assert.equal(sorted[1].title, "Beta Copilot");
  assert.equal(sorted[2].title, "Zeta Agent");
});

test("countDeliverables calculates complete and missing files accurately", () => {
  const dummy: DeliverableItem = {
    id: "1",
    name: "Doc",
    label: "Doc",
    type: "file",
    value: "doc.pdf",
    submittedAt: "2026-10-31",
  };
  const empty: DeliverableItem = {
    id: "2",
    name: "Missing",
    label: "Missing",
    type: "link",
    value: "",
    submittedAt: "2026-10-31",
  };

  const full = { a: dummy, b: dummy };
  assert.deepEqual(countDeliverables(full), { count: 2, total: 2, isComplete: true });

  const partial = { a: dummy, b: empty };
  assert.deepEqual(countDeliverables(partial), { count: 1, total: 2, isComplete: false });
});

test("disqualifyProject sets totalScore to 0, status to disqualified, and captures admin rationale", () => {
  const original = createMockSubmission("10", "Plagiarized Project", 94, "evaluated");
  const disqualified = disqualifyProject(original, "Dr. Elena Rostova", "Plagiarized MIT thesis code");

  assert.equal(disqualified.status, "disqualified");
  assert.equal(disqualified.totalScore, 0);
  assert.ok(disqualified.adminRemarks?.includes("Plagiarized MIT thesis code"));
  assert.equal(disqualified.agentEvaluation.humanApproval.manualStatusOverride, "disqualified");
  assert.equal(disqualified.agentEvaluation.humanApproval.adminRationale, "Plagiarized MIT thesis code");
});

test("approveProjectScore ratifies AI suggested score", () => {
  const sub = createMockSubmission("11", "Great Project", 88, "needs_review");
  const approved = approveProjectScore(sub, "Dr. Elena Rostova");

  assert.equal(approved.status, "evaluated");
  assert.equal(approved.agentEvaluation.humanApproval.approved, true);
  assert.equal(approved.agentEvaluation.humanApproval.approvedBy, "Dr. Elena Rostova");
});

test("updateProjectRubric updates rubric scores and recalculates totalScore", () => {
  const sub = createMockSubmission("12", "Evolving Project", 80);
  const updated = updateProjectRubric(sub, { problem: 15, aiTools: 20, prototype: 20 });

  assert.equal(updated.totalScore, 55);
  assert.equal(updated.agentEvaluation.agent2Mentor.rubricScores.problem, 15);
});
