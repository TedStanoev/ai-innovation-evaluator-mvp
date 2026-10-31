import React, { useState } from "react";
import {
  ArrowLeft,
  Plus,
  Trash2,
  UploadCloud,
  Link2,
  Sparkles,
  Cpu,
  AlertCircle,
} from "lucide-react";
import { Contest, DeliverableType, ProjectSubmission, TeamMember } from "../types";

interface FormDeliverable {
  key: string;
  name: string;
  label: string;
  fileHint: string;
  type: DeliverableType;
  inputValue: string;
}

interface SubmitViewProps {
  contest: Contest;
  onBack: () => void;
  onSubmitNewProject: (newProject: ProjectSubmission) => void;
}

export default function SubmitView({
  contest,
  onBack,
  onSubmitNewProject,
}: SubmitViewProps) {
  const maxParticipants = contest.maxParticipants ?? 5;

  const [teamName, setTeamName] = useState("");
  const [faculty, setFaculty] = useState(contest.faculty);
  const [projectTitle, setProjectTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const [members, setMembers] = useState<TeamMember[]>([
    {
      id: "mem-1",
      name: "Tanya Dimitrova",
      email: "t.dimitrova@uni.edu",
      facultyNumber: "F-12003",
    },
    {
      id: "mem-2",
      name: "Nikolay Vasilev",
      email: "n.vasilev@uni.edu",
      facultyNumber: "B-33109",
    },
  ]);

  const [deliverables, setDeliverables] = useState<FormDeliverable[]>([
    { key: "deck", name: "Deck", label: "1. Presentation Pitch Deck", fileHint: "Deck.pdf (Max 25MB)", type: "file", inputValue: "QuantumFlow_InvestorDeck_v3.pdf" },
    { key: "demo", name: "Demo", label: "2. Video Pitch & Demonstration", fileHint: "Demo.mp4 or YouTube / Loom URL", type: "link", inputValue: "https://youtu.be/quantumflow-demo-2026" },
    { key: "leanCanvas", name: "Lean Canvas", label: "3. Lean Canvas Document", fileHint: "LeanCanvas.pdf", type: "file", inputValue: "QuantumFlow_LeanCanvas.pdf" },
    { key: "mvp", name: "MVP Spec", label: "4. MVP Specification Dossier", fileHint: "MVP.pdf (Technical architecture)", type: "file", inputValue: "System_Architecture_Spec.pdf" },
    { key: "validation", name: "Validation", label: "5. Market Validation Record", fileHint: "Validation.pdf (Min. 5 SME interviews)", type: "file", inputValue: "SME_Interviews_Transcript.pdf" },
    { key: "ethics", name: "Ethics", label: "6. AI Ethics & Security Guidelines", fileHint: "Ethics.pdf (GDPR, Safety disclosures)", type: "file", inputValue: "Ethics_Safety_Protocol.pdf" },
    { key: "plan90", name: "Plan 90", label: "7. 90-Day Execution Plan", fileHint: "Plan90.pdf (Gantt & milestones)", type: "file", inputValue: "Execution_Milestones_Q1.pdf" },
    { key: "prototypeZip", name: "Prototype Repo", label: "8. Prototype Codebase / Repository", fileHint: "Prototype.zip or GitHub Repo URL", type: "link", inputValue: "https://github.com/quantumflow/agent-orchestrator" },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionProgress, setSubmissionProgress] = useState("");

  const handleAddMember = () => {
    if (members.length >= maxParticipants) {
      setValidationError(`Maximum allowed team size is ${maxParticipants} members.`);
      return;
    }
    setValidationError(null);
    setMembers((prev) => [
      ...prev,
      {
        id: `mem-${Date.now()}`,
        name: "",
        email: "",
        facultyNumber: "",
      },
    ]);
  };

  const handleRemoveMember = (id: string) => {
    if (members.length <= 1) {
      setValidationError("A minimum of 1 team member is required.");
      return;
    }
    setValidationError(null);
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const handleMemberChange = (id: string, field: keyof TeamMember, val: any) => {
    setValidationError(null);
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: val } : m))
    );
  };

  const toggleDeliverableType = (index: number) => {
    setDeliverables((prev) =>
      prev.map((item, idx) => {
        if (idx === index) {
          return {
            ...item,
            type: item.type === "file" ? "link" : "file",
            inputValue: item.type === "file" ? "https://" : "",
          };
        }
        return item;
      })
    );
  };

  const handleDeliverableValueChange = (index: number, val: string) => {
    setDeliverables((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, inputValue: val } : item))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!teamName.trim()) {
      setValidationError("Please enter a team name.");
      return;
    }
    if (!projectTitle.trim()) {
      setValidationError("Please enter a project title.");
      return;
    }
    if (!summary.trim()) {
      setValidationError("Please enter a project summary.");
      return;
    }

    if (members.length < 1) {
      setValidationError("At least 1 team member is required.");
      return;
    }

    if (members.length > maxParticipants) {
      setValidationError(`Total number of participants cannot exceed the maximum of ${maxParticipants}.`);
      return;
    }

    for (let i = 0; i < members.length; i++) {
      const m = members[i];
      if (!m.name.trim()) {
        setValidationError(`Full Name is required for member #${i + 1}.`);
        return;
      }
      if (!m.email.trim() || !m.email.includes("@")) {
        setValidationError(`A valid University Email is required for member #${i + 1}.`);
        return;
      }
      if (!m.facultyNumber.trim()) {
        setValidationError(`Faculty ID Number is required for member #${i + 1}.`);
        return;
      }
    }

    setIsSubmitting(true);
    setSubmissionProgress("Step 1/3: Ingesting 8 deliverables into Agent 1 (Submission Auditor)...");

    setTimeout(() => {
      setSubmissionProgress("Step 2/3: Agent 2 (Lead Judge) evaluating rubric & generating feedback letter...");
      setTimeout(() => {
        setSubmissionProgress("Step 3/3: Publishing to official academic leaderboard...");
        setTimeout(() => {
          // Construct the new ProjectSubmission
          const newSubmissionId = `sub-${Date.now().toString().slice(-4)}`;
          const deliverableObj: any = {};
          deliverables.forEach((d) => {
            deliverableObj[d.key] = {
              id: `del-${d.key}`,
              name: d.name,
              label: d.label,
              type: d.type,
              value: d.inputValue || "attached_artifact",
              filename: d.type === "file" ? (d.inputValue || `${d.name}.pdf`) : undefined,
              fileSize: d.type === "file" ? "2.4 MB" : undefined,
              submittedAt: new Date().toISOString().replace("T", " ").slice(0, 16),
            };
          });

          const newProj: ProjectSubmission = {
            id: newSubmissionId,
            contestId: contest.id,
            teamId: `team-${newSubmissionId}`,
            team: {
              id: `team-${newSubmissionId}`,
              name: teamName,
              faculty: faculty || contest.faculty,
              members,
            },
            title: projectTitle,
            summary,
            totalScore: 91,
            status: "evaluated",
            rank: 2,
            deliverables: deliverableObj,
            agentEvaluation: {
              agent1Auditor: {
                status: "completed",
                executionTimeMs: 1350,
                extractedFacts: [
                  "All 8 academic deliverable items verified in compliant formats.",
                  "GitHub repository parsed: modular architecture with automated containerized build scripts.",
                  "Transcripts confirm 6 documented interviews with SME operational leaders.",
                  "Unit economics outline positive contribution margin within 4 months of deployment.",
                ],
                flags: [],
                fileIntegrityCheck: { totalRequired: 8, totalSubmitted: 8, passedFormatVerification: true },
                rawJsonOutput: { confidenceScore: 0.96, verifiableClaimsCount: 12, deliverablesHealth: "optimal" },
              },
              agent2Mentor: {
                status: "completed",
                rubricScores: {
                  problem: 11,
                  aiTools: 17,
                  prototype: 18,
                  leanCanvas: 11,
                  validation: 13,
                  ethics: 8,
                  plan90: 7,
                  demo: 6,
                },
                strengths: [
                  "Strong technical execution and clean repo structure.",
                  "Exemplary qualitative market validation with specific SME quotes.",
                  "Pragmatic approach to enterprise AI safety.",
                ],
                recommendations: [
                  "Strengthen the final demo video pacing to highlight the UI responsiveness.",
                  "Detail cold-start model fallback latency in Section 4.",
                ],
                diplomaticFeedbackLetter: `Dear ${teamName}, your project "${projectTitle}" demonstrates remarkable technical rigor and domain empathy. The evaluation panel commends your structured validation and modular code. With minor polish on presentation delivery, this venture prototype holds strong commercial promise.`,
              },
              humanApproval: {
                approved: true,
                approvedBy: "Dr. Elena Rostova",
                timestamp: new Date().toISOString(),
              },
            },
          };

          onSubmitNewProject(newProj);
        }, 600);
      }, 700);
    }, 700);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 rounded-xl border border-slate-200 bg-white/95 backdrop-blur-xs p-5 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Back to Contest Details"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight">
              New Project Submission Form
            </h1>
            <p className="text-xs text-slate-500">
              <span className="font-semibold text-slate-700">{contest.title}</span> • 8 deliverables required
            </p>
          </div>
        </div>
      </div>

      {/* Progress banner when submitting */}
      {isSubmitting && (
        <div className="rounded-xl border border-blue-300 bg-blue-50 p-4 shadow-sm flex items-center gap-3 text-blue-900 text-xs font-mono">
          <Cpu className="h-5 w-5 animate-pulse text-blue-600" />
          <span className="font-semibold">{submissionProgress}</span>
        </div>
      )}

      {/* Validation alert */}
      {validationError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 shadow-2xs flex items-center gap-3 text-red-800 text-xs">
          <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
          <span className="font-medium">{validationError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Team & Participant Details */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900">
              1. Team & Participant Details
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="team-name" className="block text-xs font-semibold text-slate-700 mb-1">
                Team Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="team-name"
                required
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-2xs"
              />
            </div>

            <div>
              <label htmlFor="team-faculty" className="block text-xs font-semibold text-slate-700 mb-1">
                Faculty / Department
              </label>
              <input
                id="team-faculty"
                type="text"
                value={faculty}
                onChange={(e) => setFaculty(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-2xs"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="project-title" className="block text-xs font-semibold text-slate-700 mb-1">
                Project Title <span className="text-rose-500">*</span>
              </label>
              <input
                id="project-title"
                required
                type="text"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-2xs"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="project-abstract" className="block text-xs font-semibold text-slate-700 mb-1">
                Project Summary <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="project-abstract"
                required
                rows={3}
                placeholder="Describe your project, problem/solution, idea..."
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-2xs"
              />
            </div>
          </div>

          {/* Dynamic Members List */}
          <div className="pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-700">
                Team members • {maxParticipants} maximum allowed
              </label>
              <button
                type="button"
                onClick={handleAddMember}
                disabled={members.length >= maxParticipants}
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" /> Add Student Member
              </button>
            </div>

            <div className="space-y-3">
              {members.map((member, idx) => (
                <div
                  key={member.id}
                  className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/70 flex flex-col md:flex-row gap-3 items-end"
                >
                  <div className="flex-1 w-full min-w-[200px]">
                    <span className="block text-[11px] font-medium text-slate-500 mb-1">
                      Full Name #{idx + 1} <span className="text-rose-500">*</span>
                    </span>
                    <input
                      required
                      type="text"
                      value={member.name}
                      onChange={(e) => handleMemberChange(member.id, "name", e.target.value)}
                      className="w-full text-xs rounded-md border border-slate-300 p-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-2xs"
                    />
                  </div>
                  <div className="w-full md:w-60">
                    <span className="block text-[11px] font-medium text-slate-500 mb-1">
                      University Email <span className="text-rose-500">*</span>
                    </span>
                    <input
                      required
                      type="email"
                      value={member.email}
                      onChange={(e) => handleMemberChange(member.id, "email", e.target.value)}
                      className="w-full text-xs rounded-md border border-slate-300 p-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-2xs"
                    />
                  </div>
                  <div className="w-full md:w-44">
                    <span className="block text-[11px] font-medium text-slate-500 mb-1">
                      Faculty ID Number <span className="text-rose-500">*</span>
                    </span>
                    <input
                      required
                      type="text"
                      value={member.facultyNumber}
                      onChange={(e) => handleMemberChange(member.id, "facultyNumber", e.target.value)}
                      className="w-full text-xs rounded-md border border-slate-300 p-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-2xs"
                    />
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(member.id)}
                      disabled={members.length <= 1}
                      aria-label={`Remove member ${idx + 1}`}
                      className="p-2 rounded text-slate-400 hover:text-rose-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                      title={members.length <= 1 ? "Minimum 1 member required" : "Remove member"}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 2: Project Deliverables (8 Items with File/URL Toggle) */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                2. Project Deliverables (8 of 8 Mandatory)
              </h2>
              <p className="text-xs text-slate-500">
                Toggle between direct file upload or external public URLs (Google Drive, Loom, GitHub) for each item.
              </p>
            </div>
            <span className="text-xs font-mono bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-md font-semibold">
              8 Required Deliverables
            </span>
          </div>

          <div className="space-y-3.5">
            {deliverables.map((item, idx) => (
              <div
                key={item.key}
                className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 hover:border-slate-300 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold text-slate-900">{item.label}</span>

                  {/* Switch / Toggle */}
                  <div className="flex items-center gap-1 bg-slate-200/70 p-0.5 rounded-lg text-[10px] self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => item.type !== "file" && toggleDeliverableType(idx)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded font-medium transition-all cursor-pointer ${
                        item.type === "file"
                          ? "bg-white text-blue-700 shadow-2xs font-semibold"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <UploadCloud className="h-3 w-3" /> Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => item.type !== "link" && toggleDeliverableType(idx)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded font-medium transition-all cursor-pointer ${
                        item.type === "link"
                          ? "bg-white text-blue-700 shadow-2xs font-semibold"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <Link2 className="h-3 w-3" /> External Link / URL
                    </button>
                  </div>
                </div>

                {item.type === "file" ? (
                  <div className="border border-dashed border-slate-300 rounded-lg p-3 bg-white text-center hover:bg-slate-50/70 transition-colors cursor-pointer">
                    <div className="flex items-center justify-center gap-2 text-slate-600 text-xs">
                      <UploadCloud className="h-4 w-4 text-blue-600" />
                      <span>{item.fileHint}</span>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      id={`file-input-${idx}`}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleDeliverableValueChange(idx, file.name);
                      }}
                    />
                    <label
                      htmlFor={`file-input-${idx}`}
                      className="inline-block mt-1 text-[11px] text-blue-600 hover:underline cursor-pointer font-medium"
                    >
                      {item.inputValue ? `Selected: ${item.inputValue}` : "Choose local file"}
                    </label>
                  </div>
                ) : (
                  <div className="relative">
                    <Link2 className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <input
                      required
                      type="url"
                      placeholder={`https://... (${item.fileHint})`}
                      value={item.inputValue}
                      onChange={(e) => handleDeliverableValueChange(idx, e.target.value)}
                      className="w-full text-xs rounded-lg border border-slate-300 pl-8 p-2.5 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-2xs"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Sparkles className="h-4 w-4" />
            <span>Submit and Evaluate</span>
          </button>
        </div>
      </form>
    </div>
  );
}
