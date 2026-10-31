import React from "react";
import {
  Trophy,
  Cpu,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { Contest, User } from "../types";

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  currentView: string;
  onNavigate: (view: string, contestId?: string) => void;
  contests: Contest[];
  selectedContestId: string;
  onSelectContest: (id: string) => void;
  currentUser: User;
  onOpenLiveInspector: () => void;
  onLogout: () => void;
}

export default function Sidebar({
  collapsed,
  onToggleCollapse,
  currentView,
  onNavigate,
  contests,
  selectedContestId,
  onSelectContest,
  currentUser,
  onOpenLiveInspector,
  onLogout,
}: SidebarProps) {
  return (
    <aside
      aria-label="Platform Sidebar"
      className={`relative flex flex-col border-r border-slate-200 bg-white transition-all duration-300 z-30 shrink-0 ${
        collapsed ? "w-20" : "w-72"
      }`}
    >
      {/* Top Header / Logo */}
      <div className="h-16 flex items-center justify-between px-3.5 border-b border-slate-200 bg-slate-100">
        <button
          onClick={() => onNavigate("desk")}
          className="group flex items-center gap-2.5 overflow-hidden text-left focus:outline-none min-w-0"
          title="AI Innovation Evaluator"
        >
          {/* Transparent letters with light blue outline that fill on hover */}
          <div className="bg-transparent border-0 p-0 flex items-center justify-center shrink-0">
            <span
              className="font-black text-2xl tracking-wider select-none text-transparent transition-colors duration-200 group-hover:text-sky-400 hover:text-sky-400"
              style={{
                WebkitTextStroke: "1.75px #38bdf8",
              }}
            >
              AIIE
            </span>
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <div className="font-bold tracking-tight text-slate-900 text-[13px] whitespace-nowrap">
                AI Innovation Evaluator
              </div>
            </div>
          )}
        </button>
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/70 transition-colors shrink-0 ml-1"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
        {/* Contests Section */}
        <div>
          <div className="flex items-center justify-between px-3 mb-2">
            <div className="flex items-center gap-1.5">
              <Trophy className="h-3.5 w-3.5 text-slate-500 shrink-0" />
              {!collapsed && (
                <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                  CONTESTS
                </p>
              )}
            </div>
            {!collapsed && (
              <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono font-medium">
                {contests.length}
              </span>
            )}
          </div>

          <div className="space-y-1.5" role="list">
            {contests.map((c) => {
              const isSelected = c.id === selectedContestId;
              const statusDotColor =
                c.status === "Active"
                  ? "bg-emerald-500"
                  : c.status === "Archived"
                  ? "bg-slate-400"
                  : "bg-amber-400";

              return (
                <button
                  key={c.id}
                  onClick={() => {
                    onSelectContest(c.id);
                    onNavigate("contest-details", c.id);
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg border text-xs transition-all flex items-center justify-between gap-2 ${
                    isSelected
                      ? "bg-blue-50 text-blue-700 font-semibold border-l-4 border-l-blue-600 border-y-blue-200 border-r-blue-200 shadow-xs"
                      : "bg-white border-slate-200/90 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                  title={`${c.title} (${c.status})`}
                >
                  <span className="truncate block font-medium">
                    {collapsed ? c.shortTitle : c.title}
                  </span>
                  <span
                    className={`h-2 w-2 rounded-full shrink-0 ${statusDotColor}`}
                    title={`Status: ${c.status}`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Live AI Inspector button moved below Contests section, without ADK pill */}
        <button
          onClick={onOpenLiveInspector}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-indigo-700 bg-indigo-50/70 hover:bg-indigo-100/70 transition-colors text-left border border-indigo-200/60"
          title={collapsed ? "Live AI Inspector" : undefined}
        >
          <Cpu className="h-4 w-4 shrink-0 text-indigo-600 animate-pulse" />
          {!collapsed && (
            <span className="font-semibold text-xs">Live AI Inspector</span>
          )}
        </button>
      </div>

      {/* User Footer */}
      <div className="p-3 border-t border-slate-200 bg-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="h-8 w-8 rounded-full border border-slate-300 object-cover shrink-0"
            />
            {!collapsed && (
              <div className="truncate">
                <p className="text-xs font-semibold text-slate-900 truncate">{currentUser.name}</p>
                <div className="flex items-center gap-1.5">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  <span className="text-[11px] text-sky-500 font-semibold">{currentUser.role}</span>
                </div>
              </div>
            )}
          </div>
          {!collapsed && (
            <button
              onClick={onLogout}
              aria-label="Logout"
              className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-slate-200/70 transition-colors"
              title="Logout to Login Screen"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
