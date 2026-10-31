import React, { useState } from "react";
import {
  X,
  Cpu,
  Sparkles,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  Check,
  Lock,
  Copy,
  RotateCw,
  Edit3,
  ExternalLink,
  Terminal,
} from "lucide-react";
import { ProjectSubmission, Contest } from "../types";

interface AIInspectorSheetProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectSubmission | null;
  contest: Contest;
  onApproveScore: (projectId: string) => void;
  onOpenAdjustPoints: (project: ProjectSubmission) => void;
  onOpenDisqualifyModal: (project: ProjectSubmission) => void;
  onSimulateReAudit?: (projectId: string) => void;
  onCompleteEvaluation?: (projectId: string) => void;
}

export default function AIInspectorSheet({
  isOpen,
  onClose,
  project,
  contest,
  onApproveScore,
  onOpenAdjustPoints,
  onOpenDisqualifyModal,
  onSimulateReAudit,
  onCompleteEvaluation,
}: AIInspectorSheetProps) {
  const [activeTab, setActiveTab] = useState<"pipeline" | "json">("pipeline");
  const [copied, setCopied] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditStep, setAuditStep] = useState<string>("");

  if (!isOpen || !project) return null;

  const { agent1Auditor, agent2Mentor, humanApproval } = project.agentEvaluation;

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(agent1Auditor, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunLiveReAudit = () => {
    setIsAuditing(true);
    setAuditStep("Agent 1: Ingesting 8 deliverables and running OCR & integrity check...");
    setTimeout(() => {
      setAuditStep("Agent 1: Cross-referencing claims against code AST & video transcription...");
      setTimeout(() => {
        setAuditStep("Agent 2: Calibrating rubric weights against 100-point rubric...");
        setTimeout(() => {
          setIsAuditing(false);
          setAuditStep("");
          if (onSimulateReAudit) onSimulateReAudit(project.id);
        }, 800);
      }, 900);
    }, 900);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="AI Reasoning and Audit Inspector"
      className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 transition-opacity"
    >
      <div className="absolute inset-y-0 right-0 flex max-w-full pl-6 md:pl-10">
        <div className="w-screen max-w-2xl bg-white border-l border-slate-200 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0">
                <Cpu className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900 tracking-tight">
                    AI Thought Process & Reasoning Inspector
                  </h2>
                  <span className="text-[10px] font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-semibold">
                    Google ADK
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Target: <span className="font-semibold text-slate-800">{project.title}</span> ({project.team.name})
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Inspector"
              className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/60"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Sub-header Navigation Tabs & Actions */}
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-2.5 bg-white">
            <div className="flex gap-2 text-xs font-medium">
              <button
                type="button"
                onClick={() => setActiveTab("pipeline")}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  activeTab === "pipeline"
                    ? "bg-slate-900 text-white font-semibold"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                Agent Execution Pipeline
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("json")}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  activeTab === "json"
                    ? "bg-slate-900 text-white font-semibold"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                Raw Auditor JSON Output
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRunLiveReAudit}
                disabled={isAuditing || project.status === "disqualified"}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors disabled:opacity-50"
                title="Re-run live multi-agent audit simulation"
              >
                <RotateCw className={`h-3 w-3 ${isAuditing ? "animate-spin text-blue-600" : ""}`} />
                <span>{isAuditing ? "Auditing..." : "Re-run AI Audit"}</span>
              </button>
            </div>
          </div>

          {/* Live Progress Banner if Auditing */}
          {isAuditing && (
            <div className="bg-blue-600 text-white px-6 py-2 text-xs font-mono flex items-center gap-2">
              <RotateCw className="h-3.5 w-3.5 animate-spin" />
              <span>{auditStep}</span>
            </div>
          )}

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/40">
            {activeTab === "json" ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-600">
                    <Terminal className="h-4 w-4 text-slate-500" />
                    <span>agent1_auditor_findings.json</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyJson}
                    className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 font-medium px-2 py-1 bg-white border border-slate-200 rounded"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copied ? "Copied" : "Copy JSON"}</span>
                  </button>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-emerald-400 font-mono text-xs overflow-x-auto shadow-inner leading-relaxed">
                  <pre>{JSON.stringify(agent1Auditor, null, 2)}</pre>
                </div>
              </div>
            ) : project.status === "auditing" ? (
              <div className="space-y-5">
                {/* Live In-Progress Status Card */}
                <div className="rounded-xl border border-blue-300 bg-blue-50/70 p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-blue-100 border border-blue-300 flex items-center justify-center text-blue-600 shrink-0">
                        <RotateCw className="h-5 w-5 animate-spin" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-blue-950">
                            AI Evaluation Pipeline In Progress...
                          </h3>
                          <span className="inline-block h-2 w-2 rounded-full bg-blue-600 animate-ping" />
                        </div>
                        <p className="text-xs text-blue-700">
                          Autonomous multi-agent analysis executing on 8 deliverable assets
                        </p>
                      </div>
                    </div>

                    {onCompleteEvaluation && (
                      <button
                        type="button"
                        onClick={() => onCompleteEvaluation(project.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-sm"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>Complete Evaluation</span>
                      </button>
                    )}
                  </div>

                  {/* Multi-Agent Stages Tracker */}
                  <div className="space-y-2.5 pt-1">
                    {/* Step 1 */}
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-white border border-blue-200">
                      <div className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0">
                        ✓
                      </div>
                      <div className="flex-1 text-xs">
                        <p className="font-bold text-slate-900">Agent 1: Ingestion & Integrity Check</p>
                        <p className="text-slate-600">
                          Verified 8 of 8 mandatory academic files. Formats compliant (PDF, Repo, Video).
                        </p>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
                        COMPLETED
                      </span>
                    </div>

                    {/* Step 2 */}
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-white border border-blue-300 shadow-2xs">
                      <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
                        <RotateCw className="h-3.5 w-3.5 animate-spin" />
                      </div>
                      <div className="flex-1 text-xs">
                        <p className="font-bold text-blue-950">Agent 1: Technical Claim Cross-Referencing</p>
                        <p className="text-blue-800">
                          AST parsing repository commits & cross-examining interview transcripts against Lean Canvas projections.
                        </p>
                      </div>
                      <span className="text-[10px] font-mono text-blue-700 bg-blue-100 px-2 py-0.5 rounded border border-blue-200 font-semibold animate-pulse">
                        RUNNING
                      </span>
                    </div>

                    {/* Step 3 */}
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200 opacity-75">
                      <div className="h-6 w-6 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-xs font-bold shrink-0">
                        3
                      </div>
                      <div className="flex-1 text-xs">
                        <p className="font-bold text-slate-700">Agent 2: Rubric Calibration & Feedback Letter</p>
                        <p className="text-slate-500">
                          Will calculate weighted scores (100 Max Points) across 8 official evaluation criteria once Agent 1 outputs JSON.
                        </p>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-semibold">
                        QUEUED
                      </span>
                    </div>
                  </div>
                </div>

                {/* Live Agent Terminal Log Stream */}
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs font-mono shadow-inner space-y-2">
                  <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
                    <span className="flex items-center gap-1.5">
                      <Terminal className="h-3.5 w-3.5 text-blue-400" />
                      <span>telemetry.agent.adk.log</span>
                    </span>
                    <span className="text-[10px] text-blue-400 animate-pulse font-semibold">STREAMING LIVE</span>
                  </div>
                  <div className="text-slate-300 space-y-1.5 text-[11px] leading-relaxed">
                    <p className="text-slate-500">[00:00.12] [Agent1Auditor] Ingested 8 deliverables for target '{project.title}'</p>
                    <p className="text-slate-400">[00:00.34] [Agent1Auditor] File integrity verified: 8 of 8 delivered.</p>
                    <p className="text-sky-300">[00:00.68] [Agent1Auditor] Parsing AST trees from {project.team.name} repository...</p>
                    <p className="text-emerald-400">[00:01.05] [Agent1Auditor] 5 verified customer interviews discovered in transcript.</p>
                    <p className="text-amber-300">[00:01.40] [Agent1Auditor] Cross-referencing technical claims against unit economics...</p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Phase 1: Agent 1 (Submission Auditor) */}
                <div className="rounded-xl border border-sky-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-sky-100 text-sky-800 font-bold text-xs border border-sky-300">
                        1
                      </span>
                      <div>
                        <h3 className="text-xs font-bold text-sky-900 uppercase tracking-wide">
                          Agent 1: Submission Auditor (Analysis Role)
                        </h3>
                        <p className="text-[11px] text-slate-500">
                          Document ingestion, metric extraction, and factual cross-referencing
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono bg-sky-50 text-sky-700 border border-sky-200 px-2.5 py-0.5 rounded font-medium">
                      {agent1Auditor.executionTimeMs} ms
                    </span>
                  </div>

                  {/* Reasoning Trace Steps */}
                  <div className="space-y-2 mb-3">
                    <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                      Auditor Reasoning Trace:
                    </p>
                    <div className="rounded-lg bg-slate-900 p-3.5 text-xs font-mono text-slate-200 space-y-2 border border-slate-800">
                      <div className="flex items-start gap-2">
                        <span className="text-sky-400 select-none">▶ [Step 1]</span>
                        <span className="text-slate-300">
                          Parsing 8 deliverable assets: verified {agent1Auditor.fileIntegrityCheck.totalSubmitted} of {agent1Auditor.fileIntegrityCheck.totalRequired} mandatory submissions.
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-sky-400 select-none">▶ [Step 2]</span>
                        <span className="text-slate-300">
                          Cross-referencing technical claims in Deck against prototype repository commits and demo video transcript.
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-sky-400 select-none">▶ [Step 3]</span>
                        <span className="text-slate-300">
                          Generated structured findings JSON with confidence index.
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Extracted Facts */}
                  <div className="mb-3">
                    <p className="text-[11px] font-semibold text-slate-700 mb-1.5">
                      Extracted Evidence & Factual Claims:
                    </p>
                    <ul className="space-y-1.5">
                      {agent1Auditor.extractedFacts.map((fact, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-xs text-slate-700 bg-slate-50 p-2 rounded border border-slate-200/80"
                        >
                          <span className="text-sky-600 font-bold select-none">✓</span>
                          <span>{fact}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Auditor Flags / Anomalies */}
                  {agent1Auditor.flags.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-[11px] font-semibold text-rose-800">
                        Auditor Integrity Alerts & Anomalies:
                      </p>
                      {agent1Auditor.flags.map((flag, idx) => (
                        <div
                          key={idx}
                          className={`flex items-start gap-2.5 p-3 rounded-lg border text-xs ${
                            flag.severity === "high"
                              ? "border-rose-300 bg-rose-50 text-rose-900"
                              : "border-amber-300 bg-amber-50 text-amber-900"
                          }`}
                        >
                          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
                          <div>
                            <span className="font-bold uppercase tracking-wider text-[10px] mr-1.5 px-1.5 py-0.2 rounded bg-white/80 border">
                              {flag.severity} severity
                            </span>
                            <span className="font-bold">{flag.category}:</span> {flag.description}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg p-2.5">
                      <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>Zero integrity anomalies or discrepancies detected. All claims verified.</span>
                    </div>
                  )}
                </div>

                {/* Phase 2: Agent 2 (Lead Judge & Mentor) */}
                <div className="rounded-xl border border-indigo-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-indigo-100 text-indigo-800 font-bold text-xs border border-indigo-300">
                        2
                      </span>
                      <div>
                        <h3 className="text-xs font-bold text-indigo-900 uppercase tracking-wide">
                          Agent 2: Lead Judge & Mentor (Evaluation & Feedback Role)
                        </h3>
                        <p className="text-[11px] text-slate-500">
                          Weighted rubric synthesis (100 pts) and diplomatic actionable guidance
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full">
                      AI Score: {project.totalScore}/100
                    </span>
                  </div>

                  {/* Rubric Score Breakdown Grid */}
                  <div className="mb-4">
                    <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-2">
                      Official Criteria Score Breakdown:
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {Object.entries(agent2Mentor.rubricScores).map(([k, score]) => (
                        <div key={k} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-center">
                          <span className="block text-[10px] text-slate-500 uppercase font-medium truncate">
                            {k}
                          </span>
                          <span className="text-sm font-bold font-mono text-slate-900">{score} pts</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Strengths & Strategic Recommendations */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 text-xs">
                    <div className="p-3 rounded-lg border border-emerald-100 bg-emerald-50/50">
                      <span className="font-semibold text-emerald-900 flex items-center gap-1.5 mb-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-emerald-600" /> Core Strengths:
                      </span>
                      <ul className="list-disc pl-4 text-emerald-950 space-y-1">
                        {agent2Mentor.strengths.map((str, i) => (
                          <li key={i}>{str}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3 rounded-lg border border-amber-100 bg-amber-50/50">
                      <span className="font-semibold text-amber-900 flex items-center gap-1.5 mb-1.5">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-600" /> Strategic Recommendations:
                      </span>
                      <ul className="list-disc pl-4 text-amber-950 space-y-1">
                        {agent2Mentor.recommendations.map((rec, i) => (
                          <li key={i}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Diplomatic Feedback Letter */}
                  <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/80 text-xs text-slate-700 italic leading-relaxed">
                    <p className="font-semibold not-italic text-slate-900 text-[11px] uppercase tracking-wider mb-1">
                      Official Lead Judge Feedback Letter:
                    </p>
                    &ldquo;{agent2Mentor.diplomaticFeedbackLetter}&rdquo;
                  </div>
                </div>

                {/* Phase 3: Human-in-the-Loop & Sanction Gate */}
                <div className="rounded-xl border border-slate-300 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-2.5 mb-3">
                    <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-slate-200 text-slate-800 font-bold text-xs">
                      3
                    </span>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                        Phase 3: Admin Review & Sanction Gate (Human-in-the-Loop)
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        AI agents NEVER disqualify autonomously. Only authorized Academic Admins may ratify, adjust, or sanction.
                      </p>
                    </div>
                  </div>

                  {project.status === "disqualified" ? (
                    <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-xs text-rose-900 space-y-2">
                      <p className="font-bold flex items-center gap-1.5 text-rose-700">
                        <Lock className="h-4 w-4" /> This project has been manually DISQUALIFIED by Academic Administrator
                      </p>
                      <p className="text-[11px] text-rose-800 leading-relaxed font-mono">
                        Rationale: {humanApproval.adminRationale || project.adminRemarks}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Signed: {humanApproval.approvedBy} • {humanApproval.timestamp}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-lg border border-slate-200 bg-slate-50 gap-3 text-xs">
                        <div>
                          <p className="font-semibold text-slate-900">Score Ratification Status</p>
                          <p className="text-[11px] text-slate-500">
                            Current Official Score:{" "}
                            <span className="font-bold font-mono text-slate-900 text-sm">
                              {project.totalScore}/100 pts
                            </span>
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onOpenAdjustPoints(project)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-2xs transition-colors"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                            <span>Adjust Points Manually</span>
                          </button>

                          {humanApproval.approved ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-100/70 px-3 py-1.5 rounded-lg border border-emerald-200">
                              <Check className="h-4 w-4" /> Approved by {humanApproval.approvedBy}
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onApproveScore(project.id)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-sm"
                            >
                              <Check className="h-4 w-4" />
                              <span>Approve & Publish Score</span>
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <span className="text-[11px] text-slate-500">
                          Academic fraud, plagiarism, or charter violation?
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onOpenDisqualifyModal(project);
                          }}
                          className="px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs transition-colors"
                        >
                          Manual Disqualification Override...
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-mono">
              AIIE Multi-Agent Core v2.4 • Google GenAI SDK
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
            >
              Close Inspector
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
