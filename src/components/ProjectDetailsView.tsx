import React, { useState } from "react";
import {
  ArrowLeft,
  Cpu,
  RotateCw,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Lock,
  Edit3,
  Check,
  ExternalLink,
  FileText,
  Calendar,
  MapPin,
  School,
  Trophy,
  Users,
  Clock,
  Layers,
} from "lucide-react";
import { ProjectSubmission, Contest } from "../types";
import { openDeliverablePdfInNewTab } from "../utils/pdfGenerator";

interface ProjectDetailsViewProps {
  project: ProjectSubmission;
  contest: Contest;
  onBack: () => void;
  onOpenInspector: (project: ProjectSubmission) => void;
  onApproveScore?: (projectId: string) => void;
  onOpenAdjustPoints?: (project: ProjectSubmission) => void;
  onOpenDisqualifyModal?: (project: ProjectSubmission) => void;
  onCompleteEvaluation?: (projectId: string) => void;
}

export default function ProjectDetailsView({
  project,
  contest,
  onBack,
  onOpenInspector,
  onApproveScore,
  onOpenAdjustPoints,
  onOpenDisqualifyModal,
  onCompleteEvaluation,
}: ProjectDetailsViewProps) {
  const isAuditing = project.status === "auditing" || project.status === "pending";
  const isDisqualified = project.status === "disqualified";
  const { agent1Auditor, agent2Mentor, humanApproval } = project.agentEvaluation;

  const deliverableItems = Object.entries(project.deliverables || {}).map(
    ([key, item]) => ({ key, ...item })
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto w-full pb-16">
      {/* Top Breadcrumb & Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Submissions</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onOpenInspector(project)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors"
          >
            <Cpu className="h-3.5 w-3.5 text-blue-600" />
            <span>Open AI Inspector</span>
          </button>
        </div>
      </div>

      {/* Contest Context Badge Banner */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-semibold text-blue-700 uppercase tracking-wider mb-1">
              <Trophy className="h-3.5 w-3.5 text-blue-600" />
              <span>Contest</span>
            </div>
            <h2 className="text-sm md:text-base font-bold text-slate-900 tracking-tight">
              {contest.title}
            </h2>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 mt-1">
              <span className="flex items-center gap-1">
                <School className="h-3.5 w-3.5 text-slate-400" />
                {contest.faculty}
              </span>
              <span>•</span>
              <span>Year {contest.academicYear}</span>
              {contest.defenseLocation && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    {contest.defenseLocation}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
                contest.status === "Active"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-slate-100 text-slate-600 border-slate-200"
              }`}
            >
              {contest.status}
            </span>
          </div>
        </div>
      </div>

      {/* Main Project Header Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize border ${
                  project.status === "evaluated"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : project.status === "disqualified"
                    ? "bg-rose-50 text-rose-700 border-rose-200"
                    : project.status === "auditing"
                    ? "bg-blue-50 text-blue-700 border-blue-200"
                    : "bg-amber-50 text-amber-700 border-amber-200"
                }`}
              >
                {project.status === "auditing" ? "AI Evaluation in Progress" : project.status.replace("_", " ")}
              </span>

              {project.status === "evaluated" && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold font-mono bg-blue-50 text-blue-800 border border-blue-200">
                  <Trophy className="h-3.5 w-3.5 text-amber-500" />
                  Score: {project.totalScore}/100 pts
                </span>
              )}
            </div>

            <h1
              className={`text-xl md:text-2xl font-bold tracking-tight ${
                isDisqualified ? "line-through text-slate-400" : "text-slate-900"
              }`}
            >
              {project.title}
            </h1>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
              <span className="font-semibold text-slate-800">Team: {project.team.name}</span>
              <span>•</span>
              <span>{project.team.faculty}</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-500">
                <Users className="h-3.5 w-3.5" />
                {project.team.members.length} Members
              </span>
            </div>
          </div>
        </div>

        {/* Disqualification Banner */}
        {isDisqualified && (
          <div className="mt-5 rounded-lg border border-rose-300 bg-rose-50 p-4 text-xs text-rose-900 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-rose-800">
              <Lock className="h-4 w-4" />
              <span>Administrative Disqualification</span>
            </div>
            <p className="leading-relaxed font-mono text-[11px] text-rose-800">
              {project.adminRemarks || humanApproval.adminRationale}
            </p>
            {humanApproval.approvedBy && (
              <p className="text-[10px] text-slate-500">
                Actioned by {humanApproval.approvedBy} • {humanApproval.timestamp}
              </p>
            )}
          </div>
        )}

        {/* Project Summary */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Project Summary
          </h3>
          <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-200/80">
            {project.summary}
          </p>
        </div>
      </div>

      {/* Team Roster & Mandatory Deliverables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Members */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span>Members</span>
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">
              {project.team.members.length} members
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {project.team.members.map((member, idx) => (
              <div key={member.id || idx} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-slate-800">{member.name}</p>
                  <p className="text-[11px] text-slate-500">{member.email}</p>
                </div>
                <div className="text-right">
                  <span className="font-mono text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    ID: {member.facultyNumber}
                  </span>
                  {member.major && (
                    <p className="text-[10px] text-slate-400 mt-0.5">{member.major}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mandatory Deliverables */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Layers className="h-4 w-4 text-indigo-600" />
              <span>Deliverables</span>
            </h3>
            <span className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-mono font-medium">
              8/8 Received
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {deliverableItems.map((item) => {
              const isLink =
                item.type === "link" ||
                (typeof item.value === "string" && item.value.startsWith("http"));

              if (isLink) {
                return (
                  <a
                    key={item.key}
                    href={item.value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-slate-100 hover:border-slate-300 transition-colors flex items-center justify-between gap-2 text-left cursor-pointer"
                    title={`Open link: ${item.value}`}
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 text-[11px] truncate">
                        {item.label || item.name}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate font-mono">
                        {item.filename || item.value}
                      </p>
                    </div>
                    <span className="shrink-0 text-slate-400">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </span>
                  </a>
                );
              }

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => openDeliverablePdfInNewTab(item, project, contest.title)}
                  className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-slate-100 hover:border-slate-300 transition-colors flex items-center justify-between gap-2 text-left cursor-pointer w-full"
                  title={`Open PDF: ${item.filename || item.name}`}
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 text-[11px] truncate">
                      {item.label || item.name}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate font-mono">
                      {item.filename || item.value}
                    </p>
                  </div>
                  <span className="shrink-0 text-slate-400">
                    <FileText className="h-3.5 w-3.5" />
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* AI Inspector's Agent Execution Pipeline Section */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Cpu className="h-5 w-5 text-indigo-600" />
              <span>AI Inspector: Agent Execution Pipeline</span>
            </h2>
          </div>
        </div>

        {/* If in progress: Prompt "AI Evaluation in progress..." + "Open AI Inspector" button */}
        {isAuditing ? (
          <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-100 border border-blue-300 flex items-center justify-center text-blue-600 shrink-0">
                  <RotateCw className="h-5 w-5 animate-spin" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-blue-950 flex items-center gap-2">
                    <span>AI Evaluation in progress...</span>
                    <span className="inline-block h-2 w-2 rounded-full bg-blue-500 animate-ping" />
                  </h3>
                  <p className="text-xs text-blue-700 mt-0.5">
                    Agent 1 (Submission Auditor) is actively parsing AST deliverables and verifying claims. Agent 2 (Lead Judge) will synthesize the 100-point rubric upon completion.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => onOpenInspector(project)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-sm"
                >
                  <Cpu className="h-4 w-4" />
                  <span>Open AI Inspector</span>
                </button>

                {onCompleteEvaluation && (
                  <button
                    type="button"
                    onClick={() => onCompleteEvaluation(project.id)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg border border-blue-300 bg-white hover:bg-blue-50 text-blue-700 font-semibold text-xs transition-colors"
                    title="Simulate instant completion of AI evaluation"
                  >
                    <Check className="h-3.5 w-3.5 text-blue-600" />
                    <span>Complete Evaluation</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* If evaluated: Show the 3 resolved phases */
          <div className="space-y-4">
            {/* Phase 1: Agent 1 (Submission Auditor) */}
            <div className="rounded-xl border border-sky-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4 border-b border-sky-100 pb-3">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-sky-100 text-sky-800 font-bold text-xs border border-sky-300">
                    1
                  </span>
                  <div>
                    <h3 className="text-xs md:text-sm font-bold text-sky-950 uppercase tracking-wide">
                      Phase 1: Agent 1 - Submission Auditor (Analysis Role)
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Document ingestion, metric extraction, and factual cross-referencing
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono bg-sky-50 text-sky-700 border border-sky-200 px-3 py-1 rounded-full font-medium">
                  {agent1Auditor.executionTimeMs} ms
                </span>
              </div>

              {/* Reasoning Trace Steps */}
              <div className="space-y-2 mb-4">
                <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                  Auditor Reasoning Trace:
                </p>
                <div className="rounded-lg bg-slate-900 p-4 text-xs font-mono text-slate-200 space-y-2 border border-slate-800">
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
              <div className="mb-4">
                <p className="text-[11px] font-semibold text-slate-700 mb-2">
                  Extracted Evidence & Factual Claims:
                </p>
                <ul className="space-y-1.5">
                  {agent1Auditor.extractedFacts.map((fact, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80"
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
                <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Zero integrity anomalies or discrepancies detected. All claims verified.</span>
                </div>
              )}
            </div>

            {/* Phase 2: Agent 2 (Lead Judge & Mentor) */}
            <div className="rounded-xl border border-indigo-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4 border-b border-indigo-100 pb-3">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-indigo-100 text-indigo-800 font-bold text-xs border border-indigo-300">
                    2
                  </span>
                  <div>
                    <h3 className="text-xs md:text-sm font-bold text-indigo-950 uppercase tracking-wide">
                      Phase 2: Agent 2 - Lead Judge & Mentor (Evaluation & Feedback Role)
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
              <div className="mb-5">
                <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-2">
                  Official Criteria Score Breakdown:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {Object.entries(agent2Mentor.rubricScores).map(([k, score]) => (
                    <div key={k} className="p-3 rounded-lg border border-slate-200 bg-slate-50 text-center">
                      <span className="block text-[10px] text-slate-500 uppercase font-medium truncate">
                        {k}
                      </span>
                      <span className="text-sm font-bold font-mono text-slate-900">{score} pts</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strengths & Strategic Recommendations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5 text-xs">
                <div className="p-4 rounded-lg border border-emerald-100 bg-emerald-50/50">
                  <span className="font-semibold text-emerald-900 flex items-center gap-1.5 mb-2">
                    <Sparkles className="h-4 w-4 text-emerald-600" /> Core Strengths:
                  </span>
                  <ul className="list-disc pl-4 text-emerald-950 space-y-1">
                    {agent2Mentor.strengths.map((str, i) => (
                      <li key={i}>{str}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-lg border border-amber-100 bg-amber-50/50">
                  <span className="font-semibold text-amber-900 flex items-center gap-1.5 mb-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600" /> Strategic Recommendations:
                  </span>
                  <ul className="list-disc pl-4 text-amber-950 space-y-1">
                    {agent2Mentor.recommendations.map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Diplomatic Feedback Letter */}
              {agent2Mentor.diplomaticFeedbackLetter && (
                <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/80 text-xs text-slate-700 italic leading-relaxed">
                  <p className="font-semibold not-italic text-slate-900 text-[11px] uppercase tracking-wider mb-1">
                    Official Lead Judge Feedback Letter:
                  </p>
                  &ldquo;{agent2Mentor.diplomaticFeedbackLetter}&rdquo;
                </div>
              )}
            </div>

            {/* Phase 3: Human-in-the-Loop & Sanction Gate */}
            <div className="rounded-xl border border-slate-300 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4 border-b border-slate-100 pb-3">
                <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-slate-200 text-slate-800 font-bold text-xs">
                  3
                </span>
                <div>
                  <h3 className="text-xs md:text-sm font-bold text-slate-900 uppercase tracking-wide">
                    Phase 3: Final Review (Human-in-the-Loop)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    AI agents never disqualify autonomously. Only authorized Academic Administrators may ratify, adjust, or sanction.
                  </p>
                </div>
              </div>

              {isDisqualified ? (
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
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border border-slate-200 bg-slate-50 gap-3 text-xs">
                    <div>
                      <p className="font-semibold text-slate-900">Score Ratification Status</p>
                      <p className="text-[11px] text-slate-500">
                        Official Published Score:{" "}
                        <span className="font-bold font-mono text-slate-900 text-sm">
                          {project.totalScore}/100 pts
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {onOpenAdjustPoints && (
                        <button
                          type="button"
                          onClick={() => onOpenAdjustPoints(project)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-2xs transition-colors"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                          <span>Adjust Points</span>
                        </button>
                      )}

                      {humanApproval.approved ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-100/70 px-3 py-1.5 rounded-lg border border-emerald-200">
                          <Check className="h-4 w-4" /> Approved by {humanApproval.approvedBy}
                        </span>
                      ) : (
                        onApproveScore && (
                          <button
                            type="button"
                            onClick={() => onApproveScore(project.id)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-sm"
                          >
                            <Check className="h-4 w-4" />
                            <span>Approve & Publish Score</span>
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  {onOpenDisqualifyModal && (
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <span className="text-[11px] text-slate-500">
                        Academic fraud, plagiarism, or charter violation?
                      </span>
                      <button
                        type="button"
                        onClick={() => onOpenDisqualifyModal(project)}
                        className="px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs transition-colors"
                      >
                        Disqulify from contest
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
