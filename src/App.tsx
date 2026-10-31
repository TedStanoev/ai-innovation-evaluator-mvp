/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import SummaryView from "./components/SummaryView";
import RankingView from "./components/RankingView";
import ProjectsView from "./components/ProjectsView";
import SubmitView from "./components/SubmitView";
import LoginView from "./components/LoginView";
import AIInspectorSheet from "./components/AIInspectorSheet";
import DisqualifyDialog from "./components/DisqualifyDialog";
import AdjustPointsDialog from "./components/AdjustPointsDialog";
import ProjectDetailsView from "./components/ProjectDetailsView";
import { mockContests, mockSubmissions, currentUser } from "./data/mockData";
import { ProjectSubmission } from "./types";
import {
  disqualifyProject,
  approveProjectScore,
  updateProjectRubric,
} from "./utils/evaluation";
import { Cpu, Plus } from "lucide-react";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [selectedContestId, setSelectedContestId] = useState("contest-bw-2026");
  const [currentView, setCurrentView] = useState<"contest-details" | "submit" | "login" | "project-details">("contest-details");
  const [activeTab, setActiveTab] = useState<"summary" | "ranking" | "projects">("summary");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [submissions, setSubmissions] = useState<ProjectSubmission[]>(mockSubmissions);
  const [selectedProjectForInspector, setSelectedProjectForInspector] = useState<ProjectSubmission | null>(null);
  const [selectedProjectForDetails, setSelectedProjectForDetails] = useState<ProjectSubmission | null>(null);
  const [lastInspectedProject, setLastInspectedProject] = useState<ProjectSubmission | null>(null);
  const [projectToDisqualify, setProjectToDisqualify] = useState<ProjectSubmission | null>(null);
  const [projectToAdjust, setProjectToAdjust] = useState<ProjectSubmission | null>(null);

  const activeContest =
    mockContests.find((c) => c.id === selectedContestId) || mockContests[0];

  const contestSubmissions = submissions.filter(
    (s) => s.contestId === activeContest.id
  );

  // Navigation router helper
  const handleNavigate = (viewId: string, contestId?: string) => {
    if (contestId) {
      setSelectedContestId(contestId);
    }
    if (viewId === "desk") {
      setCurrentView("contest-details");
      setActiveTab("summary");
    } else if (viewId === "ranking") {
      setCurrentView("contest-details");
      setActiveTab("ranking");
    } else if (viewId === "projects") {
      setCurrentView("contest-details");
      setActiveTab("projects");
    } else if (viewId === "submit") {
      setCurrentView("submit");
    } else if (viewId === "contest-details") {
      setCurrentView("contest-details");
    }
  };

  // Open Project Details Page
  const handleViewProject = (project: ProjectSubmission) => {
    setSelectedProjectForDetails(project);
    setLastInspectedProject(project);
    setCurrentView("project-details");
  };

  // Open Live AI Inspector: either in-progress evaluation pipeline or last inspector output
  const handleOpenLiveInspector = () => {
    // 1. Look for any active in-progress audit
    const inProgress =
      contestSubmissions.find((s) => s.status === "auditing" || s.agentEvaluation.agent1Auditor.status === "in_progress") ||
      submissions.find((s) => s.status === "auditing" || s.agentEvaluation.agent1Auditor.status === "in_progress");

    if (inProgress) {
      setSelectedProjectForInspector(inProgress);
      setLastInspectedProject(inProgress);
      return;
    }

    // 2. Otherwise display the last AI inspector output
    if (lastInspectedProject) {
      const fresh = submissions.find((s) => s.id === lastInspectedProject.id) || lastInspectedProject;
      setSelectedProjectForInspector(fresh);
      return;
    }

    // 3. Fallback to first submission
    const fallback = contestSubmissions[0] || submissions[0];
    if (fallback) {
      setSelectedProjectForInspector(fallback);
      setLastInspectedProject(fallback);
    }
  };

  // Simulate completion of an in-progress evaluation
  const handleCompleteEvaluation = (projectId: string) => {
    setSubmissions((prev) =>
      prev.map((sub) => {
        if (sub.id === projectId) {
          const completed: ProjectSubmission = {
            ...sub,
            status: "evaluated",
            totalScore: 92,
            rank: 2,
            agentEvaluation: {
              agent1Auditor: {
                status: "completed",
                executionTimeMs: 1450,
                extractedFacts: [
                  "All 8 mandatory deliverables verified in compliant formats.",
                  "Live API routing heuristic tested against synthetic dispatch instances.",
                  "Primary field notes verify 5 suburban courier interviews in Sofia/Plovdiv.",
                  "Fleet CO2 reduction claims verified against transport benchmark models.",
                ],
                flags: [],
                fileIntegrityCheck: { totalRequired: 8, totalSubmitted: 8, passedFormatVerification: true },
                rawJsonOutput: {
                  confidenceScore: 0.95,
                  verifiableClaimsCount: 13,
                  heuristicEfficiency: "+18.4%",
                },
              },
              agent2Mentor: {
                status: "completed",
                rubricScores: {
                  problem: 12,
                  aiTools: 17,
                  prototype: 18,
                  leanCanvas: 11,
                  validation: 13,
                  ethics: 8,
                  plan90: 7,
                  demo: 6,
                },
                strengths: [
                  "Exceptional algorithmic formulation of the vehicle routing problem with time windows.",
                  "Detailed empirical interviews with suburban courier dispatchers.",
                  "Clear environmental impact calculations.",
                ],
                recommendations: [
                  "Test the edge routing agent under simulated GPS signal loss scenarios.",
                  "Add driver rest period compliance heuristics into the dispatch solver.",
                ],
                diplomaticFeedbackLetter:
                  "OptiRoute AI demonstrates a stellar convergence of classical operations research with generative tool orchestration. The jury highlights the high quality of your field validation and mathematical rigor.",
              },
              humanApproval: {
                approved: true,
                approvedBy: currentUser.name,
                timestamp: new Date().toISOString().replace("T", " ").slice(0, 16) + " UTC",
              },
            },
          };
          if (selectedProjectForDetails?.id === projectId) {
            setSelectedProjectForDetails(completed);
          }
          if (selectedProjectForInspector?.id === projectId) {
            setSelectedProjectForInspector(completed);
          }
          setLastInspectedProject(completed);
          return completed;
        }
        return sub;
      })
    );
  };

  // Human-in-the-Loop: Approve Score
  const handleApproveScore = (projectId: string) => {
    setSubmissions((prev) =>
      prev.map((sub) => {
        if (sub.id === projectId) {
          const updated = approveProjectScore(sub, currentUser.name);
          if (selectedProjectForInspector?.id === projectId) {
            setSelectedProjectForInspector(updated);
          }
          if (selectedProjectForDetails?.id === projectId) {
            setSelectedProjectForDetails(updated);
          }
          return updated;
        }
        return sub;
      })
    );
  };

  // Human-in-the-Loop: Admin Manual Disqualification Override
  const handleConfirmDisqualification = (projectId: string, reason: string) => {
    setSubmissions((prev) =>
      prev.map((sub) => {
        if (sub.id === projectId) {
          const updated = disqualifyProject(sub, currentUser.name, reason);
          if (selectedProjectForInspector?.id === projectId) {
            setSelectedProjectForInspector(updated);
          }
          if (selectedProjectForDetails?.id === projectId) {
            setSelectedProjectForDetails(updated);
          }
          return updated;
        }
        return sub;
      })
    );
  };

  // Human-in-the-Loop: Manual Rubric Score Calibration
  const handleSaveAdjustedScores = (projectId: string, newScores: Record<string, number>) => {
    setSubmissions((prev) =>
      prev.map((sub) => {
        if (sub.id === projectId) {
          const updated = updateProjectRubric(sub, newScores);
          if (selectedProjectForInspector?.id === projectId) {
            setSelectedProjectForInspector(updated);
          }
          if (selectedProjectForDetails?.id === projectId) {
            setSelectedProjectForDetails(updated);
          }
          return updated;
        }
        return sub;
      })
    );
  };

  // Re-run simulated AI Audit
  const handleSimulateReAudit = (projectId: string) => {
    setSubmissions((prev) =>
      prev.map((sub) => {
        if (sub.id === projectId) {
          const updated: ProjectSubmission = {
            ...sub,
            agentEvaluation: {
              ...sub.agentEvaluation,
              agent1Auditor: {
                ...sub.agentEvaluation.agent1Auditor,
                executionTimeMs: Math.floor(1100 + Math.random() * 400),
                rawJsonOutput: {
                  ...sub.agentEvaluation.agent1Auditor.rawJsonOutput,
                  lastReAuditTimestamp: new Date().toISOString(),
                  refreshedVerification: true,
                },
              },
            },
          };
          if (selectedProjectForInspector?.id === projectId) {
            setSelectedProjectForInspector(updated);
          }
          if (selectedProjectForDetails?.id === projectId) {
            setSelectedProjectForDetails(updated);
          }
          return updated;
        }
        return sub;
      })
    );
  };

  // Submit new project handler
  const handleSubmitNewProject = (newProject: ProjectSubmission) => {
    setSubmissions((prev) => [newProject, ...prev]);
    setCurrentView("contest-details");
    setActiveTab("ranking");
    setSelectedProjectForInspector(newProject);
  };

  if (!isAuthenticated) {
    return (
      <LoginView
        onLoginSuccess={() => {
          setIsAuthenticated(true);
          setCurrentView("contest-details");
        }}
      />
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      {/* Collapsible Left Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        currentView={currentView === "submit" ? "submit" : currentView === "project-details" ? "projects" : activeTab}
        onNavigate={handleNavigate}
        contests={mockContests}
        selectedContestId={selectedContestId}
        onSelectContest={(id) => {
          setSelectedContestId(id);
          setCurrentView("contest-details");
        }}
        currentUser={currentUser}
        onOpenLiveInspector={handleOpenLiveInspector}
        onLogout={() => setIsAuthenticated(false)}
      />

      {/* Main Canvas Viewport */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {currentView === "submit" ? (
          <div className="p-6 md:p-8 max-w-5xl mx-auto w-full">
            <SubmitView
              contest={activeContest}
              onBack={() => setCurrentView("contest-details")}
              onSubmitNewProject={handleSubmitNewProject}
            />
          </div>
        ) : currentView === "project-details" && selectedProjectForDetails ? (
          <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
            <ProjectDetailsView
              project={
                submissions.find((s) => s.id === selectedProjectForDetails.id) ||
                selectedProjectForDetails
              }
              contest={
                mockContests.find((c) => c.id === selectedProjectForDetails.contestId) ||
                activeContest
              }
              onBack={() => {
                setCurrentView("contest-details");
                setActiveTab("projects");
              }}
              onOpenInspector={(proj) => {
                setSelectedProjectForInspector(proj);
                setLastInspectedProject(proj);
              }}
              onApproveScore={handleApproveScore}
              onOpenAdjustPoints={(proj) => setProjectToAdjust(proj)}
              onOpenDisqualifyModal={(proj) => setProjectToDisqualify(proj)}
              onCompleteEvaluation={handleCompleteEvaluation}
            />
          </div>
        ) : (
          <div className="min-h-full flex flex-col">
            {/* Sticky Header */}
            <header className="sticky top-0 z-20 border-b border-slate-200 bg-white px-6 md:px-8 pt-3.5 shadow-2xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight">
                      {activeContest.title}
                    </h1>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                        activeContest.status === "Active"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-slate-100 text-slate-600 border-slate-200"
                      }`}
                    >
                      {activeContest.status}
                    </span>
                  </div>
                </div>

                {/* Top Action Bar */}
                <div className="flex items-center gap-2.5 self-start md:self-auto">
                  <button
                    type="button"
                    onClick={handleOpenLiveInspector}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors"
                  >
                    <Cpu className="h-4 w-4 text-blue-600" />
                    <span>AI Inspector</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCurrentView("submit")}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>New Project Submission</span>
                  </button>
                </div>
              </div>

              {/* Segmented Tabs Navigation - Centered & Renamed */}
              <nav className="mt-4 flex justify-center space-x-8 border-b border-slate-200" aria-label="Contest Tabs">
                <button
                  type="button"
                  onClick={() => setActiveTab("summary")}
                  className={`pb-2.5 text-xs font-semibold transition-all relative ${
                    activeTab === "summary"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Contest Summary
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("ranking")}
                  className={`pb-2.5 text-xs font-semibold transition-all relative ${
                    activeTab === "ranking"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Team Ranking
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("projects")}
                  className={`pb-2.5 text-xs font-semibold transition-all relative ${
                    activeTab === "projects"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Submissions
                </button>
              </nav>
            </header>

            {/* Tab Body */}
            <div className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
              {activeTab === "summary" && (
                <SummaryView
                  contest={activeContest}
                  totalSubmissions={contestSubmissions.length}
                  evaluatedCount={
                    contestSubmissions.filter((s) => s.status === "evaluated").length
                  }
                  onNavigateToProjects={() => setActiveTab("projects")}
                  onNavigateToRanking={() => setActiveTab("ranking")}
                />
              )}

              {activeTab === "ranking" && (
                <RankingView
                  contest={activeContest}
                  submissions={contestSubmissions}
                  onInspectProject={(project) => {
                    setSelectedProjectForInspector(project);
                    setLastInspectedProject(project);
                  }}
                  onOpenDisqualifyModal={(project) => setProjectToDisqualify(project)}
                />
              )}

              {activeTab === "projects" && (
                <ProjectsView
                  contest={activeContest}
                  submissions={contestSubmissions}
                  onViewProject={handleViewProject}
                  onInspectProject={(project) => {
                    setSelectedProjectForInspector(project);
                    setLastInspectedProject(project);
                  }}
                  onOpenDisqualifyModal={(project) => setProjectToDisqualify(project)}
                />
              )}
            </div>
          </div>
        )}
      </main>

      {/* AI Inspector Slide-Over */}
      <AIInspectorSheet
        isOpen={!!selectedProjectForInspector}
        onClose={() => setSelectedProjectForInspector(null)}
        project={selectedProjectForInspector}
        contest={activeContest}
        onApproveScore={handleApproveScore}
        onOpenAdjustPoints={(proj) => setProjectToAdjust(proj)}
        onOpenDisqualifyModal={(proj) => setProjectToDisqualify(proj)}
        onSimulateReAudit={handleSimulateReAudit}
        onCompleteEvaluation={handleCompleteEvaluation}
      />

      {/* Disqualify Confirmation Modal */}
      <DisqualifyDialog
        isOpen={!!projectToDisqualify}
        project={projectToDisqualify}
        adminName={currentUser.name}
        onClose={() => setProjectToDisqualify(null)}
        onConfirm={handleConfirmDisqualification}
      />

      {/* Manual Point Adjustment Modal */}
      <AdjustPointsDialog
        isOpen={!!projectToAdjust}
        project={projectToAdjust}
        contest={activeContest}
        onClose={() => setProjectToAdjust(null)}
        onSaveScores={handleSaveAdjustedScores}
      />
    </div>
  );
}
