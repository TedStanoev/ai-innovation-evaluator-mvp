/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import LoginView from "./components/LoginView";
import StudentTeamBuilderView from "./components/StudentTeamBuilderView";
import { currentUser } from "./data/mockStudents";
import { fetchBackendHealth, BackendAgentInfo } from "./utils/api";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [backendConnected, setBackendConnected] = useState<boolean>(false);
  const [backendAgents, setBackendAgents] = useState<BackendAgentInfo[]>([]);

  useEffect(() => {
    fetchBackendHealth()
      .then((data) => {
        setBackendConnected(data.status === "ok");
        setBackendAgents(data.agents || []);
      })
      .catch(() => {
        setBackendConnected(false);
      });
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

  return (
    <div className="flex h-screen bg-[#f8f8f8] text-[#134c73] overflow-hidden font-sans">
      {/* Collapsible Left Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        currentUser={currentUser}
        onLogout={() => setIsAuthenticated(false)}
      />

      {/* Main Canvas Viewport - Student Team Builder Page */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <div className="min-h-full flex flex-col">
          {/* Sticky Header */}
          <header className="sticky top-0 z-20 border-b border-[#abb5bb]/60 bg-white px-6 md:px-8 py-3.5 shadow-2xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <h1 className="text-lg md:text-xl font-bold text-[#134c73] tracking-tight">
                  Ученически въпросници & екипи
                </h1>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#ca7552]/15 text-[#d8421a] border border-[#ca7552]/40">
                  AI Talent Discovery
                </span>
              </div>

              {/* Backend Status Indicator */}
              <div className="flex items-center gap-2.5 self-start md:self-auto">
                <span
                  title={
                    backendConnected
                      ? `Connected to Express ADK server (${backendAgents.map((a) => a.name).join(", ")})`
                      : "Backend server offline"
                  }
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium border ${
                    backendConnected
                      ? "bg-[#134c73]/10 text-[#134c73] border-[#58839a]/40"
                      : "bg-[#ca7552]/15 text-[#d8421a] border-[#ca7552]/40"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      backendConnected ? "bg-[#134c73]" : "bg-[#d8421a]"
                    }`}
                  />
                  <span>
                    {backendConnected
                      ? `ADK Backend (${backendAgents.length || 2} Agents)`
                      : "ADK Backend Offline"}
                  </span>
                </span>
              </div>
            </div>
          </header>

          {/* Student Team Builder Body */}
          <div className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
            <StudentTeamBuilderView />
          </div>
        </div>
      </main>
    </div>
  );
}
