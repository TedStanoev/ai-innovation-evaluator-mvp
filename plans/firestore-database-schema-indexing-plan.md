# AIIE – Firestore Database Schema & Indexing Plan

This document defines the NoSQL data architecture, collection schemas, TypeScript interfaces, data transformation rules, and composite indexing strategy for **AI Innovation Evaluator (AIIE)** on Cloud Firestore.

The schema is optimized for real-time reactive UI updates (`onSnapshot`), strict separation between raw user submissions and AI-generated profiles, and Human-in-the-Loop (HITL) team verification.

---

## 1. Entity Relationship & Collection Hierarchy

```text
evaluations/{evaluationId}               <-- Master session / campaign aggregator
 ├── questionnaires/{questionnaireId}     <-- Raw immutable form submissions
 ├── participants/{participantId}        <-- Candidate profiles (role: null -> populated by Agent 1)
 ├── teams/{teamId}                      <-- Assembled 4-member rosters (status: unconfirmed -> confirmed)
 └── agent_thoughts/{thoughtId}          <-- Append-only real-time reasoning stream
```

---

## 2. Collection Schemas & TypeScript Interfaces

### 2.1. Collection: `participants`
Stores core participant identity and academic metadata. Upon initial registration, the `role` field is strictly initialized to `null`. Once `student_profiling_agent` processes the linked questionnaire, it atomically updates `role` with the computed indices, $TPS$, and assigned 4H micro-role.

* **Document Path:** `participants/{participantId}`

```typescript
export type Role4HId = 'hacker' | 'hipster' | 'hustler' | 'hound';
export type Role4HName = 'Hacker' | 'Hipster' | 'Hustler' | 'Hound';

export interface ParticipantRoleProfile {
  roleId: Role4HId;
  roleName: Role4HName;
  roleVoteBreakdown: {
    hacker: number;  // Count of Hacker choices (0-4)
    hipster: number; // Count of Hipster choices (0-4)
    hustler: number; // Count of Hustler choices (0-4)
    hound: number;   // Count of Hound choices (0-4)
  };
  indices: {
    AI: number;  // Academic Index (0-100)
    EI: number;  // Experience Index (0-100)
    INI: number; // Initiative Index (0-100)
    ENI: number; // Entrepreneurial Index (0-100)
    MI: number;  // Motivation Index (0-100)
  };
  tps: number;   // Total Potential Score: 0.20 * (AI + EI + INI + ENI + MI)
}

export interface ParticipantDoc {
  id: string;
  evaluationId: string;
  fullName: string;
  email: string;
  schoolOrOrganization: string; // Used for institutional diversity checks
  gradeOrPosition: string;      // Used for cohort/class diversity checks
  questionnaireId: string;      // Foreign key reference to `questionnaires/{id}`
  isSelected: boolean;          // True if within Top-K cutoff (e.g., Top 96)
  selectionRank: number | null; // 1-based descending rank by TPS
  role: ParticipantRoleProfile | null; // Initialized as `null`; populated by Agent 1
  createdAt: string;            // ISO 8601 Timestamp
  updatedAt: string;            // ISO 8601 Timestamp
}
```

---

### 2.2. Collection: questionnaires
Stores the immutable raw responses submitted by candidates across all three sections of the intake questionnaire.

* **Document Path:** `questionnaires/{questionnaireId}`

```typescript
export interface QuestionnaireDoc {
  id: string;
  evaluationId: string;
  participantId: string;
  submittedAt: string; // ISO 8601 Timestamp

  // Part 1: General Identification (Unscored)
  generalInfo: {
    fullName: string;
    schoolOrOrganization: string;
    gradeOrPosition: string;
  };

  // Part 2: Candidate Profile Metrics
  profileMetrics: {
    // Section A: Quantitative Inputs
    gpa: number;                  // Q1 (AI): Academic GPA (3.00 to 6.00)
    extracurricularCount: number; // Q2 (EI): Integer count of projects/competitions (0, 1, 2, 3, 4+)

    // Section B: Qualitative Situational Inputs (Raw 1-5 scale)
    motivationScoreRaw: 1 | 2 | 3 | 4 | 5;      // Q3 (MI)
    initiativeScoreRaw: 1 | 2 | 3 | 4 | 5;      // Q4 (INI)
    entrepreneurialScoreRaw: 1 | 2 | 3 | 4 | 5; // Q5 (ENI)
  };

  // Part 3: 4H Micro-Role Situational Choices (Hidden role tags mapped on submission)
  roleAssessmentAnswers: {
    q1_teamStrength: Role4HId;
    q2_deadlineFocus: Role4HId;
    q3_challengeType: Role4HId;
    q4_communicationStyle: Role4HId;
  };
}
```

#### Questionnaire-to-Index Conversion Rules (for `student_profiling_agent`)
* **Academic Index ($AI$):** Linear normalization of GPA $[3.00, 6.00] \rightarrow [0, 100]$:
  $$AI = \text{round}\left(\frac{\text{GPA} - 3.00}{3.00} \times 100\right)$$
* **Experience Index ($EI$):** Step-scaling of extracurricular count:
  * `0` $\rightarrow 0$ pts | `1` $\rightarrow 25$ pts | `2` $\rightarrow 50$ pts | `3` $\rightarrow 75$ pts | `>= 4` $\rightarrow 100$ pts
* **Qualitative Indices ($MI, INI, ENI$):** Linear scaling from $[1, 5] \rightarrow [0, 100]$ (or $[20, 100]$):
  $$\text{Index} = (\text{RawScore} - 1) \times 25$$
* **4H Role Resolution:** Majority vote across `q1`–`q4`. In case of a 2–2 tie, the agent resolves the primary role using semantic alignment with the candidate's highest qualitative/quantitative indices.

---

### 2.3. Collection: `teams`
Stores the balanced 4-person rosters generated by `team_formation_agent`. Each document embeds denormalized copies of the `members` (matching the `participants` schema) so the frontend can render complete team cards and audit metrics in a single read.

* **Document Path:** `teams/{teamId}`

```typescript
export interface TeamMemberSnapshot {
  participantId: string;
  fullName: string;
  email: string;
  schoolOrOrganization: string;
  gradeOrPosition: string;
  questionnaireId: string;
  role: ParticipantRoleProfile; // Guaranteed non-null for assigned team members
}

export interface TeamDoc {
  id: string;
  evaluationId: string;
  name: string;                        // e.g., "Team 01"
  status: 'unconfirmed' | 'confirmed'; // Controlled by Human-in-the-Loop Admin

  // Quantitative Quality & Balance Metrics
  compatibilityPercentage: number;     // Overall synergy & compatibility score (0-100)
  roleBalance: {
    isComplete4H: boolean;             // True iff Hacker=1, Hipster=1, Hustler=1, Hound=1
    hackerCount: number;
    hipsterCount: number;
    hustlerCount: number;
    houndCount: number;
  };
  averageTPS: number;                  // Arithmetic mean of the 4 members' TPS
  diversityScore: number;              // Institutional/class uniqueness score (0-100)
  teamBalanceIndex: number;            // Composite TBI metric used for swap optimization

  // Agent Explanation & Roster
  formationExplanation: string;        // Concise rationale explaining why these 4 profiles complement each other
  members: TeamMemberSnapshot[];       // Full participant objects (length = 4)

  // Human-in-the-Loop Audit Trail
  confirmedBy: string | null;          // Admin UID or email
  confirmedAt: string | null;          // ISO 8601 Timestamp
  createdAt: string;                   // ISO 8601 Timestamp
}
```

---

### 2.4. Collection: `evaluations`
The central orchestration document uniting participants, formed teams, and agent reasoning streams for a given evaluation run. Subscribed to by the main dashboard header to track global progress.

* **Document Path:** `evaluations/{evaluationId}`

```typescript
export type EvaluationPipelineStatus =
  | 'idle'
  | 'profiling_participants'
  | 'forming_teams'
  | 'awaiting_confirmation'
  | 'completed'
  | 'error';

export interface EvaluationDoc {
  id: string;
  title: string;
  status: EvaluationPipelineStatus;

  // Execution Parameters
  config: {
    targetCohortSize: number; // e.g., 96
    teamSize: number;         // e.g., 4
    maxTbiSpread: number;     // e.g., 15.0 points
  };

  // Unified Entity References
  participantIds: string[];
  teamIds: string[];
  recentThoughtIds: string[]; // Rolling buffer of latest thought document IDs

  // Real-Time Aggregated Telemetry
  metrics: {
    totalParticipants: number;
    profiledParticipants: number;
    selectedParticipants: number;
    totalTeamsFormed: number;
    confirmedTeamsCount: number;
    averageCohortTPS: number;
    currentTbiSpread: number; // TBI_max - TBI_min
  };

  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}
```

---

### 2.5. Collection: `agent_thoughts`
An append-only event stream capturing granular reasoning steps, scoring calculations, and TBI rebalancing swaps. Powers the real-time **AI Thought Inspector** drawer in the UI.

* **Document Path:** `agent_thoughts/{thoughtId}`

```typescript
export interface AgentThoughtDoc {
  id: string;
  evaluationId: string;
  agentName: 'student_profiling_agent' | 'team_formation_agent' | 'system';
  phase:
    | 'ingestion'
    | 'indexing'
    | 'selection_cutoff'
    | 'role_classification'
    | 'matrix_assembly'
    | 'tbi_swap'
    | 'completed';
  message: string; // Human-readable log entry for the UI stream
  metadata?: {
    participantIds?: string[];
    teamIds?: string[];
    tbiDeltaBefore?: number;
    tbiDeltaAfter?: number;
  };
  sequenceNumber: number; // Monotonically increasing integer for deterministic ordering
  timestamp: string;      // ISO 8601 Timestamp
}
```

---

## 3. Firestore Composite Index Recommendations

Cloud Firestore requires composite indexes whenever a query combines equality filters (`==`) with range filters or `orderBy` clauses on different fields.

Create a `firestore.indexes.json` file in your Firebase project root and deploy it via `firebase deploy --only firestore:indexes`:

```json
{
  "indexes": [
    {
      "collectionGroup": "participants",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "evaluationId", "order": "ASCENDING" },
        { "fieldPath": "role.tps", "order": "DESCENDING" },
        { "fieldPath": "role.indices.MI", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "participants",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "evaluationId", "order": "ASCENDING" },
        { "fieldPath": "isSelected", "order": "ASCENDING" },
        { "fieldPath": "role.roleId", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "teams",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "evaluationId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "teamBalanceIndex", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "agent_thoughts",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "evaluationId", "order": "ASCENDING" },
        { "fieldPath": "sequenceNumber", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "questionnaires",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "evaluationId", "order": "ASCENDING" },
        { "fieldPath": "submittedAt", "order": "DESCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

### Why Each Index is Required
1. **`participants` (`evaluationId` + `role.tps` DESC + `role.indices.MI` DESC):** Directly supports Agent 1's descending selection sort and automatic Motivation Index ($MI$) tie-breaking without loading the entire collection into memory unsorted.
2. **`participants` (`evaluationId` + `isSelected` + `role.roleId`):** Enables fast filtering of the selected cohort (e.g., Top 96) grouped by 4H role quotas (`hacker`, `hipster`, `hustler`, `hound`) for Agent 2.
3. **`teams` (`evaluationId` + `status` + `teamBalanceIndex` DESC):** Allows the admin dashboard to filter `"unconfirmed"` vs. `"confirmed"` rosters while ordering teams by $TBI$ to inspect top and bottom balance spreads.
4. **`agent_thoughts` (`evaluationId` + `sequenceNumber` ASC):** Guarantees strict chronological ordering of streaming thoughts in the frontend `onSnapshot` listener, preventing out-of-order UI rendering when multiple writes occur within the same millisecond.
5. **`questionnaires` (`evaluationId` + `submittedAt` DESC):** Supports chronological browsing of raw participant submissions in the admin archive.