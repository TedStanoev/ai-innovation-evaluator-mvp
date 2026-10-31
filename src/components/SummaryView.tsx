import React from "react";
import {
  Calendar,
  Clock,
  Trophy,
  Cpu,
  Target,
  Code2,
  Layers,
  UserCheck,
  ShieldCheck,
  Video,
  FileCheck2,
  BookOpen,
  MapPin,
} from "lucide-react";
import { Contest } from "../types";

interface SummaryViewProps {
  contest: Contest;
  totalSubmissions: number;
  evaluatedCount: number;
  onNavigateToProjects: () => void;
  onNavigateToRanking: () => void;
}

const CRITERIA_ICONS: Record<string, React.ElementType> = {
  Target,
  Cpu,
  Code2,
  Layers,
  UserCheck,
  ShieldCheck,
  Calendar,
  Video,
};

export default function SummaryView({
  contest,
  totalSubmissions,
  evaluatedCount,
  onNavigateToProjects,
  onNavigateToRanking,
}: SummaryViewProps) {
  return (
    <div className="space-y-6">
      {/* Centered Contest Header */}
      <div className="text-center pt-1 pb-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          {contest.title}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1.5">
          {contest.faculty}
        </p>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1.5">
          Academic Year {contest.academicYear}
        </p>
      </div>

      {/* Description Section with Metrics & Dates */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-6">
          <div className="flex-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Description
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed max-w-3xl">
              {contest.description}
            </p>
          </div>

          {/* Quick Metrics: Registered Teams & Projects Evaluated */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onNavigateToRanking}
              className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-slate-100 text-left transition-colors min-w-[140px]"
            >
              <span className="block text-[10px] uppercase font-semibold text-slate-400">
                Registered Teams
              </span>
              <span className="text-base font-bold text-slate-900 font-mono">
                {totalSubmissions} Teams
              </span>
            </button>
            <button
              onClick={onNavigateToProjects}
              className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-slate-100 text-left transition-colors min-w-[140px]"
            >
              <span className="block text-[10px] uppercase font-semibold text-slate-400">
                Projects Evaluated
              </span>
              <span className="text-base font-bold text-emerald-700 font-mono">
                {evaluatedCount} / {totalSubmissions}
              </span>
            </button>
          </div>
        </div>

        {/* Timeline & Location Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-100 pt-5">
          {/* Submission Deadline */}
          <div className="flex items-center gap-3 p-3.5 rounded-lg bg-slate-50 border border-slate-200/80">
            <div className="h-9 w-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200 shrink-0">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Submission Deadline
              </span>
              <span className="text-xs font-semibold text-slate-900">
                {contest.dates.submissionDeadline}
              </span>
            </div>
          </div>

          {/* Defense Location */}
          <div className="flex items-center gap-3 p-3.5 rounded-lg bg-slate-50 border border-slate-200/80">
            <div className="h-9 w-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-200 shrink-0">
              <MapPin className="h-4 w-4" />
            </div>
            <div>
              <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Defense Location
              </span>
              <span className="text-xs font-semibold text-slate-900">
                {contest.defenseLocation || "Aula Maxima, University Central Campus"}
              </span>
            </div>
          </div>

          {/* Jury Defense */}
          <div className="flex items-center gap-3 p-3.5 rounded-lg bg-slate-50 border border-slate-200/80">
            <div className="h-9 w-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200 shrink-0">
              <Trophy className="h-4 w-4" />
            </div>
            <div>
              <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Jury Defense
              </span>
              <span className="text-xs font-semibold text-slate-900">
                {contest.dates.finaleDate}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Official Evaluation Criteria Cards */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Official Evaluation Criteria
            </h3>
            <p className="text-xs text-slate-500">
              Automated calibration
            </p>
          </div>
          <span className="text-xs font-mono bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md border border-slate-200 self-start sm:self-auto">
            100 Max Points
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {contest.evaluationCriteria.map((crit, index) => {
            const Icon = CRITERIA_ICONS[crit.iconName] || BookOpen;
            return (
              <div
                key={crit.id}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs hover:border-blue-300 hover:shadow-sm transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="h-7 w-7 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold font-mono bg-blue-50 text-blue-700 border border-blue-200">
                      {crit.maxPoints} pts
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 mb-1.5 leading-snug">
                    {index + 1}. {crit.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {crit.description}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                  <span className="font-mono">Criteria #{index + 1}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mandatory Deliverables Protocol Box */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <FileCheck2 className="h-4 w-4 text-blue-600" />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
            Intake Protocols & Deliverables Checklist (8 of 8 Required)
          </h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          {[
            { name: "1. Pitch Deck", file: "Deck.pdf (max 25MB)" },
            { name: "2. Video Pitch", file: "Demo.mp4 / URL" },
            { name: "3. Lean Canvas", file: "LeanCanvas.pdf" },
            { name: "4. MVP Specification", file: "MVP.pdf" },
            { name: "5. Customer Validation", file: "Validation.pdf (min 5)" },
            { name: "6. AI Ethics & GDPR", file: "Ethics.pdf" },
            { name: "7. 90-Day Roadmap", file: "Plan90.pdf" },
            { name: "8. Prototype Source", file: "Prototype.zip / Git URL" },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-lg border border-slate-200/80 bg-slate-50 text-slate-800"
            >
              <p className="font-semibold text-[11px] text-slate-900">{item.name}</p>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">{item.file}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
