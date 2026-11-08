# AIIE (AI Innovation Evaluator) – Technical System Architecture & Software Design

This specification defines the domain-agnostic software architecture, component topology, asynchronous execution patterns, and data synchronization layer for the **AI Innovation Evaluator (AIIE)** platform.

---

## 1. System Topology & Architectural Philosophy

AIIE is structured as a **distributed, decoupled system** designed for processing, analyzing, and evaluating heterogeneous submitted packages (documents, links, media, and source archives). 

The platform implements an **asynchronous, reactive pattern**: time-intensive AI operations are isolated within background worker threads on a stateless container service, while state synchronization is offloaded to a managed reactive database.

```
+-------------------------------------------------------------------------------+
|                           GOOGLE CLOUD ECOSYSTEM                              |
+-------------------------------------------------------------------------------+
                                        |
     +------------------------------+   |   +--------------------------------+
     |       FRONTEND CLIENT        |   |   |        BACKEND SERVICE         |
     |      (Firebase Hosting)      |   |   |       (Google Cloud Run)       |
     |                              |   |   |                                |
     |  • React (Vite SPA)          |   |   |  • Node.js / Express (TS)      |
     |  • Tailwind CSS + shadcn/ui  |   |   |  • Google Gen AI SDK           |
     |  • Firestore Client SDK      |   |   |  • Firebase Admin SDK          |
     +--------------+---------------+   |   +---------------+----------------+
                    |                   |                   |
                    | 1. POST /start    |                   |
                    +-------------------+------------------>|
                    |    (HTTP 202)                         |
                    |<--------------------------------------+
                    |                                       |
                    |           +---------------+           |
                    |           |   DATABASE    |           |
                    |           |  (Firestore)  |           |
                    | 3. Live   |               | 2. Stream |
                    | Stream    | • Contests    | updates   |
                    |<==========| • Submissions |<==========+
                    | (WS sync) | • Logs        |
                    |           +---------------+
                    |
           +--------v--------+
           |  Human Review / |
           |  HITL Operator  |
           +-----------------+
```

---

## 2. Component Breakdown & Stack Specifications

### 2.1. Client Presentation Tier (`/client`)
- **Technology Stack:** Vite, React 18+, TypeScript, Tailwind CSS, shadcn/ui component primitives.
- **Hosting Target:** **Firebase Hosting** (Edge CDN distribution, instant static asset delivery, zero cold start).
- **Core Architectural Role:**
  - Administrative Single-Page Application (SPA).
  - Subscribes directly to real-time database streams via native client SDK (`onSnapshot`).
  - Decoupled from AI computation: never awaits long-running evaluation cycles directly over HTTP.
  - Visualizes real-time reasoning traces via an **AI Thought Process Inspector** drawer.

### 2.2. Server Execution Tier (`/server`)
- **Technology Stack:** Node.js 20+, Express, TypeScript, `@google/genai` (Google Gen AI SDK), `firebase-admin`.
- **Hosting Target:** **Google Cloud Run** (Stateless container runtime).
- **Runtime Configuration:**
  - Must run with `--no-cpu-throttling` ("CPU always allocated"). This guarantees the container event loop is never throttled after returning initial HTTP responses, enabling background agent execution to run without interruption.
- **Core Architectural Role:**
  - Secure custodian of external API secrets and service account credentials.
  - Exposes REST triggers for starting assessments and recording administrative actions.
  - Executes the sequential multi-agent pipeline asynchronously.
  - Persists atomic intermediate execution logs and evaluation results to the database.

### 2.3. Reactive Event & State Synchronization Tier
- **Technology:** Cloud Firestore (Native Mode).
- **Core Architectural Role:**
  - Serves as the system-wide event bus and unified source of truth.
  - Eliminates the complexity of maintaining dedicated WebSocket servers (e.g., Socket.io, Redis Pub/Sub) by utilizing native persistent duplex connections to client applications.

---

## 3. Decoupled Multi-Agent Evaluation Engine

The processing pipeline isolates **analysis** from **evaluation**, introducing an explicit separation of concerns followed by a mandatory administrative control checkpoint.

```
       [ Submission Artifacts: Documents, Media, Code Archives, External URLs ]
                                          │
                                          ▼
    ┌────────────────────────────────────────────────────────────────────────┐
    │ AGENT 1: "Analyzer"                                                   │
    │ Role: Ingestion, Validation, Extraction & Discrepancy Detection        │
    │ • Verifies deliverable completeness against configuration rules.       │
    │ • Parses unstructured inputs (text, tables, metadata).                │
    │ • Extracts factual assertions, structural metrics, and evidence.       │
    │ • Flags inconsistencies, missing dependencies, or anomalous content.   │
    │ Output: Normalized Analysis JSON Schema.                               │
    └─────────────────────────────────────┬──────────────────────────────────┘
                                          │
                                          ▼
    ┌────────────────────────────────────────────────────────────────────────┐
    │ AGENT 2: "Evaluator"                                                   │
    │ Role: Scoring, Synthesis, Feedback & Advisory Formulation              │
    │ • Ingests normalized findings from Agent 1.                            │
    │ • Evaluates findings against active rubric criteria and weightings.    │
    │ • Computes numeric scores and qualitative performance assessments.     │
    │ • Generates targeted feedback, identified risks, and recommendations.  │
    │ Output: Scored Evaluation Schema with breakdown and summary letter.    │
    └─────────────────────────────────────┬──────────────────────────────────┘
                                          │
                                          ▼
    ┌────────────────────────────────────────────────────────────────────────┐
    │ 🔴 HUMAN-IN-THE-LOOP (HITL) GATEKEEPER                                 │
    │ Role: Administrative Governance, Verification & Override               │
    │ • Validates transparent reasoning logs and agent outputs.              │
    │ • Allows manual score calibration and adjustments.                     │
    │ • Execution Actions:                                                   │
    │     [ Approve Score ] ──► Confirms scores and commits to rankings.     │
    │     [ Disqualify ]    ──► Manual-only override with mandatory reason.  │
    └────────────────────────────────────────────────────────────────────────┘
```

### Safety and Policy Invariant
> **Strict Governance Principle:** AI agents operate strictly in an advisory capacity. Agents **cannot** set a submission's status to `"disqualified"`. That state is exclusively accessible via manual administrative intervention (e.g., upon finding plagiarism, invalid assets, or terms-of-service violations).

---

## 4. Asynchronous Communication Lifecycle

To ensure optimal UX and prevent socket drops, all AI operations follow a **Fire-and-Forget + Reactive Stream** pattern:

```
[ Client (Vite) ]                                [ Cloud Run (Express) ]              [ Firestore ]
        │                                                   │                               │
        │─── 1. POST /api/evaluations/start (submissionId) ─►│                               │
        │                                                   │─── 2. update({ status: 'analyzing' }) ─►│
        │◄── 3. HTTP 202 Accepted { ok: true } (immediate) ─│                               │
        │                                                   │                               │
        │    (HTTP socket closes in ~50ms; UI never blocks) │                               │
        │                                                   │                               ▼
        │─── 4. onSnapshot('submissions/{id}') ─────────────┼───────────────────────────────┤ (Reactive Stream)
        │                                                   │                               │
        │                                                   │── 5. Agent 1: "Analyzer" runs │
        │                                                   │   update({ logs: [...], ... })────────►│
        │◄── 6. Live updates delivered to UI via Firestore ─┼───────────────────────────────┤
        │                                                   │                               │
        │                                                   │── 7. Agent 2: "Evaluator" runs│
        │                                                   │   update({ status: 'needs_review' }) ──►│
        │◄── 8. UI renders proposed score and actions ──────┼───────────────────────────────┤
```

### Execution Phases:
1. **Trigger:** The client issues an authenticated `POST /api/evaluations/start`.
2. **Immediate Acknowledgment:** The server updates the submission state to `"analyzing"`, dispatches an asynchronous background task, and returns `HTTP 202 Accepted` within ~50ms.
3. **Reactive Streaming:** The client establishes or maintains a Firestore `onSnapshot` listener on the target submission document.
4. **Analyzer Execution:** Agent 1 parses incoming assets, writes reasoning steps to the `thoughtLogs` array, and saves intermediate analysis data.
5. **Evaluator Execution:** Agent 2 consumes the analysis, calculates rubric points, populates feedback payloads, and transitions document status to `"needs_review"`.
6. **Human-in-the-Loop Action:** The reviewer evaluates the outputs and submits an approval or status override via `POST /api/evaluations/override`.

---

## 5. Generic Data Schema Design (Firestore)

The data model is decoupled from any specific competition domain, modeling items as generic campaigns, deliverables, and evaluation passes.

### 5.1. Collection: `contests` (or `campaigns`)
Defines the parameters, timelines, and grading criteria configuration.

```json
{
  "id": "campaign-2026-q1",
  "title": "Innovation Contest Edition 2026",
  "status": "active",
  "timeline": {
    "submissionDeadline": "2026-03-31T23:59:00Z",
    "evaluationWindowEnd": "2026-04-05T23:59:00Z",
    "announcementDate": "2026-04-10T10:00:00Z"
  },
  "evaluationRubric": [
    {
      "criteriaId": "crit_structural_validity",
      "name": "Structural & Methodological Validity",
      "maxPoints": 25,
      "description": "Verification of core functional components and completeness."
    },
    {
      "criteriaId": "crit_innovation_depth",
      "name": "Innovation Depth & Architecture",
      "maxPoints": 35,
      "description": "Originality, technical architecture, and orchestration design."
    },
    {
      "criteriaId": "crit_market_viability",
      "name": "Feasibility & Target Validation",
      "maxPoints": 20,
      "description": "Validation evidence, user feedback, and economic logic."
    },
    {
      "criteriaId": "crit_execution_ethics",
      "name": "Execution Quality & Compliance",
      "maxPoints": 20,
      "description": "Operational timeline, budget sanity, and regulatory/data safety."
    }
  ],
  "maxTotalScore": 100
}
```

### 5.2. Collection: `submissions`
Tracks team inputs, delivery artifacts, agent reasoning traces, and audit history.

```json
{
  "id": "sub-uuid-9876",
  "contestId": "campaign-2026-q1",
  "entityName": "Project Vanguard",
  "title": "Distributed Autonomous Ingestion Engine",
  "status": "needs_review",
  "totalScore": 86.5,
  "adminRemarks": null,
  "disqualificationReason": null,
  "submittedAt": "2026-03-30T14:00:00Z",
  "updatedAt": "2026-03-30T14:02:15Z",

  "artifacts": {
    "primaryDocument": { "type": "file", "url": "gs://bucket/doc.pdf", "name": "Documentation.pdf" },
    "presentation": { "type": "file", "url": "gs://bucket/deck.pdf", "name": "Deck.pdf" },
    "demonstrationMedia": { "type": "link", "url": "https://youtu.be/sample-video", "name": "Video Demo" },
    "codeRepository": { "type": "link", "url": "https://github.com/org/repo", "name": "Repository" },
    "supplementaryFile": { "type": "file", "url": "gs://bucket/supp.pdf", "name": "Appendix.pdf" }
  },

  "evaluationData": {
    "analyzer": {
      "status": "completed",
      "extractedFacts": [
        "Identified 4 functional architectural components in repository index.",
        "Detected 8 recorded stakeholder interviews within appendix references.",
        "Confirmed compliance policy assertions regarding customer privacy."
      ],
      "discrepancies": []
    },
    "evaluator": {
      "status": "completed",
      "rubricScores": {
        "crit_structural_validity": 23,
        "crit_innovation_depth": 31,
        "crit_market_viability": 16.5,
        "crit_execution_ethics": 16
      },
      "identifiedStrengths": [
        "Well-documented interface boundaries and clean component decoupling.",
        "Concrete validation data with empirical feedback samples."
      ],
      "identifiedRisks": [
        "Runtime costs in execution schedule appear underestimated by ~40%."
      ],
      "recommendedAction": "Advance to Stage 2",
      "feedbackSummary": "Highly coherent technical execution. Review infrastructure budget forecasts."
    },
    "humanApproval": {
      "approved": false,
      "reviewedBy": null,
      "timestamp": null
    }
  },

  "thoughtLogs": [
    {
      "agent": "Analyzer",
      "step": "Artifact Verification",
      "message": "Validated 5 of 5 required deliverable artifacts. Parsing document trees...",
      "timestamp": "2026-03-30T14:00:05Z"
    },
    {
      "agent": "Analyzer",
      "step": "Feature Extraction",
      "message": "Extracted core architecture declarations and validation references.",
      "timestamp": "2026-03-30T14:00:25Z"
    },
    {
      "agent": "Evaluator",
      "step": "Rubric Application",
      "message": "Calculated score: 86.5/100 across 4 rubric dimensions. Prepared feedback packet.",
      "timestamp": "2026-03-30T14:00:45Z"
    }
  ]
}
```

---

## 6. Containerization & Deployment Setup

### 6.1. Docker Configuration for Backend (`server/Dockerfile`)
A standardized two-stage Node.js build optimized for minimal container footprint:

```dockerfile
# Stage 1: Build compilation
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json tsconfig.json ./
RUN npm ci
COPY src ./src
RUN npm run build

# Stage 2: Runtime distribution
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist

EXPOSE 8080
CMD ["node", "dist/index.js"]
```

### 6.2. Cloud Run Deployment Command
To ensure background tasks are not aborted when the response finishes:

```bash
gcloud run deploy aiie-backend \
  --source ./server \
  --region europe-west3 \
  --platform managed \
  --allow-unauthenticated \
  --no-cpu-throttling \
  --min-instances 0 \
  --max-instances 5 \
  --set-env-vars GEMINI_API_KEY="YOUR_KEY_HERE"
```

### 6.3. Static Client Configuration (`client/firebase.json`)
Configures client-side SPA route rewrites:

```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

---

## 7. Security & Administrative Controls

1. **Isolation of Secrets:** AI API credentials (e.g., Gemini API keys) and Google service account keys reside strictly within the Cloud Run environment and are never bundled into client distributions.
2. **Deterministic Role Segregation:**
   - **Analyzer:** Read-only analysis and parsing.
   - **Evaluator:** Calculation and synthesis based solely on Analyzer outputs and configured rubrics.
   - **Human Operator:** Holds exclusive permission to execute `approve`, `overrideScore`, and `disqualify`.
3. **Immutable Audit Log:** Any manual score change, rationale note, or disqualification event is appended to the submission's `thoughtLogs` timeline with the operator's ID, preserving a reliable audit trail.