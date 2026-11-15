import { QuestionnaireSubmissionInput } from "./types/schema.js";

export const mockQuestionnaires: QuestionnaireSubmissionInput[] = [
  {
    id: "questionnaire-01",
    participantId: "participant-01",
    evaluationId: "student-cohort-2026",
    email: "kaloyan.dimitrov@innovation.edu",
    submittedAt: "2026-03-30T10:00:00Z",
    generalInfo: {
      fullName: "Калоян Димитров",
      schoolOrOrganization: "НТБГ - София",
      gradeOrPosition: "11 В",
    },
    profileMetrics: {
      gpa: 5.85,
      extracurricularCount: 4,
      motivationScoreRaw: 5,
      initiativeScoreRaw: 5,
      entrepreneurialScoreRaw: 5,
    },
    roleAssessmentAnswers: {
      q1_teamStrength: "hustler",
      q2_deadlineFocus: "hustler",
      q3_challengeType: "hustler",
      q4_communicationStyle: "hustler",
    },
  },
  {
    id: "questionnaire-02",
    participantId: "participant-02",
    evaluationId: "student-cohort-2026",
    email: "simona.petrova@innovation.edu",
    submittedAt: "2026-03-30T10:05:00Z",
    generalInfo: {
      fullName: "Симона Петрова",
      schoolOrOrganization: 'СМГ "Паисий Хилендарски"',
      gradeOrPosition: "10 А",
    },
    profileMetrics: {
      gpa: 5.95,
      extracurricularCount: 4,
      motivationScoreRaw: 4,
      initiativeScoreRaw: 4,
      entrepreneurialScoreRaw: 3,
    },
    roleAssessmentAnswers: {
      q1_teamStrength: "hacker",
      q2_deadlineFocus: "hacker",
      q3_challengeType: "hacker",
      q4_communicationStyle: "hacker",
    },
  },
  {
    id: "questionnaire-03",
    participantId: "participant-03",
    evaluationId: "student-cohort-2026",
    email: "martin.georgiev@innovation.edu",
    submittedAt: "2026-03-30T10:10:00Z",
    generalInfo: {
      fullName: "Мартин Георгиев",
      schoolOrOrganization: "Професионална гимназия по дизайн",
      gradeOrPosition: "12 Б",
    },
    profileMetrics: {
      gpa: 4.80,
      extracurricularCount: 3,
      motivationScoreRaw: 5,
      initiativeScoreRaw: 4,
      entrepreneurialScoreRaw: 4,
    },
    roleAssessmentAnswers: {
      q1_teamStrength: "hipster",
      q2_deadlineFocus: "hipster",
      q3_challengeType: "hipster",
      q4_communicationStyle: "hipster",
    },
  },
  {
    id: "questionnaire-04",
    participantId: "participant-04",
    evaluationId: "student-cohort-2026",
    email: "elena.ivanova@innovation.edu",
    submittedAt: "2026-03-30T10:15:00Z",
    generalInfo: {
      fullName: "Елена Иванова",
      schoolOrOrganization: "НФСГ - София",
      gradeOrPosition: "11 Г",
    },
    profileMetrics: {
      gpa: 5.45,
      extracurricularCount: 3,
      motivationScoreRaw: 4,
      initiativeScoreRaw: 5,
      entrepreneurialScoreRaw: 4,
    },
    roleAssessmentAnswers: {
      q1_teamStrength: "hound",
      q2_deadlineFocus: "hound",
      q3_challengeType: "hound",
      q4_communicationStyle: "hound",
    },
  },
  {
    id: "questionnaire-05",
    participantId: "participant-05",
    evaluationId: "student-cohort-2026",
    email: "ivan.georgiev@innovation.edu",
    submittedAt: "2026-03-30T10:20:00Z",
    generalInfo: {
      fullName: "Иван Георгиев",
      schoolOrOrganization: "Първа английска езикова гимназия",
      gradeOrPosition: "10 В",
    },
    profileMetrics: {
      gpa: 5.20,
      extracurricularCount: 2,
      motivationScoreRaw: 4,
      initiativeScoreRaw: 4,
      entrepreneurialScoreRaw: 3,
    },
    roleAssessmentAnswers: {
      q1_teamStrength: "hound",
      q2_deadlineFocus: "hound",
      q3_challengeType: "hound",
      q4_communicationStyle: "hustler",
    },
  },
  {
    id: "questionnaire-06",
    participantId: "participant-06",
    evaluationId: "student-cohort-2026",
    email: "viktoria.marinova@innovation.edu",
    submittedAt: "2026-03-30T10:25:00Z",
    generalInfo: {
      fullName: "Виктория Маринова",
      schoolOrOrganization: "ТУЕС към ТУ - София",
      gradeOrPosition: "11 А",
    },
    profileMetrics: {
      gpa: 5.60,
      extracurricularCount: 3,
      motivationScoreRaw: 5,
      initiativeScoreRaw: 3,
      entrepreneurialScoreRaw: 4,
    },
    roleAssessmentAnswers: {
      q1_teamStrength: "hipster",
      q2_deadlineFocus: "hipster",
      q3_challengeType: "hipster",
      q4_communicationStyle: "hacker",
    },
  },
  {
    id: "questionnaire-07",
    participantId: "participant-07",
    evaluationId: "student-cohort-2026",
    email: "aleksandar.todorov@innovation.edu",
    submittedAt: "2026-03-30T10:30:00Z",
    generalInfo: {
      fullName: "Александър Тодоров",
      schoolOrOrganization: "НПМГ - София",
      gradeOrPosition: "12 Д",
    },
    profileMetrics: {
      gpa: 5.75,
      extracurricularCount: 3,
      motivationScoreRaw: 4,
      initiativeScoreRaw: 3,
      entrepreneurialScoreRaw: 3,
    },
    roleAssessmentAnswers: {
      q1_teamStrength: "hacker",
      q2_deadlineFocus: "hacker",
      q3_challengeType: "hacker",
      q4_communicationStyle: "hound",
    },
  },
  {
    id: "questionnaire-08",
    participantId: "participant-08",
    evaluationId: "student-cohort-2026",
    email: "gabriela.nikolova@innovation.edu",
    submittedAt: "2026-03-30T10:35:00Z",
    generalInfo: {
      fullName: "Габриела Николова",
      schoolOrOrganization: "91. НЕГ - София",
      gradeOrPosition: "10 Б",
    },
    profileMetrics: {
      gpa: 5.40,
      extracurricularCount: 2,
      motivationScoreRaw: 4,
      initiativeScoreRaw: 5,
      entrepreneurialScoreRaw: 5,
    },
    roleAssessmentAnswers: {
      q1_teamStrength: "hustler",
      q2_deadlineFocus: "hustler",
      q3_challengeType: "hustler",
      q4_communicationStyle: "hipster",
    },
  },
];

const API_URL = process.env.API_URL || "http://localhost:4000";

async function seedMockQuestionnaires() {
  console.log(`Posting ${mockQuestionnaires.length} mock questionnaires to ${API_URL}/api/questionnaires...`);

  const response = await fetch(`${API_URL}/api/questionnaires`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      evaluationId: "student-cohort-2026",
      questionnaires: mockQuestionnaires,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`POST /api/questionnaires failed (${response.status}): ${errText}`);
  }

  const data = await response.json();
  console.log(`Successfully created ${data.count} questionnaires & participants in Firestore!`);
  console.log(`Evaluation ID: ${data.evaluationId}`);
  console.log(
    "Participants created:",
    data.participants.map((p: { id: string; fullName: string; role: null }) => ({
      id: p.id,
      fullName: p.fullName,
      role: p.role,
    }))
  );
}

seedMockQuestionnaires().catch((err) => {
  console.error(err);
  process.exit(1);
});
