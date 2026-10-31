# AI Innovation Evaluator (AIIE)

An academic competition and hackathon evaluation platform featuring autonomous multi-agent rubric compliance auditing, dynamic ranking calculations, deliverable document inspection, and Human-in-the-Loop (HITL) jury oversight.

---

## Overview

**AI Innovation Evaluator (AIIE)** standardizes and accelerates academic judging and hackathon evaluations. It combines deterministic intake validations with multi-agent AI evaluation pipelines to assess project submissions against official rubric criteria, generate calibrated scores, and enforce integrity policies—while preserving complete human-in-the-loop auditability and governance.

### Core Features

- **Competition Overview & Criteria Calibration**: View contest details, deadlines, jury defense information, and official 100-point rubric criteria.
- **Competition Ranking Leaderboard**: Real-time ranking table displaying evaluated projects, team rosters, faculty affiliations, and overall composite scores, alongside pending evaluation and disqualification counts.
- **Project Submissions Intake**: Detailed tracking of submissions, team affiliations, and deliverable materials (academic PDF reports, code repositories, live demos).
- **Direct Deliverable Document Access**: Clickable deliverables allowing instant access to external repositories or in-browser viewing of client-generated PDF report documents in a new tab.
- **Project Details & Deep Inspection**: Dedicated view showcasing comprehensive project specifications, contest association, and the active/resolved 3-phase AI evaluation pipeline.
- **Autonomous Multi-Agent AI Inspector**: Real-time visual pipeline showing:
  - **Phase 1: Deterministic Intake & Integrity**: Asset verification, SHA-256 hashes, repository structure analysis, and automated anti-plagiarism scanning.
  - **Phase 2: Autonomous Rubric Evaluation**: Multi-agent criterion auditing across Innovation & Technical Depth, Problem & Impact, Architectural Rigor, and Presentation.
  - **Phase 3: Human-in-the-Loop (HITL) Governance**: Final jury sign-off, manual point adjustments with audit logging, and formal contest sanctioning/disqualification.
- **Interactive Submission Portal**: Student submission form with dynamic team roster management, participant cap validation, deliverable upload fields, and direct trigger for evaluation.

---

## Tech Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend Framework** | [React 19](https://react.dev/) | Modern reactive user interface components |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | Strict type-safety across models and components |
| **Build & Dev Tool** | [Vite 8](https://vite.dev/) | Fast development server and production bundler |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) | Next-generation utility-first styling (`@tailwindcss/vite`) |
| **Animations** | [Motion](https://motion.dev/) | Smooth transitions for drawers, dialogs, and pipeline status |
| **Icons** | [Lucide React](https://lucide.dev/) | High-clarity UI icons |
| **Backend & AI** | [Express](https://expressjs.com/) & [@google/genai](https://www.npmjs.com/package/@google/genai) | Server runtime with Gemini API integration capabilities |

---

## Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or later (v20+ recommended)
- **npm**: v9.0.0 or later

### Installation

1. Clone or access the project directory:
   ```bash
   cd <project-directory>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

---

## Available Commands

The following npm scripts are configured in `package.json`:

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Vite development server on port 3000 (`http://localhost:3000`) with network exposure (`--host=0.0.0.0`). |
| `npm run build` | Compiles TypeScript and creates an optimized production bundle in `/dist`. |
| `npm run preview` | Serves the production build locally for verification. |
| `npm run lint` | Runs TypeScript compiler checks (`tsc --noEmit`) to validate type integrity. |
| `npm run clean` | Removes the compiled `dist` directory and build artifacts. |

---

## Evaluation Pipeline Workflow

```
[Student Submission]
         │
         ▼
┌──────────────────────────────────────────────┐
│  Phase 1: Deterministic Intake & Integrity    │
│  • Asset & URL format validation             │
│  • Plagiarism & originality audit            │
│  • Repository structure & commit integrity   │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│  Phase 2: Autonomous Multi-Agent Rubric      │
│  • Technical depth & innovation analysis     │
│  • Real-world problem & impact assessment    │
│  • Code quality & architecture rigor check   │
│  • Automated weighted point calibration      │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│  Phase 3: Human-in-the-Loop Jury Oversight   │
│  • Jury review & evidence verification       │
│  • Manual point adjustment with audit trail  │
│  • Sanction or disqualification issuance     │
│  • Leaderboard publication                   │
└──────────────────────────────────────────────┘
```

---

## Project Structure

```
├── metadata.json                 # AI Studio app metadata and capabilities configuration
├── package.json                  # Dependencies and run scripts
├── tsconfig.json                 # TypeScript compiler configuration
├── vite.config.ts                # Vite build and plugin configurations
├── src/
│   ├── main.tsx                  # React entry point
│   ├── App.tsx                   # Top-level shell, navigation routing, and state orchestration
│   ├── index.css                 # Global CSS and Tailwind CSS v4 styling rules
│   ├── components/               # Modular UI views and dialogs
│   │   ├── AIInspectorSheet.tsx  # Multi-phase agent execution drawer & live logs
│   │   ├── AdjustPointsDialog.tsx# Modal for manual point adjustments with audit rationale
│   │   ├── DisqualifyDialog.tsx  # Modal for issuing contest sanctions or disqualifications
│   │   ├── LoginView.tsx         # User authentication & role selection
│   │   ├── ProjectDetailsView.tsx# Comprehensive project view with contest info & AI pipeline
│   │   ├── ProjectsView.tsx      # Project submissions table with deliverable actions
│   │   ├── RankingView.tsx       # Competition ranking leaderboard
│   │   ├── Sidebar.tsx           # Main navigation and platform branding
│   │   ├── SubmitView.tsx        # Project submission intake form with member roster validation
│   │   └── SummaryView.tsx       # Contest overview, dates, and official rubric criteria
│   ├── data/
│   │   └── mockData.ts           # Initial contest state, rubric criteria, projects, and pipeline logs
│   ├── types/
│   │   └── index.ts              # TypeScript domain types (Project, Rubric, AgentLog, etc.)
│   └── utils/                    # Shared helpers (date formatters, PDF generators, styling utilities)
```

---

## License

This project is licensed under the MIT License.
