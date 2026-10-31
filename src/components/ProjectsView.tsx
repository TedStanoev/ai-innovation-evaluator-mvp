import React, { useState } from "react";
import { Search, Filter, CheckCircle2, Cpu } from "lucide-react";
import { ProjectSubmission, Contest } from "../types";
import { sortSubmissionsAlphabetically, countDeliverables } from "../utils/evaluation";

interface ProjectsViewProps {
  contest: Contest;
  submissions: ProjectSubmission[];
  onViewProject: (project: ProjectSubmission) => void;
  onInspectProject?: (project: ProjectSubmission) => void;
  onOpenDisqualifyModal?: (project: ProjectSubmission) => void;
}

export default function ProjectsView({
  contest,
  submissions,
  onViewProject,
}: ProjectsViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const alphabetical = sortSubmissionsAlphabetically(submissions);

  const filtered = alphabetical.filter((sub) => {
    const matchesSearch =
      sub.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.summary.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || sub.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects, teams..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs rounded-lg border border-slate-300 pl-9 p-2.5 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by project status"
            className="text-xs rounded-lg border border-slate-300 p-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-2xs"
          >
            <option value="all">All Submission Statuses</option>
            <option value="evaluated">Evaluated & Confirmed</option>
            <option value="needs_review">Needs Review</option>
            <option value="auditing">Auditing in Progress</option>
            <option value="disqualified">Disqualified</option>
          </select>
        </div>
      </div>

      {/* Projects Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Project Submissions
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            Showing {filtered.length} of {submissions.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs" aria-label="Project Submissions Table">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th scope="col" className="py-3 px-6">Project</th>
                <th scope="col" className="py-3 px-4">Team & Faculty</th>
                <th scope="col" className="py-3 px-4 text-center">Deliverables</th>
                <th scope="col" className="py-3 px-4 text-center">Evaluation Status</th>
                <th scope="col" className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((sub) => {
                const isDisqualified = sub.status === "disqualified";
                const { count, total, isComplete } = countDeliverables(sub.deliverables);

                return (
                  <tr
                    key={sub.id}
                    className={`transition-colors ${
                      isDisqualified
                        ? "bg-rose-50/20 text-slate-400"
                        : "hover:bg-slate-50/80 text-slate-800"
                    }`}
                  >
                    {/* Project Title only */}
                    <td className="py-4 px-6 max-w-sm">
                      <p
                        className={`font-semibold ${
                          isDisqualified ? "line-through text-slate-400" : "text-slate-900"
                        }`}
                      >
                        {sub.title}
                      </p>
                    </td>

                    {/* Team & Faculty & Members */}
                    <td className="py-4 px-4">
                      <p className="font-semibold text-slate-800">{sub.team.name}</p>
                      <p className="text-xs text-slate-500">{sub.team.faculty}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {sub.team.members.map((m) => m.name).join(", ")}
                      </p>
                    </td>

                    {/* Deliverables completeness */}
                    <td className="py-4 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 font-mono px-2.5 py-0.5 rounded text-[11px] font-medium border ${
                          isComplete
                            ? "bg-slate-50 text-slate-700 border-slate-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                        <span>{count}/{total}</span>
                      </span>
                    </td>

                    {/* Evaluation Status */}
                    <td className="py-4 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium capitalize ${
                          sub.status === "evaluated"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : sub.status === "disqualified"
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {sub.status.replace("_", " ")}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <button
                        type="button"
                        onClick={() => onViewProject(sub)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-[11px] transition-colors"
                      >
                        <Cpu className="h-3 w-3 text-blue-600" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
