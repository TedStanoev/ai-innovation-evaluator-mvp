# Multi-Agent Pipeline & Algorithmic Specification

This document serves as the technical context and implementation blueprint for the two-stage AI agent pipeline (`student_profiling_agent` and `team_formation_agent`). It is designed to be ingested by autonomous coding agents (e.g., Antigravity) to scaffold the server-side agent orchestration, structured output schemas, deterministic post-processing logic, and Firestore state streaming.

---

## 1. Pipeline Overview & Execution Architecture

The pipeline executes sequentially within the Node.js/Express backend (`server/src/agents/`), utilizing `@google/genai` with the **`gemini-3.8-flash`** model and Structured Outputs (`responseSchema`).

To guarantee mathematical precision and strict constraint satisfaction, each agent combines **LLM Semantic Extraction/Classification** with **Deterministic Algorithmic Execution**:

```
[ Raw Applicant Pool (N candidates) ]
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ AGENT 1: student_profiling_agent (Model: gemini-3.8-flash)              │
│ 1. Semantic Indexing: Evaluates raw profiles into 5 standardized scores │
│ 2. Deterministic Scoring: Computes Total Potential Score (TPS)          │
│ 3. Selection & Tie-Breaking: Sorts descending & slices Top K (e.g., 96) │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ (Selected Cohort: K = 96)
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ AGENT 2: team_formation_agent (Model: gemini-3.8-flash)                 │
│ 1. 4H Classification: Assigns Hacker, Hipster, Hustler, or Hound role   │
│ 2. Constrained Matrix Assembly: Builds M teams of 4 (Hard Constraints)  │
│ 3. TBI Audit & Rebalancing: Iterative role-preserving swaps (ΔTBI ≤ 15) │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
[ Firestore State Persistence & Real-Time UI Thought Stream ]
```

---

## 2. Agent 1: `student_profiling_agent`

* **Role:** Student Profiling & Selection Agent
* **Model:** `gemini-3.8-flash`
* **Objective:** Transform unstructured applicant submissions into standardized quantitative indices, compute composite potential, and select an unbiased top cohort.

### 2.1. Standardized Indexing Rubric (0–100 Scale)

The LLM evaluates each candidate's application data across five equally weighted dimensions ($20\%$ each), assigning an integer or floating-point score in the range $[0, 100]$ along with a brief justification trace:

1. **Academic Index ($AI$) — Weight: $20\%$**
   * Evaluates academic performance (GPA/grades), Olympiad participation, and academic competition achievements.
2. **Experience Index ($EI$) — Weight: $20\%$**
   * Evaluates hands-on practical experience, extracurricular clubs, personal/technical projects, and relevant hobbies.
3. **Initiative Index ($INI$) — Weight: $20\%$**
   * Evaluates proactivity, leadership moments, self-started initiatives, and demonstrated conflict-resolution skills.
4. **Entrepreneurial Index ($ENI$) — Weight: $20\%$**
   * Evaluates business acumen, commercial mindset, resource management, and value-creation orientation.
5. **Motivation Index ($MI$) — Weight: $20\%$**
   * Evaluates the depth of personal/career goals, alignment with the program, and intrinsic drive for growth.

### 2.2. Total Potential Score ($TPS$) Calculation

Once the five raw indices are extracted by `gemini-3.8-flash`, the system deterministically computes the Total Potential Score ($TPS \in [0, 100]$):

$$TPS = (0.20 \times AI) + (0.20 \times EI) + (0.20 \times INI) + (0.20 \times ENI) + (0.20 \times MI)$$

### 2.3. Selection, Tie-Breaking & Cutoff Logic

1. **Sorting:** All evaluated candidates are sorted in strict descending order by $TPS$.
2. **Tie-Breaker Rule:** If two or more candidates have an identical $TPS$ ($TPS_a = TPS_b$), priority is awarded to the candidate with the higher Motivation Index ($MI_a > MI_b$). If $MI$ is also tied, secondary fallback uses $INI$.
3. **Cohort Cutoff:** The sorted list is sliced to the target cohort size $K$ (default: $K = 96$, configurable per campaign). Candidates ranked $1 \dots K$ receive status `"selected"`; candidates $> K$ receive `"waitlisted"`.

### 2.4. Agent 1 Output Schema (`ProfilingResult`)

```typescript
export interface CandidateProfileScore {
  candidateId: string;
  fullName: string;
  departmentOrClass: string; // Required by Agent 2 for diversity constraints
  indices: {
    AI: number;  // 0-100
    EI: number;  // 0-100
    INI: number; // 0-100
    ENI: number; // 0-100
    MI: number;  // 0-100
  };
  tps: number; // Calculated deterministic weighted sum
  rationale: string; // Concise audit trail for UI Thought Inspector
  rank?: number;
  selected?: boolean;
}
```

---

## 3. Agent 2: `team_formation_agent`

* **Role:** Team Formation & Quality Control Agent
* **Model:** `gemini-3.8-flash`
* **Objective:** Classify selected participants into functional micro-roles, assemble balanced teams under strict structural constraints, and execute automated quality-control rebalancing.

### 3.1. Micro-Role Classification (4H Framework)

`gemini-3.8-flash` analyzes each selected participant's profile, experience, and index distribution to assign exactly one primary functional role from the **4H Framework**:

* **`Hacker`**: Technical execution, software engineering, system logic, data architecture, and prototyping.
* **`Hipster`**: UI/UX design, branding, marketing, user empathy, and product presentation.
* **`Hustler`**: Business modeling, sales strategy, market validation, pitching, and team leadership.
* **`Hound`**: Operations, deep research, logistics, compliance, and resource acquisition.

*(Note: To ensure feasible matrix assembly for $M = K / 4$ teams, the agent tracks role quotas of $M$ slots per role, utilizing secondary role affinities when borderline profiles exist.)*

### 3.2. Team Matrix Assembly & Hard Constraints

Given $K$ selected participants (e.g., $K = 96$), the agent assembles $M = K / 4$ teams (e.g., $24$ teams of $4$ members). Every team $T_j$ ($j \in \{1 \dots M\}$) must satisfy two **non-negotiable hard constraints**:

1. **Constraint 1 — Complete 4H Role Coverage:**
   Every team must contain exactly one member of each functional role:
   $$|T_j \cap \text{Hacker}| = 1, \quad |T_j \cap \text{Hipster}| = 1, \quad |T_j \cap \text{Hustler}| = 1, \quad |T_j \cap \text{Hound}| = 1$$

2. **Constraint 2 — Institutional Diversity Constraint:**
   No two members on the same team may belong to the same academic class, cohort, or department ($D$):
   $$\forall u, v \in T_j \text{ where } u \neq v \implies D(u) \neq D(v)$$

### 3.3. Team Balance Index ($TBI$) Monitoring & Automated Rebalancing

To prevent "super-teams" from gaining an unfair competitive advantage, Agent 2 computes the **Team Balance Index ($TBI_j \in [0, 100]$)** for each team $T_j$, combining:
* Mean team potential: $\overline{TPS}_j = \frac{1}{4} \sum_{u \in T_j} TPS(u)$
* Role coverage validity score ($R_j = 100$ when all 4H roles are satisfied)
* Department diversity score ($V_j = 100$ when all 4 departments are distinct)

$$TBI_j = (0.70 \times \overline{TPS}_j) + (0.15 \times R_j) + (0.15 \times V_j)$$

#### Self-Healing Rebalancing Algorithm (Swap Loop)

1. Identify the highest-scoring team $T_{max} = \arg\max_j (TBI_j)$ and lowest-scoring team $T_{min} = \arg\min_j (TBI_j)$.
2. Compute the imbalance spread:
   $$\Delta TBI = TBI_{max} - TBI_{min}$$
3. **Trigger Condition:** While $\Delta TBI > 15.0$ (up to a deterministic safety cap of `maxIterations = 100`):
   * Find a pair of participants $(u \in T_{max}, v \in T_{min})$ such that:
     * **Identical Role:** $\text{Role}(u) = \text{Role}(v)$
     * **Positive Potential Transfer:** $TPS(u) > TPS(v)$
     * **Diversity Preservation:** Swapping $u$ and $v$ does not violate Constraint 2 ($D(u) \notin D(T_{min} \setminus \{v\})$ and $D(v) \notin D(T_{max} \setminus \{u\})$).
   * Execute the swap ($T_{max} \leftrightarrow T_{min}$), log the rebalancing action to the Firestore `thoughtLogs` stream, and recalculate $TBI$ across all teams.

### 3.4. Agent 2 Output Schema (`TeamFormationResult`)

```typescript
export type Role4H = "Hacker" | "Hipster" | "Hustler" | "Hound";

export interface TeamMemberAssignment {
  candidateId: string;
  fullName: string;
  departmentOrClass: string;
  role4H: Role4H;
  tps: number;
  roleJustification: string;
}

export interface FormedTeam {
  teamId: string;
  teamLabel: string; // e.g., "Team 01"
  members: TeamMemberAssignment[]; // Always length 4
  averageTps: number;
  tbiScore: number;
  constraintsVerified: {
    hasAll4HRoles: boolean;
    hasUniqueDepartments: boolean;
  };
}

export interface TeamFormationResult {
  teams: FormedTeam[];
  auditMetrics: {
    initialMaxTbiSpread: number;
    finalMaxTbiSpread: number;
    swapsExecuted: number;
    swapHistory: Array<{
      iteration: number;
      roleSwapped: Role4H;
      fromTeam: string;
      toTeam: string;
      deltaTbiBefore: number;
      deltaTbiAfter: number;
    }>;
  };
}
```

---

## 4. Implementation Guidelines for Antigravity

When implementing this specification inside `/server`:

1. **File Organization:**
   * `server/src/agents/schemas.ts` — Zod / Gemini `Type` schemas enforcing strict JSON output from `gemini-3.8-flash`.
   * `server/src/agents/studentProfilingAgent.ts` — Batch/concurrent profiling calls + deterministic $TPS$ sorting & cutoff.
   * `server/src/agents/teamFormationAgent.ts` — 4H classification + constrained greedy/backtracking matrix builder + $TBI$ swap optimizer.
2. **Real-Time Thought Streaming:**
   * Emit granular progress updates to Firestore `thoughtLogs` at key milestones: batch indexing progress, cutoff threshold calculation, 4H role distribution counts, each $TBI$ swap iteration, and final equilibrium confirmation ($\Delta TBI \le 15$).
3. **Human-in-the-Loop Override:**
   * Store all formed teams in `"needs_review"` state upon completion so an administrator can inspect $TBI$ spreads, manually swap members if needed, or disqualify invalid entries before publishing final rosters.