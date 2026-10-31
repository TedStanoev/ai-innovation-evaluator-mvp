import React, { useState } from "react";
import { Edit3, X, Check, RotateCcw } from "lucide-react";
import { ProjectSubmission, Contest } from "../types";

interface AdjustPointsDialogProps {
  isOpen: boolean;
  project: ProjectSubmission | null;
  contest: Contest;
  onClose: () => void;
  onSaveScores: (projectId: string, newScores: Record<string, number>) => void;
}

export default function AdjustPointsDialog({
  isOpen,
  project,
  contest,
  onClose,
  onSaveScores,
}: AdjustPointsDialogProps) {
  if (!isOpen || !project) return null;

  const currentScores = project.agentEvaluation.agent2Mentor.rubricScores || {};
  const [scores, setScores] = useState<Record<string, number>>({ ...currentScores });

  const criteriaList = contest.evaluationCriteria.length > 0
    ? contest.evaluationCriteria
    : Object.keys(currentScores).map((k) => ({
        id: k,
        key: k,
        name: k.toUpperCase(),
        maxPoints: 20,
        description: "",
        iconName: "",
      }));

  const handleScoreChange = (key: string, val: number, max: number) => {
    const clamped = Math.max(0, Math.min(val, max));
    setScores((prev) => ({ ...prev, [key]: clamped }));
  };

  const totalCalculated = Object.values(scores).reduce((sum, v) => sum + (Number(v) || 0), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveScores(project.id, scores);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="adjust-points-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"
    >
      <div className="relative w-full max-w-xl rounded-xl border border-slate-200 bg-white p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close Point Adjustment Dialog"
          className="absolute top-4 right-4 p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 text-blue-600 mb-4">
          <div className="p-2.5 rounded-full bg-blue-50 border border-blue-200">
            <Edit3 className="h-6 w-6" />
          </div>
          <div>
            <h3 id="adjust-points-title" className="text-base font-bold text-slate-900">
              Manual Rubric Score Calibration
            </h3>
            <p className="text-xs text-slate-500">
              Overriding or fine-tuning AI proposed scores for {project.title}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
            {criteriaList.map((crit) => {
              const val = scores[crit.key] ?? 0;
              return (
                <div
                  key={crit.id}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-slate-50/70 text-xs"
                >
                  <div className="flex-1 pr-3">
                    <span className="font-semibold text-slate-800">{crit.name}</span>
                    <span className="block text-[10px] text-slate-400">
                      Maximum weight: {crit.maxPoints} pts
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={crit.maxPoints}
                      value={val}
                      onChange={(e) =>
                        handleScoreChange(crit.key, parseInt(e.target.value, 10) || 0, crit.maxPoints)
                      }
                      className="w-16 text-center font-mono font-bold text-slate-900 rounded border border-slate-300 p-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    <span className="text-[11px] text-slate-400 font-mono">/ {crit.maxPoints}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-900">Recalibrated Total Score:</span>
            <span className="text-base font-bold font-mono text-blue-950">{totalCalculated} / 100 pts</span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setScores({ ...currentScores })}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset to AI Proposed
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
              >
                <Check className="h-4 w-4" />
                <span>Save Calibrated Score</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
