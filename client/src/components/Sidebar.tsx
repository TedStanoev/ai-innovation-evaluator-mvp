import React from "react";
import { ChevronLeft, ChevronRight, LogOut, Users } from "lucide-react";
import { User } from "../types";

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  currentUser: User;
  onLogout: () => void;
}

export default function Sidebar({
  collapsed,
  onToggleCollapse,
  currentUser,
  onLogout,
}: SidebarProps) {
  return (
    <aside
      aria-label="Platform Sidebar"
      className={`relative flex flex-col border-r border-[#abb5bb]/60 bg-white transition-all duration-300 z-30 shrink-0 ${
        collapsed ? "w-20" : "w-72"
      }`}
    >
      {/* Top Header / Logo */}
      <div className="h-16 flex items-center justify-between px-3.5 border-b border-[#abb5bb]/60 bg-[#f8f8f8]">
        <div
          className="group flex items-center gap-2.5 overflow-hidden text-left min-w-0"
          title="AI Innovation Evaluator"
        >
          <div className="bg-transparent border-0 p-0 flex items-center justify-center shrink-0">
            <span
              className="font-black text-2xl tracking-wider select-none text-transparent transition-colors duration-200 group-hover:text-[#d8421a]"
              style={{
                WebkitTextStroke: "1.75px #134c73",
              }}
            >
              AIIE
            </span>
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <div className="font-bold tracking-tight text-[#134c73] text-[13px] whitespace-nowrap">
                AI Innovation Evaluator
              </div>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          className="p-1.5 rounded-md text-[#58839a] hover:text-[#134c73] hover:bg-[#abb5bb]/30 transition-colors shrink-0 ml-1"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Main Content Area - Only "Ученически въпросници & екипи" button */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <button
          type="button"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all text-left border bg-[#134c73] text-[#f8f8f8] border-[#134c73] shadow-xs"
          title="Ученически въпросници & екипи"
        >
          <Users className="h-4 w-4 shrink-0 text-[#ca7552]" />
          {!collapsed && <span>Ученически въпросници & екипи</span>}
        </button>
      </div>

      {/* User Footer */}
      <div className="p-3 border-t border-[#abb5bb]/60 bg-[#f8f8f8]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="h-8 w-8 rounded-full border border-[#abb5bb] object-cover shrink-0"
            />
            {!collapsed && (
              <div className="truncate">
                <p className="text-xs font-semibold text-[#134c73] truncate">{currentUser.name}</p>
                <div className="flex items-center gap-1.5">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#d8421a]"></span>
                  <span className="text-[11px] text-[#58839a] font-semibold">{currentUser.role}</span>
                </div>
              </div>
            )}
          </div>
          {!collapsed && (
            <button
              type="button"
              onClick={onLogout}
              aria-label="Logout"
              className="p-1.5 rounded-md text-[#58839a] hover:text-[#d8421a] hover:bg-[#abb5bb]/30 transition-colors"
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
