import React, { useState } from "react";
import { AlertOctagon, X, ShieldAlert } from "lucide-react";
import { ProjectSubmission } from "../types";

interface DisqualifyDialogProps {
  isOpen: boolean;
  project: ProjectSubmission | null;
  adminName: string;
  onClose: () => void;
  onConfirm: (projectId: string, reason: string) => void;
}

export default function DisqualifyDialog({
  isOpen,
  project,
  adminName,
  onClose,
  onConfirm,
}: DisqualifyDialogProps) {
  const [rationale, setRationale] = useState("");
  const [selectedPreset, setSelectedPreset] = useState<string>("");

  if (!isOpen || !project) return null;

  const presets = [
    "Confirmed source code plagiarism without proper attribution (University Charter Art. 14).",
    "Fabricated customer validation interviews and falsified partner company letters.",
    "Submission materials breach intellectual property protections or privacy regulations.",
    "Critical academic integrity discrepancy detected between claims and delivered prototype.",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rationale.trim()) return;
    onConfirm(project.id, rationale.trim());
    setRationale("");
    setSelectedPreset("");
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="disqualify-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"
    >
      <div className="relative w-full max-w-lg rounded-xl border border-rose-200 bg-white p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close Disqualify Dialog"
          className="absolute top-4 right-4 p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 text-rose-600 mb-4">
          <div className="p-2.5 rounded-full bg-rose-50 border border-rose-200">
            <AlertOctagon className="h-6 w-6" />
          </div>
          <div>
            <h3 id="disqualify-title" className="text-base font-bold text-slate-900">
              Admin Disqualification Override
            </h3>
            <p className="text-xs text-slate-500">Human-in-the-loop sanction gate • Authorized Admin: {adminName}</p>
          </div>
        </div>

        <div className="bg-rose-50/70 border border-rose-200 rounded-lg p-3 text-xs text-rose-950 mb-4">
          <p className="font-semibold mb-1">
            Target Submission: <span className="underline">{project.title}</span> ({project.team.name})
          </p>
          <p className="text-[11px] text-rose-800 leading-relaxed">
            <strong>Mandatory Protocol:</strong> AI agents are strictly prohibited from autonomously disqualifying projects. As an authorized Academic Administrator, this manual override enforces 0 points, locks further evaluation, pushes the project to the bottom of the official rankings, and records your signed rationale into the immutable jury audit log.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Quick Administrative Reason Presets:
            </label>
            <div className="space-y-1.5">
              {presets.map((preset, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => {
                    setSelectedPreset(preset);
                    setRationale(preset);
                  }}
                  className={`w-full text-left p-2 rounded border text-[11px] transition-colors ${
                    selectedPreset === preset
                      ? "border-rose-400 bg-rose-50 text-rose-900 font-medium"
                      : "border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600"
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="admin-rationale-input" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Official Admin Rationale Note <span className="text-rose-500">*</span>:
            </label>
            <textarea
              id="admin-rationale-input"
              required
              rows={3}
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              placeholder="State the factual basis, reviewed evidence, or university charter articles infringed..."
              className="w-full text-xs rounded-lg border border-slate-300 p-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!rationale.trim()}
              className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <ShieldAlert className="h-4 w-4" />
              <span>Confirm Disqualification</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
