# AI Talent Discovery & Team Formation Platform

An autonomous multi-agent talent discovery, candidate profiling, and balanced team formation platform for academic competitions, hackathons, and innovation cohorts—built with React 19, Express, Google ADK (`@google/adk`) + Gemini (`@google/genai`), and Cloud Firestore, featuring an **Aura Acrylic / Hyper-Modern Glass** user interface and Human-in-the-Loop (HITL) mentor controls.

---

## Overview

**AI Talent Discovery & Team Formation Platform** automates the discovery, mathematical profiling, and balanced team assembly of student candidates. Instead of manually sorting through raw application questionnaires, mentors trigger a two-stage autonomous AI pipeline powered by **Google ADK (`LlmAgent` + `SequentialAgent`)** and **`gemini-3.8-flash`**:

1. **Candidate Profiling & Selection (`student_profiling_agent`)**: Processes raw student questionnaires, calculates 5 standardized 0–100 indices—**Academic (`AI`)**, **Experience (`EI`)**, **Motivation (`MI`)**, **Initiative (`INI`)**, and **Entrepreneurship (`ENI`)**—computes an equal-weighted **Total Performance Score (`TPS`)**, resolves tie-breakers via Motivation Index (`MI`), and selects the top candidates while synthesizing personalized strengths in Bulgarian.
2. **4H Micro-Role Assignment & Quality-Controlled Team Formation (`team_formation_agent`)**: Analyzes each selected candidate's 4 situational work-style answers to assign a dominant **4H Role** (**Hacker**, **Hipster**, **Hustler**, **Hound**), enforces role balance (1 of each 4H role per 4-person team) and school/grade diversity constraints, and runs an automated **Team Balance Index (`TBI`) Audit & Swap loop** so that the maximum `TBI` spread across all teams stays within `≤ 15.0` points.

Mentors can monitor live agent thoughts via the **AI Inspector** drawer, inspect detailed candidate profiles and 4H rationales, interactively swap team members with real-time compatibility recalculation, and lock in confirmed teams.

---

## Core Features

- **Two-Stage Autonomous Multi-Agent Pipeline**:
  - **Stage 1 — `student_profiling_agent`**:
    - Standardized 0–100 index formulas:
      - `AI = ((GPA - 3) / 3) * 100` (for GPA between `3.00` and `6.00`)
      - `EI` mapped from raw project count (`0 -> 0`, `1 -> 25`, `2 -> 50`, `3 -> 75`, `4+ -> 100`)
      - `MI`, `INI`, `ENI = (Score - 1) * 25` (from 1–5 scale ratings)
    - Equal-weighted composite score: `TPS = 0.20*AI + 0.20*EI + 0.20*INI + 0.20*ENI + 0.20*MI`
    - Strict descending `TPS` ranking with `MI` tie-breaker and top-`K` cohort selection.
  - **Stage 2 — `team_formation_agent`**:
    - **4H Framework Classification**: Assigns every selected candidate to **Hacker** (engineering/logic), **Hipster** (design/UX), **Hustler** (strategy/pitching), or **Hound** (process/structure), using global pool scarcity as a tie-breaker.
    - **Constraint-Based Grouping**: Forms 4-person teams containing exactly `1 Hacker + 1 Hipster + 1 Hustler + 1 Hound` while maximizing school and grade diversity.
    - **Automated TBI Audit & Swaps**: Computes `TBI = average(TPS)` per team and iteratively swaps same-role members between the highest- and lowest-TBI teams until `max(TBI) - min(TBI) <= 15.0`.
- **Interactive Team Cards & Mentor Controls (`Отбори` Tab)**:
  - Compact 2-column Aura Acrylic cards showing team name, confirmation status, compatibility badge, and the 4H member grid.
  - Expandable full-width detail view with top-level **TBI**, **School Diversity**, and **4H Role Balance** badges, individual member cards with checkmark strengths (`Силни страни`) and leading index pills (`Водещи индекси`), plus team synergy and AI formation rationale.
  - Interactive **member swap mode (`Смени`)** allowing mentors to exchange members across teams before confirming (`Потвърди`) a team.
- **Applicants Directory & Deep Profile Drawer (`Участници` Tab)**:
  - Searchable, filterable directory by selection status (`Всички`, `Селектирани`, `Отхвърлени`) and assigned 4H role.
  - Slide-over **Student Details Sheet** displaying the candidate's 5 indices, `TPS`, 4H role rationale, synthesized strengths, and full questionnaire answers.
- **Student Application Intake (`Анкета` Tab)**:
  - Interactive 13-question Bulgarian application form covering academic metrics, 1–5 Likert scales, and 4 situational 4H multiple-choice scenarios (`A/B/C/D`), immediately persisted to Firestore or local state.
- **Real-Time AI Inspector (`AI Инспектор` Drawer)**:
  - Streams live step-by-step reasoning and audit logs from `student_profiling_agent` and `team_formation_agent` as the pipeline executes.
- **Dual Persistence Modes (Cloud Firestore & In-Memory Fallback)**:
  - Works seamlessly with real-time **Cloud Firestore** `onSnapshot` listeners when Firebase is enabled (`VITE_ENABLE_FIREBASE=true` / `ENABLE_FIREBASE=true`), or runs end-to-end with 92 pre-loaded realistic student questionnaires in local/offline mode (`ENABLE_FIREBASE=false`) while still executing the real Gemini AI agents.

---

## Tech Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend Framework** | [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) | Reactive UI with strict domain type safety |
| **Build & Styling** | [Vite 8](https://vite.dev/) + [Tailwind CSS v4](https://tailwindcss.com/) | Aura Acrylic / Hyper-Modern Glass aesthetic (`#f7f5fd` lilac canvas, violet/fuchsia gradients) |
| **Animations & Icons** | [Motion](https://motion.dev/) + [Lucide React](https://lucide.dev/) | Layout transitions, expandable cards, and iconography |
| **Backend Runtime** | [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/) | REST API endpoints and background multi-agent pipeline runner |
| **AI Orchestration** | [@google/adk](https://www.npmjs.com/package/@google/adk) + [@google/genai](https://www.npmjs.com/package/@google/genai) | Google Agent Development Kit (`SequentialAgent`, `LlmAgent`, `FunctionTool`) with Gemini models |
| **Database & Sync** | [Cloud Firestore](https://firebase.google.com/docs/firestore) (`firebase` & `firebase-admin`) | Real-time reactive document synchronization for evaluations, questionnaires, teams, and agent logs |

---

## Project Architecture

```text
├── client/                                   # React 19 + Vite + Tailwind CSS v4 frontend
│   ├── index.html                            # App shell & typography (Plus Jakarta Sans, Inter, JetBrains Mono)
│   ├── package.json                          # Frontend dependencies and scripts
│   └── src/
│       ├── App.tsx                           # Main Aura Acrylic layout, KPI header, segmented tabs, and evaluation trigger
│       ├── firebase.ts                       # Firebase Client SDK initialization
│       ├── index.css                         # Aura Acrylic glass utilities (.plate-acrylic, .bg-aura-canvas)
│       ├── components/
│       │   ├── Sidebar.tsx                   # Floating left sidebar with AI Inspector trigger & contest selector
│       │   ├── StudentsTableView.tsx         # Applicants directory with status/4H role filters
│       │   ├── StudentDetailsSheet.tsx       # Slide-over candidate profile with 5 indices, TPS, and questionnaire answers
│       │   ├── TeamsGridView.tsx             # 2-column team cards, expandable detail view, and interactive member swapping
│       │   ├── QuestionnaireFormView.tsx     # 13-question student application form
│       │   ├── AIInspectorSheet.tsx          # Live multi-agent reasoning & audit drawer
│       │   └── LoginView.tsx                 # Platform sign-in screen
│       ├── data/
│       │   └── mockStudents.ts               # 92 realistic Bulgarian student questionnaires & evaluation state helper
│       ├── hooks/
│       │   └── useEvaluationSession.ts       # Firestore onSnapshot / REST polling hook for live evaluation state
│       ├── types/
│       │   └── domain.ts                     # Shared TypeScript interfaces (StudentQuestionnaire, TeamDocument, StudentIndices)
│       └── utils/
│           └── env.ts                        # Frontend environment variable validator
│
├── server/                                   # Express + Google ADK + Firebase Admin backend
│   ├── package.json                          # Backend dependencies and ADK CLI scripts
│   └── src/
│       ├── index.ts                          # Express server & REST API (/api/evaluations/start, /api/questionnaires, etc.)
│       ├── env.ts                            # Server environment variable validator
│       ├── firebase.ts                       # Firebase Admin / Client Firestore synchronization helpers
│       ├── seed.ts                           # Firestore database seeder (92 student questionnaires)
│       └── agents/
│           ├── agent.ts                      # ADK root SequentialAgent (talent_discovery_pipeline) & pipeline runner
│           ├── studentProfilingAgent.ts      # Agent 1: 5 indices, TPS calculation, top-K selection, and ADK tools
│           ├── teamFormationAgent.ts         # Agent 2: 4H role classification, team grouping, and TBI swap auditing
│           └── schemas.ts                    # Structured output JSON schemas & deterministic formula helpers
│
└── plans/                                    # Architectural & design specifications
    ├── project-architecture.md               # System topology & decoupled asynchronous execution architecture
    ├── agent-roles.md                        # Multi-agent pipeline & algorithmic specification
    ├── firestore-database-schema-indexing-plan.md # Firestore document schema & composite index plan
    ├── ui-context.md                         # UI layout & Aura Acrylic component guide
    └── design-context.md                     # Color tokens, typography, and elevation specifications
```

---

## Getting Started

### Prerequisites

- **Node.js**: v20.0.0 or later recommended
- **npm**: v9.0.0 or later
- **Gemini API Key**: Required on the server (`GOOGLE_GENAI_API_KEY`) to run the Google ADK agents

### 1. Environment Configuration

Both `client/` and `server/` validate their environment variables on startup via `env.ts` and log clear errors via `console.error` if any required variables are missing.

#### Server (`server/.env`)

Create `server/.env`:

```env
PORT=8080
GOOGLE_GENAI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-3.8-flash

# Set to "true" to persist to Cloud Firestore, or "false" to evaluate request payload data in-memory
ENABLE_FIREBASE=false

# Required only when ENABLE_FIREBASE=true
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
```

#### Client (`client/.env`)

Create `client/.env`:

```env
VITE_BACKEND_URL=http://localhost:8080

# Set to "true" to use live Firestore onSnapshot listeners, or "false" to use the 92 built-in mock student questionnaires with live AI agent evaluation
VITE_ENABLE_FIREBASE=false

# Required only when VITE_ENABLE_FIREBASE=true
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 2. Install Dependencies

Install dependencies in both `server/` and `client/`:

```bash
npm --prefix server install
npm --prefix client install
```

### 3. Run the Platform Locally

Start the backend server (runs on `http://localhost:8080` by default):

```bash
npm --prefix server run dev
```

In a second terminal, start the Vite frontend dev server (runs on `http://localhost:3000`):

```bash
npm --prefix client run dev
```

---

## Available Scripts

### Client (`client/package.json`)

| Command | Description |
| :--- | :--- |
| `npm --prefix client run dev` | Starts the Vite development server on `http://localhost:3000`. |
| `npm --prefix client run build` | Builds the production frontend bundle into `client/dist`. |
| `npm --prefix client run lint` | Runs TypeScript type-checking (`tsc --noEmit`). |
| `npm --prefix client run preview` | Previews the production build locally. |

### Server (`server/package.json`)

| Command | Description |
| :--- | :--- |
| `npm --prefix server run dev` | Starts the Express + ADK server in watch mode (`tsx watch src/index.ts`). |
| `npm --prefix server run build` | Compiles TypeScript server code to `server/dist`. |
| `npm --prefix server run start` | Runs the compiled server (`node dist/index.js`). |
| `npm --prefix server run seed` | Seeds Cloud Firestore with the 92 initial student questionnaires and reset evaluation state. |
| `npm --prefix server run adk:web` | Launches the Google ADK Web Dev UI for inspecting `student_profiling_agent` and `team_formation_agent`. |

---

## Multi-Agent Pipeline Workflow

```text
[ Raw Applicant Pool (N Questionnaires) ]
                   │
                   ▼
┌───────────────────────────────────────────────────────────────────────────┐
│ STAGE 1: student_profiling_agent (Google ADK LlmAgent)                    │
│ • Computes 5 standardized indices (0–100): AI, EI, MI, INI, ENI           │
│ • Calculates Total Performance Score:                                     │
│   TPS = 0.20*AI + 0.20*EI + 0.20*INI + 0.20*ENI + 0.20*MI                 │
│ • Ranks candidates descending by TPS (tie-breaker: higher MI)             │
│ • Selects Top K cohort & generates Bulgarian strengths summary            │
└─────────────────────────────────────┬─────────────────────────────────────┘
                                      │ (Selected Candidates + 4 Situational Answers)
                                      ▼
┌───────────────────────────────────────────────────────────────────────────┐
│ STAGE 2: team_formation_agent (Google ADK LlmAgent)                       │
│ • Classifies 4H Micro-Role from Q10–Q13 answers:                          │
│   Hacker | Hipster | Hustler | Hound (tie-breaker: global pool scarcity)  │
│ • Forms 4-person teams with strict 1 Hacker + 1 Hipster + 1 Hustler +     │
│   1 Hound balance and school/grade diversity                              │
│ • Runs automated TBI Audit (TBI = average TPS of 4 members) and executes  │
│   same-role swaps until max(TBI) - min(TBI) <= 15.0                       │
└─────────────────────────────────────┬─────────────────────────────────────┘
                                      │
                                      ▼
┌───────────────────────────────────────────────────────────────────────────┐
│ STAGE 3: Human-in-the-Loop Mentor Review                                  │
│ • Inspect candidate indices, 4H rationales, and live agent thoughts       │
│ • Perform manual cross-team member swaps ("Смени") if needed              │
│ • Confirm final teams ("Потвърди")                                        │
└───────────────────────────────────────────────────────────────────────────┘
```

---

## License

This project is licensed under the MIT License.
