/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useState } from "react";
import Sidebar from "./components/Sidebar";
import LoginView from "./components/LoginView";
import StudentTeamBuilderView from "./components/StudentTeamBuilderView";
import AIInspectorDrawer from "./components/AIInspectorDrawer";
import { currentUser, defaultContests } from "./data/mockStudents";
import { AgentThoughtDoc, EvaluationPipelineStatus } from "./types";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [activeContestId, setActiveContestId] = useState<string>(
    defaultContests[0]!.id
  );
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [pipelineStatus, setPipelineStatus] =
    useState<EvaluationPipelineStatus>("awaiting_confirmation");
  const [agentThoughts, setAgentThoughts] = useState<AgentThoughtDoc[]>([]);

  const activeContest =
    defaultContests.find((c) => c.id === activeContestId) ??
    defaultContests[0]!;

  const handleAgentStatusChange = useCallback(
    (status: EvaluationPipelineStatus, thoughts: AgentThoughtDoc[]) => {
      setPipelineStatus(status);
      setAgentThoughts(thoughts);
    },
    []
  );

  const handleAutoOpenInspector = useCallback(() => {
    setInspectorOpen(true);
  }, []);

  if (!isAuthenticated) {
    return (
      <LoginView
        onLoginSuccess={() => {
          setIsAuthenticated(true);
        }}
      />
    );
  }

  const isAgentActive =
    pipelineStatus === "profiling_participants" ||
    pipelineStatus === "forming_teams";

  return (
    <div className="relative flex h-screen bg-[#f1f6fc] text-[#0b1c30] overflow-hidden p-3.5 md:p-5 gap-4 md:gap-6">
      {/* Ambient Atmospheric Aurora Light Fields */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-28 left-1/4 w-[520px] h-[520px] rounded-full bg-sky-300/25 blur-3xl" />
        <div className="absolute top-1/3 -right-24 w-[480px] h-[480px] rounded-full bg-teal-300/20 blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 w-[560px] h-[560px] rounded-full bg-emerald-200/25 blur-3xl" />
      </div>

      {/* Left Sidebar (w-72 Acrylic Column) */}
      <Sidebar
        contests={defaultContests}
        activeContestId={activeContestId}
        onSelectContest={(contestId) => setActiveContestId(contestId)}
        inspectorOpen={inspectorOpen}
        onToggleInspector={() => setInspectorOpen((prev) => !prev)}
        isAgentActive={isAgentActive}
        thoughtsCount={agentThoughts.length || 15}
        currentUser={currentUser}
        onLogout={() => setIsAuthenticated(false)}
      />

      {/* Main Viewport */}
      <main className="relative z-10 flex-1 flex flex-col min-w-0 overflow-y-auto pr-1">
        <StudentTeamBuilderView
          activeContest={activeContest}
          onAgentStatusChange={handleAgentStatusChange}
          onAutoOpenInspector={handleAutoOpenInspector}
        />
      </main>

      {/* Right-Hand Slide-Over AI Thought Process Drawer */}
      <AIInspectorDrawer
        open={inspectorOpen}
        onClose={() => setInspectorOpen(false)}
        thoughts={agentThoughts}
        pipelineStatus={pipelineStatus}
      />
    </div>
  );
}
