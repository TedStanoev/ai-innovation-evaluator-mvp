import React, { useEffect, useRef } from "react";
import { X, RotateCw, Terminal, CheckCircle2, Sparkles, Bot } from "lucide-react";
import { AgentThoughtDoc, EvaluationPipelineStatus } from "../types";

interface AIInspectorDrawerProps {
  open: boolean;
  onClose: () => void;
  thoughts: AgentThoughtDoc[];
  pipelineStatus: EvaluationPipelineStatus;
}

export default function AIInspectorDrawer({
  open,
  onClose,
  thoughts,
  pipelineStatus,
}: AIInspectorDrawerProps) {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const isRunning =
    pipelineStatus === "profiling_participants" ||
    pipelineStatus === "forming_teams";

  useEffect(() => {
    if (open && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop =
        scrollContainerRef.current.scrollHeight;
    }
  }, [thoughts.length, open, isRunning]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end pointer-events-none p-3.5 md:p-5">
      {/* Subtle backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/20 backdrop-blur-[2px] pointer-events-auto transition-opacity"
      />

      {/* Right Slide-Over Acrylic Panel */}
      <aside
        aria-label="AI Thought Process Drawer"
        className="relative w-full max-w-md rounded-3xl plate-acrylic flex flex-col h-full pointer-events-auto z-10 overflow-hidden"
      >
        {/* Top Accent Trim */}
        <div className="h-1.5 w-full bg-gradient-to-r from-sky-400 via-teal-500 to-emerald-400 shrink-0" />

        {/* Drawer Header */}
        <div className="px-5 py-4 border-b border-slate-200/70 flex items-center justify-between bg-white/60">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-sky-400 via-cyan-500 to-teal-500 flex items-center justify-center text-white shadow-[0_6px_14px_-3px_rgba(13,148,136,0.45)]">
              <Bot className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-extrabold text-[#0b1c30]">
                  AI Inspector
                </h2>
                {isRunning ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-[#0d9488] border border-teal-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#0d9488] animate-ping" />
                    Агентите работят
                  </span>
                ) : thoughts.length > 0 ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="h-3 w-3" />
                    Готово
                  </span>
                ) : null}
              </div>
              <p className="text-[11px] text-slate-500">
                Поток на мислите в реално време (Firestore: agent_thoughts)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Затвори AI Inspector"
            className="p-1.5 rounded-xl text-slate-400 hover:text-[#0b1c30] hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Agent Pipeline Legend */}
        <div className="px-5 py-2.5 border-b border-slate-200/70 bg-white/80 flex items-center justify-between text-[11px] text-slate-600">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 font-bold text-sky-700">
              <span className="h-2 w-2 rounded-full bg-sky-500" />
              student_profiling_agent
            </span>
            <span className="inline-flex items-center gap-1.5 font-bold text-[#0d9488]">
              <span className="h-2 w-2 rounded-full bg-[#0d9488]" />
              team_formation_agent
            </span>
          </div>
          <span className="font-mono font-extrabold text-[#0b1c30]">
            {thoughts.length} стъпки
          </span>
        </div>

        {/* Thought Stream Body */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-2.5 bg-slate-50/50"
        >
          {thoughts.length === 0 && !isRunning ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
              <div className="h-12 w-12 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center mb-3 text-[#0d9488]">
                <Terminal className="h-6 w-6" />
              </div>
              <p className="text-xs font-bold text-[#0b1c30]">
                Все още няма записани AI стъпки
              </p>
              <p className="text-[11px] text-slate-500 mt-1 max-w-xs">
                Натиснете бутона „Профилирай“ в таб „Участници“, за да стартирате двуфазния агентски пайплайн.
              </p>
            </div>
          ) : (
            thoughts.map((thought) => {
              const isAgent1 =
                thought.agentName === "student_profiling_agent";
              const isAgent2 = thought.agentName === "team_formation_agent";

              return (
                <div
                  key={thought.id}
                  className="rounded-2xl bg-white/95 border border-slate-200/80 p-3.5 shadow-2xs space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                        isAgent1
                          ? "bg-sky-50 text-sky-700 border-sky-200"
                          : isAgent2
                          ? "bg-teal-50 text-[#0d9488] border-teal-200"
                          : "bg-emerald-50 text-emerald-700 border-emerald-200"
                      }`}
                    >
                      <Sparkles className="h-2.5 w-2.5" />
                      #{thought.sequenceNumber} • {thought.agentName}
                    </span>

                    <span className="text-[10px] font-mono text-slate-400">
                      {thought.timestamp.slice(11, 19)}
                    </span>
                  </div>

                  <div className="text-[11px] font-mono font-bold text-[#0d9488]">
                    ▶ [{thought.phase}]
                  </div>

                  <p className="text-xs text-[#0b1c30] leading-relaxed">
                    {thought.message}
                  </p>
                </div>
              );
            })
          )}

          {isRunning && (
            <div className="rounded-2xl bg-teal-50/90 border border-teal-200 p-3.5 flex items-center gap-3 text-xs text-[#0d9488] font-bold shadow-2xs">
              <RotateCw className="h-4 w-4 text-[#0d9488] animate-spin shrink-0" />
              <span>
                {pipelineStatus === "profiling_participants"
                  ? "student_profiling_agent изчислява индексите и 4H ролите..."
                  : "team_formation_agent формира и балансира 4H отборите..."}
              </span>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
