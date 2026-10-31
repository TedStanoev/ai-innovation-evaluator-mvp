import React from "react";
import { Trophy } from "lucide-react";
import { ProjectSubmission, Contest } from "../types";
import { sortSubmissionsForRanking } from "../utils/evaluation";

interface RankingViewProps {
  contest: Contest;
  submissions: ProjectSubmission[];
  onInspectProject?: (project: ProjectSubmission) => void;
  onOpenDisqualifyModal?: (project: ProjectSubmission) => void;
}

export default function RankingView({
  contest: _contest,
  submissions,
}: RankingViewProps) {
  // Show only evaluated projects in ranking table
  const evaluatedSubmissions = submissions.filter((s) => s.status === "evaluated");
  const ranked = sortSubmissionsForRanking(evaluatedSubmissions);
  const disqualifiedCount = submissions.filter((s) => s.status === "disqualified").length;

  const awaitingCount = submissions.filter(
    (s) => s.status !== "evaluated" && s.status !== "disqualified"
  ).length;

  return (
    <div className="space-y-4">
      {/* Leaderboard Table Container */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {/* Grayer Heading Section */}
        <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-100">
          <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Trophy className="h-4 w-4 text-amber-500" />
            <span>Competition Ranking Table</span>
          </h3>
          <div className="flex flex-col items-start sm:items-end">
            <span className="text-xs text-slate-600 font-mono">
              {submissions.length} submissions registered
            </span>
            <span className="text-xs text-amber-600 font-mono font-medium">
              {awaitingCount} awaiting evaluation
            </span>
            <span className="text-xs text-red-600 font-mono font-medium">
              {disqualifiedCount} {disqualifiedCount === 1 ? "disqualification" : "disqualifications"}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs" aria-label="Competition Ranking Table">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th scope="col" className="py-3 px-4 w-16 text-center">
                  Rank
                </th>
                <th scope="col" className="py-3 px-6 text-center">
                  Project
                </th>
                <th scope="col" className="py-3 px-6 text-center">
                  Team
                </th>
                <th scope="col" className="py-3 px-6 text-center">
                  Faculty
                </th>
                <th scope="col" className="py-3 px-4 text-center">
                  Official Score
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ranked.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    No evaluated projects to display.
                  </td>
                </tr>
              ) : (
                ranked.map((sub, idx) => {
                  return (
                    <tr
                      key={sub.id}
                      className="hover:bg-slate-50/90 text-slate-800 transition-colors"
                    >
                      {/* Rank Badge */}
                      <td className="py-4 px-4 text-center">
                        {idx === 0 ? (
                          <span
                            aria-label="First Place Gold"
                            className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-amber-100 text-amber-900 font-bold border border-amber-300 shadow-2xs"
                          >
                            🥇
                          </span>
                        ) : idx === 1 ? (
                          <span
                            aria-label="Second Place Silver"
                            className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-slate-200 text-slate-800 font-bold border border-slate-300 shadow-2xs"
                          >
                            🥈
                          </span>
                        ) : idx === 2 ? (
                          <span
                            aria-label="Third Place Bronze"
                            className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-amber-700/10 text-amber-900 font-bold border border-amber-600/30 shadow-2xs"
                          >
                            🥉
                          </span>
                        ) : (
                          <span className="font-mono font-semibold text-slate-500">#{idx + 1}</span>
                        )}
                      </td>

                      {/* Project Name Only */}
                      <td className="py-4 px-6 text-center">
                        <p className="font-semibold text-slate-900">
                          {sub.title}
                        </p>
                      </td>

                      {/* Team with Members */}
                      <td className="py-4 px-6 text-center">
                        <p className="font-semibold text-slate-800">
                          {sub.team.name}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {sub.team.members.map((m) => m.name).join(", ")}
                        </p>
                      </td>

                      {/* Faculty */}
                      <td className="py-4 px-6 text-center text-slate-600">
                        {sub.team.faculty}
                      </td>

                      {/* Official Score */}
                      <td className="py-4 px-4 text-center">
                        <div>
                          <span className="text-base font-bold font-mono text-slate-900">
                            {sub.totalScore}
                          </span>
                          <span className="text-[10px] text-slate-400 ml-1">/100</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
