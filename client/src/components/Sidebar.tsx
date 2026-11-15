import React from "react";
import { LogOut, ChevronRight, ChevronDown, Bot } from "lucide-react";
import { User } from "../types";
import { ContestItem } from "../data/mockStudents";

interface SidebarProps {
  contests: ContestItem[];
  activeContestId: string;
  onSelectContest: (contestId: string) => void;
  inspectorOpen: boolean;
  onToggleInspector: () => void;
  isAgentActive: boolean;
  thoughtsCount: number;
  currentUser: User;
  onLogout: () => void;
}

export default function Sidebar({
  contests,
  activeContestId,
  onSelectContest,
  inspectorOpen,
  onToggleInspector,
  isAgentActive,
  thoughtsCount,
  currentUser,
  onLogout,
}: SidebarProps) {
  return (
    <aside
      aria-label="Platform Sidebar"
      className="relative z-20 w-72 shrink-0 flex flex-col rounded-3xl plate-acrylic select-none overflow-hidden"
    >
      {/* Top Branding */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-sky-400 via-cyan-500 to-teal-500 flex items-center justify-center text-white font-extrabold text-xs tracking-wider shadow-[0_8px_18px_-4px_rgba(14,165,233,0.55)] shrink-0">
            AIIE
          </div>
          <div className="min-w-0">
            <div className="text-[15px] font-extrabold text-[#0b1c30] tracking-tight leading-tight">
              AIIE Platform
            </div>
            <div className="text-[11px] font-semibold text-[#0d9488] truncate mt-0.5">
              AI Innovation Evaluator
            </div>
          </div>
        </div>
      </div>

      {/* AI Inspector Trigger */}
      <div className="px-4 pb-3">
        <button
          type="button"
          onClick={onToggleInspector}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all border cursor-pointer ${
            inspectorOpen
              ? "bg-gradient-to-r from-sky-500 via-teal-500 to-emerald-500 text-white border-white/40 shadow-[0_10px_24px_-6px_rgba(13,148,136,0.45)]"
              : "bg-gradient-to-r from-white/95 via-teal-50/40 to-emerald-50/60 hover:from-teal-50/70 hover:to-emerald-50/90 text-[#0b1c30] border-teal-200/70 shadow-[0_8px_20px_-6px_rgba(13,148,136,0.12)]"
          }`}
        >
          <span className="flex items-center gap-2.5">
            <Bot
              className={`h-4 w-4 shrink-0 ${
                inspectorOpen ? "text-white" : "text-slate-600"
              }`}
            />
            <span>AI Inspector</span>
            {isAgentActive && (
              <span className="relative flex h-2 w-2 ml-0.5">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    inspectorOpen ? "bg-white" : "bg-[#0d9488]"
                  }`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    inspectorOpen ? "bg-white" : "bg-[#0d9488]"
                  }`}
                />
              </span>
            )}
          </span>

          <span
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${
              inspectorOpen
                ? "bg-white/25 text-white"
                : "bg-teal-100/90 text-[#0d9488]"
            }`}
          >
            {thoughtsCount}
          </span>
        </button>
      </div>

      {/* Contests Navigation (КОНКУРСИ) */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        <div className="px-2 pb-2.5 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
          КОНКУРСИ
        </div>
        <nav aria-label="Списък с конкурси" className="space-y-1.5">
          {contests.map((contest) => {
            const isActive = contest.id === activeContestId;
            return (
              <button
                key={contest.id}
                type="button"
                onClick={() => onSelectContest(contest.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-left text-xs transition-all cursor-pointer ${
                  isActive
                    ? "bg-gradient-to-r from-teal-50/90 via-cyan-50/70 to-emerald-50/70 text-[#0b1c30] font-bold border border-teal-200/80 shadow-2xs"
                    : "text-slate-500 hover:bg-white/60 hover:text-[#0b1c30] font-medium border border-transparent"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {isActive ? (
                    <ChevronDown className="h-3.5 w-3.5 shrink-0 text-[#0d9488]" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  )}
                  <span className="truncate">{contest.shortLabel}</span>
                </div>
                {isActive && (
                  <span className="ml-2 h-2.5 w-2.5 rounded-full bg-[#0d9488] ring-4 ring-teal-400/25 shrink-0" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Footer: Admin Profile & Logout */}
      <div className="px-4 py-4 border-t border-slate-200/60">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-sky-400 via-cyan-500 to-teal-500 text-white font-extrabold text-xs flex items-center justify-center shadow-[0_6px_14px_-3px_rgba(14,165,233,0.45)] shrink-0">
              ЕР
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-[#0b1c30] truncate">
                {currentUser.name}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#10b981]" />
                <span className="text-[11px] text-[#0d9488] font-semibold">
                  {currentUser.role}
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onLogout}
            aria-label="Изход"
            title="Изход от профила"
            className="p-1.5 rounded-xl text-slate-400 hover:text-[#0b1c30] hover:bg-slate-100/80 transition-colors cursor-pointer shrink-0"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
