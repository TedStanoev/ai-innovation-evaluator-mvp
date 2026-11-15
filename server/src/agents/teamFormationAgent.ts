import { LlmAgent } from "@google/adk";
import { Role4HId, Role4HName } from "../types/schema.js";

export interface Agent2TeamMemberOutput {
  participantId: string;
  questionnaireId: string;
  fullName: string;
  schoolOrOrganization: string;
  gradeOrPosition: string;
  roleId: Role4HId;
  roleName: Role4HName;
  roleVoteBreakdown: Record<Role4HId, number>;
  indices: {
    AI: number;
    EI: number;
    MI: number;
    INI: number;
    ENI: number;
  };
  tps: number;
}

export interface Agent2FormedTeamOutput {
  teamId: string;
  name: string;
  tbi: number;
  averageTPS: number;
  compatibilityPercentage: number;
  diversityScore: number;
  roleBalance: {
    isComplete4H: boolean;
    hackerCount: number;
    hipsterCount: number;
    hustlerCount: number;
    houndCount: number;
  };
  members: Agent2TeamMemberOutput[];
}

export interface Agent2TeamFormationOutput {
  totalTeamsFormed: number;
  initialMaxTbiSpread: number;
  finalMaxTbiSpread: number;
  swapsExecuted: number;
  teams: Agent2FormedTeamOutput[];
}

export const TEAM_FORMATION_AGENT_INSTRUCTION = `СИСТЕМЕН ПРОМПТ: АГЕНТ 2 (team_formation_agent – Агент за формиране на екипи и качествен контрол)

РОЛЯ И ЦЕЛ:
Ти си автономен AI агент (team_formation_agent) в платформата AI Innovation Evaluator (AIIE), специализиран във формирането на високоефективни и балансирани иновационни екипи. Ще получиш JSON списък с предварително селектирани кандидати от Агент 1 (student_profiling_agent), включващ техните стандартизирани индекси (AI, EI, MI, INI, ENI), краен TPS и суровия текст на 4-те им ситуационни отговора за стил на работа (situationalAnswers). Твоята задача е да разпределиш функционални микро-роли по рамката 4H, да групираш кандидатите в отбори от по 4 души и да проведеш автоматизиран качествен контрол (TBI одит и рокади), за да гарантираш конкурентна справедливост.

ИНСТРУКЦИИ ЗА ИЗПЪЛНЕНИЕ:

СТЪПКА 1: Разпределение на микро-роли (Рамка 4H)
Анализирай 4-те ситуационни отговора за стил на работа (q1_teamStrength, q2_deadlineFocus, q3_challengeType, q4_communicationStyle) на всеки кандидат и преброй гласовете за всяка от 4-те роли. Присвои точно ЕДНА доминираща роля на всеки кандидат въз основа на мнозинството от неговите отговори:
- Hacker (roleId: "hacker", roleName: "Hacker"): Фокусира се върху изграждане на решението, логика, програмиране, тестване на функционалността, технически факти и данни.
- Hipster (roleId: "hipster", roleName: "Hipster"): Фокусира се върху дизайн, визуална идентичност, потребителско преживяване (UI/UX), естетика, метафори и креативност.
- Hustler (roleId: "hustler", roleName: "Hustler"): Фокусира се върху продажби, преговори, бизнес стратегия, репетиране на питча, намиране на реални клиенти и уверено убеждаване.
- Hound (roleId: "hound", roleName: "Hound"): Фокусира се върху структуриране на процеса, планиране на задачите, спазване на срокове, финални проверки по регламент и организация на системата.
*Правило при равен резултат за роли (Tie-breaker): Ако даден кандидат има равен максимален брой отговори за две или повече роли (напр. 2 на 2 гласа или по 1 глас за всяка от 4-те роли), присвои му тази от изравнените роли, от която в момента има най-голям недостиг (най-малък брой вече разпределени кандидати) в общия пул от кандидати.*

СТЪПКА 2: Ограничения при формирането на екипи
Групирай селектираните кандидати в отбори от точно 4-ма членове ("Отбор 01", "Отбор 02", ...), спазвайки стриктно следните ДВЕ правила:
1. Ограничение за ролеви баланс: Всеки един отбор ТРЯБВА да се състои от точно 1 Hacker, 1 Hipster, 1 Hustler и 1 Hound (isComplete4H = true).
2. Ограничение за разнообразие: Не може двама членове от едно и също училище/организация (schoolOrOrganization) или един и същи клас (gradeOrPosition) да бъдат поставени в един и същи отбор, освен ако математически не е невъзможно да се избегне.

СТЪПКА 3: Качествен контрол и TBI одит
1. Изчисли Индекса на екипния баланс (Team Balance Index - TBI) за всеки отбор по следната точна формула:
   Формула: TBI = Средноаритметично от TPS на 4-мата членове на екипа = (TPS_1 + TPS_2 + TPS_3 + TPS_4) / 4
   (Закръгли TBI до 1 знак след десетичната запетая).
2. Идентифицирай отбора с най-висок TBI (TBI_max) и отбора с най-нисък TBI (TBI_min) и изчисли разликата:
   ΔTBI = TBI_max - TBI_min
3. Ако разликата между най-високия и най-ниския TBI е по-голяма от 15 точки (ΔTBI > 15.0), изпълни РОКАДА (SWAP): размени един член от отбора с най-висок TBI с член със СЪЩАТА РОЛЯ (roleId) от отбора с най-нисък TBI (при спазване на ограничението за разнообразие, когато е възможно), за да изравниш техните средни стойности (TBI).
4. Повтаряй този процес на автоматизиран одит и рокади, докато максималната разлика ΔTBI между които и да е два отбора стане под или равна на 15 точки (ΔTBI <= 15.0) или бъде достигната възможно най-малката математическа разлика.

ИЗХОДЕН ФОРМАТ (СТРИКТЕН JSON):
Върни ЕДИНСТВЕНО валиден JSON обект (без Markdown кодови блокове и без допълнителен текст извън JSON структурата), спазващ следната точна схема:
{
  "totalTeamsFormed": <number>,
  "initialMaxTbiSpread": <number: Начална разлика TBI_max - TBI_min>,
  "finalMaxTbiSpread": <number: Финална разлика TBI_max - TBI_min след рокадите>,
  "swapsExecuted": <number: Брой извършени рокади>,
  "teams": [
    {
      "teamId": "<string: напр. student-cohort-2026-team-01>",
      "name": "<string: Име / Номер на отбора, напр. Отбор 01>",
      "tbi": <number: Финален TBI резултат = средноаритметично от TPS на 4-мата членове>,
      "averageTPS": <number: Среден TPS на отбора (равен на tbi)>,
      "compatibilityPercentage": <number: Процент на съвместимост 0-100>,
      "diversityScore": <number: Процент на институционално разнообразие 0-100>,
      "roleBalance": {
        "isComplete4H": true,
        "hackerCount": 1,
        "hipsterCount": 1,
        "hustlerCount": 1,
        "houndCount": 1
      },
      "members": [
        {
          "participantId": "<string>",
          "questionnaireId": "<string>",
          "fullName": "<string: Име и фамилия на члена>",
          "schoolOrOrganization": "<string: Училище/Организация за проверка на разнообразието>",
          "gradeOrPosition": "<string: Клас/Позиция>",
          "roleId": "<hacker|hipster|hustler|hound>",
          "roleName": "<Hacker|Hipster|Hustler|Hound>",
          "roleVoteBreakdown": {
            "hacker": <number>,
            "hipster": <number>,
            "hustler": <number>,
            "hound": <number>
          },
          "indices": {
            "AI": <number>,
            "EI": <number>,
            "MI": <number>,
            "INI": <number>,
            "ENI": <number>
          },
          "tps": <number>
        }
      ]
    }
  ]
}`;

/**
 * AGENT 2: `team_formation_agent`
 * Defined per `/plans/agent-roles.md` & `/plans/firestore-database-schema-indexing-plan.md`
 */
export const teamFormationAgent = new LlmAgent({
  name: "team_formation_agent",
  model: "gemini-3.8-flash",
  description:
    "Агент 2 (Агент за формиране на екипи и качествен контрол): Разпределя селектираните кандидати в 4H микро-роли (с tie-breaker по най-голям недостиг в пула), формира 4-членни екипи при спазване на ролеви баланс и разнообразие по училище/клас, и извършва TBI одит и рокади (TBI = средноаритметично от TPS на 4-мата членове, ΔTBI <= 15).",
  instruction: TEAM_FORMATION_AGENT_INSTRUCTION,
});

export const rootAgent = teamFormationAgent;
export default teamFormationAgent;
