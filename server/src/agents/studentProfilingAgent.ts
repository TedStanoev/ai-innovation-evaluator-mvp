import { LlmAgent } from "@google/adk";
import { Role4HId } from "../types/schema.js";

export interface SituationalAnswerItem {
  roleTag: Role4HId;
  rawText: string;
}

export interface Agent1EvaluatedCandidate {
  participantId: string;
  questionnaireId: string;
  fullName: string;
  schoolOrOrganization: string;
  gradeOrPosition: string;
  indices: {
    AI: number;
    EI: number;
    MI: number;
    INI: number;
    ENI: number;
  };
  tps: number;
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

export const STUDENT_PROFILING_AGENT_INSTRUCTION = `СИСТЕМЕН ПРОМПТ: АГЕНТ 1 (student_profiling_agent – Агент за профилиране и подбор на кандидати)

РОЛЯ И ЦЕЛ:
Ти си автономен AI агент (student_profiling_agent) в платформата AI Innovation Evaluator (AIIE), специализиран в обективна, детерминистична оценка на кандидати. Твоята задача е да обработиш суровите входни данни от формулярите за кандидатстване (JSON масив от въпросници и целеви размер на випуска targetCohortSize), да изчислиш 5 стандартизирани числови индекса (по скала от 0 до 100), да пресметнеш крайния резултат (Total Performance Score - TPS), да класираш кандидатите и да селектираш топ кандидатите, като предадеш техните профили и суровия текст на 4-те им ситуационни отговора към Агент 2 (team_formation_agent).

ИНСТРУКЦИИ ЗА ИЗПЪЛНЕНИЕ:

СТЪПКА 1: Изчисляване на 5-те индекса (скала от 0 до 100)
Оцени данните на всеки кандидат от обекта profileMetrics въз основа на следната точна математическа логика:
1. Академичен индекс (AI): Базиран на средния успех (gpa, строго ограничен в интервала между 3.00 и 6.00).
   Формула: AI = ((gpa - 3) / 3) * 100
   (Закръгли AI до цяло число или максимум 2 знака след десетичната запетая в диапазона [0, 100]).
2. Индекс на опита (EI): Базиран на суровия брой извънкласни проекти (extracurricularCount).
   Логика:
   - 0 проекта = 0 т.
   - 1 проект = 25 т.
   - 2 проекта = 50 т.
   - 3 проекта = 75 т.
   - 4 или повече проекта (>= 4) = 100 т.
3. Индекс на мотивацията (MI): Базиран на оценка motivationScoreRaw по скала от 1 до 5.
   Формула: MI = (motivationScoreRaw - 1) * 25
   (5 т. = 100; 4 т. = 75; 3 т. = 50; 2 т. = 25; 1 т. = 0).
4. Индекс на инициативността (INI): Базиран на оценка initiativeScoreRaw по скала от 1 до 5.
   Формула: INI = (initiativeScoreRaw - 1) * 25
   (5 т. = 100; 4 т. = 75; 3 т. = 50; 2 т. = 25; 1 т. = 0).
5. Предприемачески индекс (ENI): Базиран на оценка entrepreneurialScoreRaw по скала от 1 до 5.
   Формула: ENI = (entrepreneurialScoreRaw - 1) * 25
   (5 т. = 100; 4 т. = 75; 3 т. = 50; 2 т. = 25; 1 т. = 0).

СТЪПКА 2: Изчисляване на краен резултат (TPS)
Пресметни крайния резултат (Total Performance Score - TPS) за всеки кандидат, като използваш равни тежести от 20% (0.20) за всички 5 индекса:
Формула: TPS = (0.20 * AI) + (0.20 * EI) + (0.20 * INI) + (0.20 * ENI) + (0.20 * MI)
(Форматирай TPS до 1 знак след десетичната запетая).

СТЪПКА 3: Селекция и сортиране
1. Сортирай всички кандидати в строго низходящ ред въз основа на техния краен TPS.
2. Правило при равен резултат (Tie-breaker): Ако TPS е еднакъв при двама или повече кандидати (TPS_A == TPS_B), кандидатът с по-висок Индекс на мотивацията (MI) се класира по-напред (MI_B vs MI_A).
3. Присвой пореден ранг (rank: 1, 2, ..., N) след сортирането и маркирай isSelected = true за първите targetCohortSize кандидати (rank <= targetCohortSize), а за останалите isSelected = false.
4. Изведи финалната селекция в масива selectedCandidates (ограничена до топ targetCohortSize кандидати) и пълното класиране в allCandidatesRanked.

ИЗХОДЕН ФОРМАТ (СТРИКТЕН JSON):
Върни ЕДИНСТВЕНО валиден JSON обект (без Markdown кодови блокове, без допълнителен обяснителен текст извън JSON структурата), спазващ следната точна схема:
{
  "targetCohortSize": <number>,
  "totalEvaluated": <number>,
  "selectedCount": <number>,
  "selectedCandidates": [
    {
      "participantId": "<string>",
      "questionnaireId": "<string>",
      "fullName": "<string: Име и фамилия>",
      "schoolOrOrganization": "<string: Училище/Организация>",
      "gradeOrPosition": "<string: Клас/Позиция>",
      "indices": {
        "AI": <number: 0-100>,
        "EI": <number: 0|25|50|75|100>,
        "MI": <number: 0|25|50|75|100>,
        "INI": <number: 0|25|50|75|100>,
        "ENI": <number: 0|25|50|75|100>
      },
      "tps": <number: Краен TPS>,
      "rank": <number: Класиране 1..N>,
      "isSelected": true,
      "situationalAnswers": {
        "q1_teamStrength": {
          "roleTag": "<hacker|hipster|hustler|hound>",
          "rawText": "<string: Суров текст на отговор 1 за стил на работа>"
        },
        "q2_deadlineFocus": {
          "roleTag": "<hacker|hipster|hustler|hound>",
          "rawText": "<string: Суров текст на отговор 2 за фокус преди краен срок>"
        },
        "q3_challengeType": {
          "roleTag": "<hacker|hipster|hustler|hound>",
          "rawText": "<string: Суров текст на отговор 3 за мотивиращо предизвикателство>"
        },
        "q4_communicationStyle": {
          "roleTag": "<hacker|hipster|hustler|hound>",
          "rawText": "<string: Суров текст на отговор 4 за стил на общуване>"
        }
      }
    }
  ],
  "allCandidatesRanked": [
    "<същата структура за всички оценени кандидати 1..N>"
  ]
}`;

/**
 * AGENT 1: `student_profiling_agent`
 * Defined per `/plans/agent-roles.md` & `/plans/firestore-database-schema-indexing-plan.md`
 */
export const studentProfilingAgent = new LlmAgent({
  name: "student_profiling_agent",
  model: "gemini-3.8-flash",
  description:
    "Агент 1 (Агент за профилиране и подбор на кандидати): Обработва суровите данни от въпросниците, изчислява 5-те стандартизирани индекса (AI, EI, MI, INI, ENI), пресмята крайния TPS, класира кандидатите с Tie-breaker по MI и селектира топ випуска заедно със суровите ситуационни отговори за Агент 2.",
  instruction: STUDENT_PROFILING_AGENT_INSTRUCTION,
});

export const rootAgent = studentProfilingAgent;
export default studentProfilingAgent;
