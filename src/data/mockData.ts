import { Contest, ProjectSubmission, User } from "../types";

export const currentUser: User = {
  id: "usr-admin-01",
  name: "Dr. Elena Rostova",
  email: "e.rostova@university.edu",
  role: "Admin",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
};

export const mockContests: Contest[] = [
  {
    id: "contest-bw-2026",
    title: "Business Workshop 2026 - SME AI Teams",
    shortTitle: "BW 2026 AI Teams",
    description:
      "Annual university flagship venture incubator uniting engineering and management scholars to engineer generative business automation prototypes for local SMEs.",
    faculty: "Faculty of Computer Systems & Business Administration",
    academicYear: "2025/2026",
    status: "Active",
    maxParticipants: 5,
    dates: {
      submissionDeadline: "November 14, 2026 - 23:59 UTC",
      evaluationEnd: "November 21, 2026 - 18:00 UTC",
      finaleDate: "November 28, 2026",
    },
    defenseLocation: "Aula Maxima, University Central Campus",
    evaluationCriteria: [
      { id: "c1", key: "problem", name: "Problem Statement & SME Relevance", maxPoints: 12, description: "Depth of domain discovery and specific market friction identification.", iconName: "Target" },
      { id: "c2", key: "aiTools", name: "AI Architecture & GenAI Tooling", maxPoints: 18, description: "Integration of modern LLM/Vision pipelines, RAG, and prompt safety layers.", iconName: "Cpu" },
      { id: "c3", key: "prototype", name: "Working MVP & Repository Code", maxPoints: 20, description: "Code quality, architecture readiness, clean commits, and runnable instructions.", iconName: "Code2" },
      { id: "c4", key: "leanCanvas", name: "Lean Canvas & Unit Economics", maxPoints: 12, description: "Viability of revenue streams, CAC/LTV hypothesis, and channel strategy.", iconName: "Layers" },
      { id: "c5", key: "validation", name: "Field Customer Validation", maxPoints: 14, description: "Documented interviews with at least 5 local SME owners or target users.", iconName: "UserCheck" },
      { id: "c6", key: "ethics", name: "AI Ethics, Privacy & Compliance", maxPoints: 8, description: "GDPR compliance, data handling disclosures, hallucination safeguards.", iconName: "ShieldCheck" },
      { id: "c7", key: "plan90", name: "90-Day Execution Roadmap", maxPoints: 8, description: "Milestones, burn rate estimate, and pilot deployment schedule.", iconName: "Calendar" },
      { id: "c8", key: "demo", name: "Pitch Deck & Video Delivery", maxPoints: 8, description: "Clarity of communication, persuasive storytelling, and video demonstration.", iconName: "Video" },
    ],
  },
  {
    id: "contest-fintech-2026",
    title: "FinTech Innovation Challenge 2026",
    shortTitle: "FinTech Challenge",
    description: "Developing intelligent fraud mitigation and cross-border settlement agents for digital banking.",
    faculty: "Faculty of Applied Economics & Mathematics",
    academicYear: "2025/2026",
    status: "Active",
    maxParticipants: 4,
    dates: {
      submissionDeadline: "December 05, 2026 - 23:59 UTC",
      evaluationEnd: "December 12, 2026 - 18:00 UTC",
      finaleDate: "December 18, 2026",
    },
    defenseLocation: "Auditorium 3, Tech Faculty Complex",
    evaluationCriteria: [
      { id: "fc1", key: "fraud", name: "Fraud Detection Precision", maxPoints: 25, description: "F1 score on synthetic transaction benchmarks and false-positive limits.", iconName: "ShieldAlert" },
      { id: "fc2", key: "latency", name: "Settlement Latency & Throughput", maxPoints: 25, description: "Sub-second cross-border ledger reconciliation proofs.", iconName: "Zap" },
      { id: "fc3", key: "regtech", name: "RegTech Compliance", maxPoints: 25, description: "AML / KYC regulatory reporting automation.", iconName: "Scale" },
      { id: "fc4", key: "prototype", name: "Live API Sandbox", maxPoints: 25, description: "Interactive testing sandbox and Swagger documentation.", iconName: "Code2" },
    ],
  },
  {
    id: "contest-hackathon-archived",
    title: "Digital Transformation Hackathon 2025",
    shortTitle: "DX Hackathon '25",
    description: "GovTech and civic service modernization through open datasets and autonomous workflows.",
    faculty: "Interdisciplinary Research Institute",
    academicYear: "2024/2025",
    status: "Archived",
    maxParticipants: 5,
    dates: {
      submissionDeadline: "May 10, 2025 - 23:59 UTC",
      evaluationEnd: "May 15, 2025 - 18:00 UTC",
      finaleDate: "May 20, 2025",
    },
    defenseLocation: "Aula Minor, Main Campus Building B",
    evaluationCriteria: [
      { id: "dx1", key: "civic", name: "Citizen Accessibility Impact", maxPoints: 30, description: "Multi-lingual and WCAG AAA compliance.", iconName: "Users" },
      { id: "dx2", key: "openData", name: "Open Government Data Synergy", maxPoints: 35, description: "Effective integration with national open data portals.", iconName: "Database" },
      { id: "dx3", key: "speed", name: "Process Automation Acceleration", maxPoints: 35, description: "Documented speedup of administrative service approvals.", iconName: "TrendingUp" },
    ],
  },
];

export const mockSubmissions: ProjectSubmission[] = [
  {
    id: "sub-001",
    contestId: "contest-bw-2026",
    teamId: "team-alpha",
    team: {
      id: "team-alpha",
      name: "CogniSupply AI",
      faculty: "Informatics & Data Science",
      members: [
        { id: "m1", name: "Alexander Vance", email: "a.vance@uni.edu", facultyNumber: "F-10928", major: "Software Engineering", studyYear: 4 },
        { id: "m2", name: "Maya Lin", email: "m.lin@uni.edu", facultyNumber: "F-10877", major: "Applied Statistics", studyYear: 3 },
        { id: "m3", name: "Karlo Rossi", email: "k.rossi@uni.edu", facultyNumber: "B-22041", major: "Business Management", studyYear: 4 },
      ],
    },
    title: "Autonomous Supply Chain Replenisher for Local Bakeries",
    summary: "Predictive inventory agent using weather patterns, local events, and past sales to automate artisan bakery purchase orders.",
    totalScore: 94,
    status: "evaluated",
    rank: 1,
    deliverables: {
      deck: { id: "d1", name: "Deck", label: "Presentation Deck", type: "file", value: "/docs/cogni_deck.pdf", filename: "CogniSupply_Deck_Final.pdf", fileSize: "4.2 MB", submittedAt: "2026-11-10 14:22" },
      demo: { id: "d2", name: "Demo", label: "Video Demo", type: "link", value: "https://youtu.be/sample-cogni-demo", submittedAt: "2026-11-10 14:30" },
      leanCanvas: { id: "d3", name: "Lean Canvas", label: "Lean Canvas Document", type: "file", value: "/docs/cogni_canvas.pdf", filename: "CogniSupply_LeanCanvas.pdf", fileSize: "1.1 MB", submittedAt: "2026-11-10 14:23" },
      mvp: { id: "d4", name: "MVP Spec", label: "MVP Specification", type: "file", value: "/docs/cogni_mvp.pdf", filename: "MVP_Architecture_Specification.pdf", fileSize: "2.8 MB", submittedAt: "2026-11-10 14:24" },
      validation: { id: "d5", name: "Validation", label: "Market Validation Proof", type: "file", value: "/docs/cogni_val.pdf", filename: "Bakeries_Field_Interviews.pdf", fileSize: "3.5 MB", submittedAt: "2026-11-10 14:26" },
      ethics: { id: "d6", name: "Ethics", label: "AI Ethics & GDPR Dossier", type: "file", value: "/docs/cogni_ethics.pdf", filename: "DataPrivacy_GDPR_Charter.pdf", fileSize: "820 KB", submittedAt: "2026-11-10 14:27" },
      plan90: { id: "d7", name: "Plan 90", label: "90-Day Execution Plan", type: "file", value: "/docs/cogni_plan90.pdf", filename: "Quarter1_Rollout_Milestones.pdf", fileSize: "1.4 MB", submittedAt: "2026-11-10 14:28" },
      prototypeZip: { id: "d8", name: "Prototype Repo", label: "Prototype Codebase", type: "link", value: "https://github.com/cognisupply/sme-agent-core", submittedAt: "2026-11-10 14:29" },
    },
    agentEvaluation: {
      agent1Auditor: {
        status: "completed",
        executionTimeMs: 1420,
        extractedFacts: [
          "Delivered 8 out of 8 required academic criteria files.",
          "GitHub repository contains active FastAPI backend and LangChain/Gemini 1.5 pipeline with test coverage of 84%.",
          "Documented 7 live interviews with certified bakery owners in Sofia & Plovdiv with transcribed quotes.",
          "Lean canvas specifies customer acquisition cost (CAC) at $45 and estimated monthly recurring revenue (MRR) at $120/client.",
          "Ethics guideline includes strict GDPR opt-in clauses for POS transaction logs.",
        ],
        flags: [],
        fileIntegrityCheck: { totalRequired: 8, totalSubmitted: 8, passedFormatVerification: true },
        rawJsonOutput: {
          confidenceScore: 0.98,
          verifiableClaimsCount: 14,
          plagiarismIndex: 0.02,
          deliverablesHealth: "optimal",
        },
      },
      agent2Mentor: {
        status: "completed",
        rubricScores: { problem: 12, aiTools: 17, prototype: 19, leanCanvas: 11, validation: 13, ethics: 8, plan90: 7, demo: 7 },
        strengths: [
          "Outstanding end-to-end integration of lightweight multi-agent tool calls for ERP connection.",
          "Superb primary field validation with tangible feedback from genuine artisanal bakery operators.",
          "Crisp financial projections grounded in conservative margin expectations.",
        ],
        recommendations: [
          "Expand the 90-day plan to address cold-start telemetry during seasonal bakery downturns (e.g., August summer holidays).",
          "Add fallback models if API throttling occurs during simultaneous batch inventory runs.",
        ],
        diplomaticFeedbackLetter:
          "Dear CogniSupply Team, your submission reflects an exceptional balance between cutting-edge AI architecture and practical SME pragmatism. The panel was particularly impressed by your field interviews and the production-grade quality of your GitHub repository. With minor refinements to your offline fallback capabilities, this prototype stands as an exemplar of translational academic innovation.",
      },
      humanApproval: {
        approved: true,
        approvedBy: "Dr. Elena Rostova",
        timestamp: "2026-11-11 10:15 UTC",
      },
    },
  },
  {
    id: "sub-002",
    contestId: "contest-bw-2026",
    teamId: "team-beta",
    team: {
      id: "team-beta",
      name: "LegalBot Artisan",
      faculty: "Faculty of Law & Computer Science",
      members: [
        { id: "m4", name: "Simeon Danev", email: "s.danev@uni.edu", facultyNumber: "L-40112", major: "Commercial Law", studyYear: 5 },
        { id: "m5", name: "Hristina Georgieva", email: "h.georgieva@uni.edu", facultyNumber: "F-11002", major: "Artificial Intelligence", studyYear: 3 },
      ],
    },
    title: "Bilingual SME Contract Audit & Redline Copilot",
    summary: "Automated clause cross-examination against national labor and trade codices for family-owned service firms.",
    totalScore: 88,
    status: "evaluated",
    rank: 2,
    deliverables: {
      deck: { id: "d1", name: "Deck", label: "Presentation Deck", type: "file", value: "/docs/legal_deck.pdf", filename: "LegalBot_PitchDeck.pdf", fileSize: "5.1 MB", submittedAt: "2026-11-09 20:11" },
      demo: { id: "d2", name: "Demo", label: "Video Demo", type: "link", value: "https://loom.com/share/legalbot-demo", submittedAt: "2026-11-09 20:15" },
      leanCanvas: { id: "d3", name: "Lean Canvas", label: "Lean Canvas Document", type: "file", value: "/docs/legal_canvas.pdf", filename: "LegalBot_Canvas.pdf", fileSize: "920 KB", submittedAt: "2026-11-09 20:16" },
      mvp: { id: "d4", name: "MVP Spec", label: "MVP Specification", type: "file", value: "/docs/legal_mvp.pdf", filename: "Specification_v2.pdf", fileSize: "1.9 MB", submittedAt: "2026-11-09 20:18" },
      validation: { id: "d5", name: "Validation", label: "Market Validation Proof", type: "file", value: "/docs/legal_val.pdf", filename: "LawFirm_Validation_Surveys.pdf", fileSize: "2.1 MB", submittedAt: "2026-11-09 20:20" },
      ethics: { id: "d6", name: "Ethics", label: "AI Ethics & GDPR Dossier", type: "file", value: "/docs/legal_ethics.pdf", filename: "Confidentiality_Matrix.pdf", fileSize: "1.0 MB", submittedAt: "2026-11-09 20:22" },
      plan90: { id: "d7", name: "Plan 90", label: "90-Day Execution Plan", type: "file", value: "/docs/legal_plan90.pdf", filename: "90DayGantt.pdf", fileSize: "800 KB", submittedAt: "2026-11-09 20:23" },
      prototypeZip: { id: "d8", name: "Prototype Repo", label: "Prototype Codebase", type: "file", value: "/docs/legal_repo.zip", filename: "LegalBot_Source_Bundle.zip", fileSize: "48.2 MB", submittedAt: "2026-11-09 20:25" },
    },
    agentEvaluation: {
      agent1Auditor: {
        status: "completed",
        executionTimeMs: 1210,
        extractedFacts: [
          "Hybrid interdisciplinary team spanning Law and AI.",
          "Embeds local legislative code into vector store for RAG grounding.",
          "Demo video showcases working PDF upload and differential redlining in under 12 seconds.",
        ],
        flags: [
          { severity: "low", category: "Source Repository", description: "Prototype submitted via ZIP bundle rather than live Git repository, preventing commit history verification." },
        ],
        fileIntegrityCheck: { totalRequired: 8, totalSubmitted: 8, passedFormatVerification: true },
        rawJsonOutput: { confidenceScore: 0.92, verifiableClaimsCount: 11, plagiarismIndex: 0.04 },
      },
      agent2Mentor: {
        status: "completed",
        rubricScores: { problem: 11, aiTools: 16, prototype: 17, leanCanvas: 10, validation: 12, ethics: 8, plan90: 7, demo: 7 },
        strengths: [
          "Exemplary interdisciplinary collaboration addressing legal liability barriers for small entities.",
          "Clear retrieval hallucination safeguards.",
        ],
        recommendations: [
          "Migrate the packaging to a hosted Git service with CI/CD smoke tests for reproducible jury evaluations.",
        ],
        diplomaticFeedbackLetter:
          "LegalBot Artisan demonstrates how academic legal knowledge can merge with LLM retrieval to lower legal friction for SMEs. Your accuracy guarantees are commendable; moving toward continuous deployment will strengthen commercial credibility.",
      },
      humanApproval: { approved: true, approvedBy: "Dr. Elena Rostova", timestamp: "2026-11-11 11:00 UTC" },
    },
  },
  {
    id: "sub-003",
    contestId: "contest-bw-2026",
    teamId: "team-gamma",
    team: {
      id: "team-gamma",
      name: "AgriVision IoT",
      faculty: "Agronomy & Telecommunications",
      members: [
        { id: "m6", name: "Petar Bozhilov", email: "p.bozhilov@uni.edu", facultyNumber: "A-5021", major: "Precision Agriculture", studyYear: 4 },
        { id: "m7", name: "Desislava Ivanova", email: "d.ivanova@uni.edu", facultyNumber: "T-7729", major: "IoT & Embedded Networks", studyYear: 4 },
      ],
    },
    title: "Edge-AI Greenhouse Pest Forecaster for Organic Nurseries",
    summary: "Computer vision trap analysis running on micro-controllers to eliminate scheduled pesticide overspray.",
    totalScore: 79,
    status: "needs_review",
    rank: 3,
    deliverables: {
      deck: { id: "d1", name: "Deck", label: "Presentation Deck", type: "file", value: "/docs/agri_deck.pdf", filename: "AgriVision_Deck.pdf", fileSize: "6.8 MB", submittedAt: "2026-11-10 18:01" },
      demo: { id: "d2", name: "Demo", label: "Video Demo", type: "link", value: "https://youtu.be/agrivision-demo-short", submittedAt: "2026-11-10 18:05" },
      leanCanvas: { id: "d3", name: "Lean Canvas", label: "Lean Canvas Document", type: "file", value: "/docs/agri_canvas.pdf", filename: "LeanCanvas_Agri.pdf", fileSize: "1.2 MB", submittedAt: "2026-11-10 18:06" },
      mvp: { id: "d4", name: "MVP Spec", label: "MVP Specification", type: "file", value: "/docs/agri_mvp.pdf", filename: "Firmware_Spec_Draft.pdf", fileSize: "1.5 MB", submittedAt: "2026-11-10 18:09" },
      validation: { id: "d5", name: "Validation", label: "Market Validation Proof", type: "file", value: "/docs/agri_val.pdf", filename: "Nursery_FieldNotes.pdf", fileSize: "1.1 MB", submittedAt: "2026-11-10 18:11" },
      ethics: { id: "d6", name: "Ethics", label: "AI Ethics & GDPR Dossier", type: "file", value: "/docs/agri_ethics.pdf", filename: "Environmental_Charter.pdf", fileSize: "650 KB", submittedAt: "2026-11-10 18:12" },
      plan90: { id: "d7", name: "Plan 90", label: "90-Day Execution Plan", type: "file", value: "/docs/agri_plan90.pdf", filename: "PilotTesting_Schedule.pdf", fileSize: "910 KB", submittedAt: "2026-11-10 18:14" },
      prototypeZip: { id: "d8", name: "Prototype Repo", label: "Prototype Codebase", type: "link", value: "https://github.com/agrivision/greenhouse-edge", submittedAt: "2026-11-10 18:15" },
    },
    agentEvaluation: {
      agent1Auditor: {
        status: "completed",
        executionTimeMs: 1890,
        extractedFacts: [
          "Edge model uses MobileNet quantized for low-power microcontroller deployment.",
          "Only 2 customer interview transcripts present (academic benchmark requires minimum 5).",
          "Unit economics assumes hardware bill of materials is under $25/unit without component supplier references.",
        ],
        flags: [
          { severity: "medium", category: "Insufficient Market Validation", description: "Submission contains only 2 confirmed field interviews instead of the 5 requested in Criterion 5." },
        ],
        fileIntegrityCheck: { totalRequired: 8, totalSubmitted: 8, passedFormatVerification: true },
        rawJsonOutput: { confidenceScore: 0.81, verifiableClaimsCount: 8, validationDeficit: true },
      },
      agent2Mentor: {
        status: "completed",
        rubricScores: { problem: 11, aiTools: 14, prototype: 16, leanCanvas: 9, validation: 8, ethics: 7, plan90: 7, demo: 7 },
        strengths: ["Innovative edge hardware deployment reducing reliance on rural cloud bandwidth."],
        recommendations: [
          "Conduct and attach the 3 missing farmer interviews before final jury defense to unlock full points on Criterion 5.",
          "Detail component lead times in your 90-day procurement plan.",
        ],
        diplomaticFeedbackLetter:
          "AgriVision showcases impressive hardware-software orchestration for agro-tech. However, market evidence is presently constrained. The Lead Judge recommends rapid supplementation of the validation record to realize the team's full competitive potential.",
      },
      humanApproval: { approved: false },
    },
  },
  {
    id: "sub-004",
    contestId: "contest-bw-2026",
    teamId: "team-delta",
    team: {
      id: "team-delta",
      name: "MediClaim Sentinel",
      faculty: "Health Economics & Bioinformatics",
      members: [
        { id: "m8", name: "Viktor Stoyanov", email: "v.stoyanov@uni.edu", facultyNumber: "M-99120", major: "Health Informatics", studyYear: 4 },
      ],
    },
    title: "Dental Practice Insurance Claim Anomaly Detector",
    summary: "Real-time auditing of health insurance billing codes for outpatient clinics to preempt rejection penalties.",
    totalScore: 0,
    status: "disqualified",
    rank: 4,
    adminRemarks: "DISQUALIFIED BY ADMIN (Dr. Elena Rostova): Discovered wholesale verbatim plagiarism of an open-source MIT thesis (K. Patel, 2023) within the MVP specification and source code repository without citation or substantial adaptation. Strict breach of University Academic Integrity Charter Art. 14.",
    deliverables: {
      deck: { id: "d1", name: "Deck", label: "Presentation Deck", type: "file", value: "/docs/mediclaim_deck.pdf", filename: "MediClaim_Deck.pdf", fileSize: "3.2 MB", submittedAt: "2026-11-08 11:22" },
      demo: { id: "d2", name: "Demo", label: "Video Demo", type: "link", value: "https://youtu.be/fake-demo-placeholder", submittedAt: "2026-11-08 11:25" },
      leanCanvas: { id: "d3", name: "Lean Canvas", label: "Lean Canvas Document", type: "file", value: "/docs/mediclaim_canvas.pdf", filename: "Canvas.pdf", fileSize: "500 KB", submittedAt: "2026-11-08 11:26" },
      mvp: { id: "d4", name: "MVP Spec", label: "MVP Specification", type: "file", value: "/docs/mediclaim_mvp.pdf", filename: "Architecture.pdf", fileSize: "1.2 MB", submittedAt: "2026-11-08 11:27" },
      validation: { id: "d5", name: "Validation", label: "Market Validation Proof", type: "file", value: "/docs/mediclaim_val.pdf", filename: "Validation.pdf", fileSize: "420 KB", submittedAt: "2026-11-08 11:28" },
      ethics: { id: "d6", name: "Ethics", label: "AI Ethics & GDPR Dossier", type: "file", value: "/docs/mediclaim_ethics.pdf", filename: "Ethics.pdf", fileSize: "300 KB", submittedAt: "2026-11-08 11:29" },
      plan90: { id: "d7", name: "Plan 90", label: "90-Day Execution Plan", type: "file", value: "/docs/mediclaim_plan90.pdf", filename: "Plan.pdf", fileSize: "380 KB", submittedAt: "2026-11-08 11:30" },
      prototypeZip: { id: "d8", name: "Prototype Repo", label: "Prototype Codebase", type: "link", value: "https://github.com/vstoyanov/mediclaim-fork", submittedAt: "2026-11-08 11:31" },
    },
    agentEvaluation: {
      agent1Auditor: {
        status: "completed",
        executionTimeMs: 2400,
        extractedFacts: [
          "Repository commit history consists of a single initial commit containing 18,000 lines of unchanged codebase.",
          "Corpus cross-check flagged a 91% similarity with published thesis artifact 'ClaimGuard' (Patel, 2023).",
        ],
        flags: [
          { severity: "high", category: "Academic Integrity Alert", description: "Over 89% text identity with non-attributed academic publications. Potential violation of originality rules." },
        ],
        fileIntegrityCheck: { totalRequired: 8, totalSubmitted: 8, passedFormatVerification: true },
        rawJsonOutput: { confidenceScore: 0.99, plagiarismRiskDetected: true, flaggedSource: "https://dspace.mit.edu/handle/1721.1/149811" },
      },
      agent2Mentor: {
        status: "completed",
        rubricScores: { problem: 6, aiTools: 2, prototype: 0, leanCanvas: 4, validation: 2, ethics: 1, plan90: 2, demo: 3 },
        strengths: ["Domain concept of dental claim parsing has potential."],
        recommendations: ["Full administrative review required to clarify authorship."],
        diplomaticFeedbackLetter:
          "The submission presents foundational integrity anomalies detected by the Auditor Agent. Evaluation held pending Academic Commission inquiry.",
      },
      humanApproval: {
        approved: false,
        manualStatusOverride: "disqualified",
        approvedBy: "Dr. Elena Rostova",
        timestamp: "2026-11-09 09:30 UTC",
        adminRationale: "Confirmed plagiarism of external uncredited codebase and fabrication of validation interviews. Manual disqualification enforced.",
      },
    },
  },
  {
    id: "sub-005",
    contestId: "contest-bw-2026",
    teamId: "team-epsilon",
    team: {
      id: "team-epsilon",
      name: "OptiRoute AI",
      faculty: "Faculty of Applied Mathematics & Logistics",
      members: [
        { id: "m9", name: "Elena Vassileva", email: "e.vassileva@uni.edu", facultyNumber: "M-33410", major: "Operational Research", studyYear: 4 },
        { id: "m10", name: "Dimitar Kolev", email: "d.kolev@uni.edu", facultyNumber: "F-22891", major: "Computer Science", studyYear: 3 },
      ],
    },
    title: "Dynamic Route Optimization & Fleet Dispatcher for Suburban Couriers",
    summary: "Real-time multi-depot routing agent using urban traffic sensors and weather APIs to minimize suburban delivery carbon footprint and vehicle idle times.",
    totalScore: 0,
    status: "auditing",
    rank: 5,
    deliverables: {
      deck: { id: "d1", name: "Deck", label: "Presentation Deck", type: "file", value: "/docs/optiroute_deck.pdf", filename: "OptiRoute_PitchDeck.pdf", fileSize: "4.8 MB", submittedAt: "2026-11-12 16:10" },
      demo: { id: "d2", name: "Demo", label: "Video Demo", type: "link", value: "https://youtu.be/optiroute-demo", submittedAt: "2026-11-12 16:15" },
      leanCanvas: { id: "d3", name: "Lean Canvas", label: "Lean Canvas Document", type: "file", value: "/docs/optiroute_canvas.pdf", filename: "OptiRoute_LeanCanvas.pdf", fileSize: "1.3 MB", submittedAt: "2026-11-12 16:18" },
      mvp: { id: "d4", name: "MVP Spec", label: "MVP Specification", type: "file", value: "/docs/optiroute_mvp.pdf", filename: "Architecture_VRP_Spec.pdf", fileSize: "2.1 MB", submittedAt: "2026-11-12 16:20" },
      validation: { id: "d5", name: "Validation", label: "Market Validation Proof", type: "file", value: "/docs/optiroute_val.pdf", filename: "Courier_Interviews_Transcript.pdf", fileSize: "2.7 MB", submittedAt: "2026-11-12 16:22" },
      ethics: { id: "d6", name: "Ethics", label: "AI Ethics & GDPR Dossier", type: "file", value: "/docs/optiroute_ethics.pdf", filename: "FleetData_Privacy_Protocol.pdf", fileSize: "750 KB", submittedAt: "2026-11-12 16:23" },
      plan90: { id: "d7", name: "Plan 90", label: "90-Day Execution Plan", type: "file", value: "/docs/optiroute_plan90.pdf", filename: "Pilot_Dispatch_Timeline.pdf", fileSize: "1.1 MB", submittedAt: "2026-11-12 16:25" },
      prototypeZip: { id: "d8", name: "Prototype Repo", label: "Prototype Codebase", type: "link", value: "https://github.com/optiroute/fleet-dispatcher", submittedAt: "2026-11-12 16:27" },
    },
    agentEvaluation: {
      agent1Auditor: {
        status: "in_progress",
        executionTimeMs: 820,
        extractedFacts: [
          "Delivered 8 out of 8 required academic criteria files.",
          "GitHub repository parsed: Python solver with OR-Tools and Gemini 1.5 dispatcher prompt.",
          "Verifying 5 suburban courier interview records in progress...",
        ],
        flags: [],
        fileIntegrityCheck: { totalRequired: 8, totalSubmitted: 8, passedFormatVerification: true },
        rawJsonOutput: {
          confidenceScore: 0.88,
          currentStage: "Cross-referencing telemetry and fuel benchmarks",
          deliverablesHealth: "optimal",
        },
      },
      agent2Mentor: {
        status: "pending",
        rubricScores: {},
        strengths: [],
        recommendations: [],
        diplomaticFeedbackLetter: "",
      },
      humanApproval: {
        approved: false,
      },
    },
  },
];
