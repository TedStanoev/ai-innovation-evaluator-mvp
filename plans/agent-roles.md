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
2. **Tie-Breaker Rule:** If two or more candidates have an identical $TPS$ ($TPS_a = TPS_b$), priority is awarded to the candidate with the higher Motivation Index ($MI_a > MI_b$).
3. **Cohort Cutoff:** The sorted list is sliced to the target cohort size $K$ (default: $K = 96$, configurable per campaign). Candidates ranked $1 \dots K$ receive `isSelected: true` and are passed along with the raw text of their 4 situational work-style answers (`situationalAnswers`) to Agent 2 (`team_formation_agent`).

### 2.4. Agent 1 Output Schema (`Agent1ProfilingOutput`)

```typescript
export interface SituationalAnswerItem {
  roleTag: "hacker" | "hipster" | "hustler" | "hound";
  rawText: string;
}

export interface Agent1EvaluatedCandidate {
  participantId: string;
  questionnaireId: string;
  fullName: string;
  schoolOrOrganization: string;
  gradeOrPosition: string;
  indices: {
    AI: number;  // ((GPA - 3) / 3) * 100
    EI: number;  // 0->0, 1->25, 2->50, 3->75, >=4->100
    MI: number;  // (Score - 1) * 25
    INI: number; // (Score - 1) * 25
    ENI: number; // (Score - 1) * 25
  };
  tps: number; // (0.20 * AI) + (0.20 * EI) + (0.20 * INI) + (0.20 * ENI) + (0.20 * MI)
  rank: number;
  isSelected: boolean;
  situationalAnswers: {
    q1_teamStrength: SituationalAnswerItem;
    q2_deadlineFocus: SituationalAnswerItem;
    q3_challengeType: SituationalAnswerItem;
    q4_communicationStyle: SituationalAnswerItem;
  };
}

export interface Agent1ProfilingOutput {
  targetCohortSize: number;
  totalEvaluated: number;
  selectedCount: number;
  selectedCandidates: Agent1EvaluatedCandidate[];
  allCandidatesRanked: Agent1EvaluatedCandidate[];
}
```

---

## 3. Agent 2: `team_formation_agent`

* **Role:** Team Formation & Quality Control Agent
* **Model:** `gemini-3.8-flash`
* **Objective:** Classify selected participants into functional micro-roles, assemble balanced teams under strict structural constraints, and execute automated quality-control rebalancing.

### 3.1. Micro-Role Classification (4H Framework)

`gemini-3.8-flash` analyzes each selected participant's 4 situational work-style answers (`q1_teamStrength`, `q2_deadlineFocus`, `q3_challengeType`, `q4_communicationStyle`) to assign exactly one primary functional role from the **4H Framework** based on the majority of their answers:

* **`Hacker`**: Technical execution, building solutions, logic, programming, testing functionality, technical facts.
* **`Hipster`**: UI/UX design, visual identity, user experience, aesthetics, metaphors, creativity.
* **`Hustler`**: Sales, business strategy, negotiations, pitching, finding real clients, confident persuasion.
* **`Hound`**: Process structuring, task planning, deadlines, final compliance checks, organizing systems.

* **Role Tie-Breaker Rule:** If a candidate has an equal number of votes for two or more roles, assign the role that currently has the **greatest shortage (fewest assigned candidates)** in the overall candidate pool.

### 3.2. Team Matrix Assembly & Hard Constraints

Given $K$ selected participants (e.g., $K = 96$), the agent assembles $M = K / 4$ teams of $4$ members. Every team $T_j$ ($j \in \{1 \dots M\}$) must satisfy two **strict constraints**:

1. **Constraint 1 — Complete 4H Role Coverage:**
   Every team must contain exactly one member of each functional role:
   $$|T_j \cap \text{Hacker}| = 1, \quad |T_j \cap \text{Hipster}| = 1, \quad |T_j \cap \text{Hustler}| = 1, \quad |T_j \cap \text{Hound}| = 1$$

2. **Constraint 2 — Institutional & Class Diversity Constraint:**
   No two members on the same team may belong to the same school/organization (`schoolOrOrganization`) or the same academic class (`gradeOrPosition`), unless mathematically unavoidable.

### 3.3. Team Balance Index ($TBI$) Monitoring & Automated Rebalancing

To guarantee competitive fairness across teams, Agent 2 computes the **Team Balance Index ($TBI_j \in [0, 100]$)** for each team $T_j$ as the **arithmetic mean of the 4 team members' TPS scores**:

$$TBI_j = \overline{TPS}_j = \frac{1}{4} \sum_{u \in T_j} TPS(u)$$

#### Self-Healing Rebalancing Algorithm (Swap Loop)

1. Identify the highest-scoring team $T_{max} = \arg\max_j (TBI_j)$ and lowest-scoring team $T_{min} = \arg\min_j (TBI_j)$.
2. Compute the imbalance spread:
   $$\Delta TBI = TBI_{max} - TBI_{min}$$
3. **Trigger Condition:** While $\Delta TBI > 15.0$:
   * Swap one member $u \in T_{max}$ with a member $v \in T_{min}$ who holds the **exact same 4H role** ($\text{Role}(u) = \text{Role}(v)$ and $TPS(u) > TPS(v)$) to equalize their average $TBI$ values while respecting the diversity constraint whenever possible.
4. Repeat the automated audit and swaps until the maximum difference between any two teams is $\le 15.0$ points (or the smallest mathematically achievable difference is reached).

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