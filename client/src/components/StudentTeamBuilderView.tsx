import React, { useEffect, useState } from "react";
import {
  Sparkles,
  Users,
  Cpu,
  Terminal,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Award,
  School,
  TrendingUp,
  ShieldCheck,
  RotateCw,
  UserCheck,
  Lightbulb,
  BarChart3,
  CalendarCheck,
  Crown,
} from "lucide-react";
import {
  CohortEvaluationState,
  EvaluatedStudentProfile,
  FormedTeam,
  StudentQuestionnaire,
  TeamRole,
  ThoughtLogEntry,
} from "../types";
import { mockStudents } from "../data/mockStudents";
import { startStudentCohortEvaluation } from "../utils/api";
import { subscribeToCohortEvaluation } from "../utils/firebase";

const COHORT_ID = "student-cohort-2026";

const ROLE_STYLES: Record<
  TeamRole,
  {
    bg: string;
    text: string;
    border: string;
    badgeBg: string;
    description: string;
    Icon: React.ComponentType<{ className?: string }>;
  }
> = {
  Лидер: {
    bg: "bg-[#d8421a]/[0.07]",
    text: "text-[#134c73]",
    border: "border-[#d8421a]/30",
    badgeBg: "bg-[#d8421a] text-[#f8f8f8]",
    description: "Управление, презентиране, комуникация",
    Icon: Crown,
  },
  Новатор: {
    bg: "bg-[#ca7552]/[0.10]",
    text: "text-[#134c73]",
    border: "border-[#ca7552]/35",
    badgeBg: "bg-[#ca7552] text-[#f8f8f8]",
    description: "Креативност, идеи, дизайн",
    Icon: Lightbulb,
  },
  Аналитик: {
    bg: "bg-[#134c73]/[0.07]",
    text: "text-[#134c73]",
    border: "border-[#134c73]/25",
    badgeBg: "bg-[#134c73] text-[#f8f8f8]",
    description: "Логика, данни, финанси",
    Icon: BarChart3,
  },
  Организатор: {
    bg: "bg-[#58839a]/[0.10]",
    text: "text-[#134c73]",
    border: "border-[#58839a]/35",
    badgeBg: "bg-[#58839a] text-[#f8f8f8]",
    description: "Изпълнение на терен, срокове, логистика",
    Icon: CalendarCheck,
  },
};

export default function StudentTeamBuilderView() {
  const [students] = useState<StudentQuestionnaire[]>(mockStudents);
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [status, setStatus] = useState<CohortEvaluationState["status"]>("pending");
  const [thoughtLogs, setThoughtLogs] = useState<ThoughtLogEntry[]>([]);
  const [evaluatedStudents, setEvaluatedStudents] = useState<EvaluatedStudentProfile[]>([]);
  const [teams, setTeams] = useState<FormedTeam[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToCohortEvaluation(COHORT_ID, (remoteState) => {
      if (remoteState.status) {
        setStatus(remoteState.status);
        if (remoteState.status === "evaluated" || remoteState.status === "needs_review") {
          setIsAnalyzing(false);
        } else if (remoteState.status === "analyzing" || remoteState.status === "auditing") {
          setIsAnalyzing(true);
        }
      }
      if (remoteState.thoughtLogs) {
        setThoughtLogs(remoteState.thoughtLogs);
      }
      if (remoteState.evaluatedStudents) {
        setEvaluatedStudents(remoteState.evaluatedStudents);
      }
      if (remoteState.teams) {
        setTeams(remoteState.teams);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleAnalyzeClick = async () => {
    setErrorMessage(null);
    setIsAnalyzing(true);
    setStatus("analyzing");
    setThoughtLogs([
      {
        agent: "Profiling Agent",
        step: "Изпращане на заявка",
        message: `Изпращане на ${students.length} ученически въпросника към сървъра за AI анализ...`,
        timestamp: new Date().toISOString(),
      },
    ]);
    setEvaluatedStudents([]);
    setTeams([]);

    try {
      await startStudentCohortEvaluation(COHORT_ID, students);
    } catch (err) {
      setIsAnalyzing(false);
      setStatus("pending");
      setErrorMessage(
        err instanceof Error
          ? `Грешка при свързване със сървъра: ${err.message}`
          : "Сървърът не е достъпен. Уверете се, че бекендът работи на порт 4000."
      );
    }
  };

  const getEvaluatedProfile = (studentId: string): EvaluatedStudentProfile | undefined =>
    evaluatedStudents.find((p) => p.studentId === studentId);

  return (
    <div className="space-y-8 pb-12 text-[#134c73]">
      {/* Page Hero & Analyze Trigger - Digital Innovation Palette Mesh Banner */}
      <div
        className="relative rounded-2xl border border-[#abb5bb]/60 overflow-hidden shadow-md"
        style={{
          background:
            "radial-gradient(120% 140% at 92% 18%, #d8421a 0%, #ca7552 34%, transparent 68%), radial-gradient(110% 130% at 12% 85%, #134c73 0%, #58839a 48%, #abb5bb 100%)",
        }}
      >
        {/* Subtle organic wave overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-25"
          style={{
            background:
              "radial-gradient(circle at 25% 20%, #f8f8f8 0%, transparent 45%), radial-gradient(circle at 75% 75%, #134c73 0%, transparent 55%)",
          }}
        />

        <div className="relative z-10 p-6 md:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#f8f8f8]/95 border border-[#abb5bb]/60 text-[#134c73] text-xs font-semibold shadow-2xs">
              <Cpu className="h-3.5 w-3.5 text-[#d8421a]" />
              <span>Google ADK • Multi-Agent Student Profiling & Team Formation</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#f8f8f8] tracking-tight drop-shadow-xs">
              AI Оценка на Ученически Въпросници и Формиране на Екипи
            </h1>
            <p className="text-xs md:text-sm text-[#f8f8f8]/90 leading-relaxed">
              Двуфазната AI система анализира попълнените въпросници чрез{" "}
              <span className="font-semibold text-[#f8f8f8] underline decoration-[#ca7552] underline-offset-2">
                Agent 1 (Student Profiling Agent)
              </span>{" "}
              за изчисляване на 6 количествени индекса (AI, MI, EI, ENI, LAI, LPI) и{" "}
              <span className="font-semibold text-[#f8f8f8] underline decoration-[#d8421a] underline-offset-2">
                Agent 2 (Team Formation Agent)
              </span>{" "}
              за изчисляване на общ потенциал (TPS), определяне на екипна роля и разпределяне в
              балансирани отбори със съвместимост (TBI %).
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleAnalyzeClick}
              disabled={isAnalyzing}
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#d8421a] hover:bg-[#ca7552] disabled:bg-[#ca7552]/70 text-[#f8f8f8] font-semibold text-sm shadow-md border border-[#f8f8f8]/25 transition-all cursor-pointer disabled:cursor-not-allowed"
            >
              {isAnalyzing ? (
                <>
                  <RotateCw className="h-4 w-4 animate-spin" />
                  <span>Агентите анализират...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Analyze Students ({students.length})</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Bottom translucent bar inspired by the reference layout */}
        <div className="relative z-10 px-6 md:px-8 py-2.5 bg-[#134c73]/45 backdrop-blur-xs border-t border-[#f8f8f8]/15 flex flex-wrap items-center justify-between gap-3 text-[11px] text-[#f8f8f8]/85">
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 font-semibold text-[#f8f8f8]">
              <span className="h-2 w-2 rounded-full bg-[#d8421a]" />
              ЧАСТ 1–4 Формуляр (15 Въпроса)
            </span>
            <span className="hidden sm:inline text-[#abb5bb]">|</span>
            <span className="hidden sm:inline">6 Профилни Индекса (AI • EI • MI • LAI • LPI • ENI)</span>
          </div>
          <div className="font-mono text-[11px] text-[#f8f8f8]/90">
            4 Роли: Лидер • Новатор • Аналитик • Организатор
          </div>
        </div>

        {errorMessage && (
          <div className="relative z-10 mx-6 mb-5 rounded-xl border border-[#d8421a] bg-[#f8f8f8] px-4 py-3 text-xs text-[#d8421a] font-semibold shadow-2xs">
            {errorMessage}
          </div>
        )}
      </div>

      {/* Students Table Section */}
      <section className="rounded-2xl border border-[#abb5bb]/60 bg-[#f8f8f8] shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-[#abb5bb]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-[#134c73]/10 border border-[#58839a]/30 flex items-center justify-center text-[#134c73]">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#134c73]">
                Списък на Учениците и Попълнени Въпросници
              </h2>
              <p className="text-xs text-[#58839a]">
                Кликнете върху ред или бутона „Въпросник“, за да разгледате всички 15 отговора на ученика
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="px-3 py-1 rounded-full bg-[#abb5bb]/25 text-[#134c73] font-semibold border border-[#abb5bb]/60">
              Общо кандидати: {students.length}
            </span>
            {evaluatedStudents.length > 0 && (
              <span className="px-3 py-1 rounded-full bg-[#ca7552]/15 text-[#d8421a] font-semibold border border-[#ca7552]/40">
                Оценени: {evaluatedStudents.length}/{students.length}
              </span>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#abb5bb]/50 bg-[#134c73] text-[11px] font-semibold uppercase tracking-wider text-[#f8f8f8]">
                <th className="py-3.5 pl-6 pr-3">#</th>
                <th className="py-3.5 px-3">Ученик</th>
                <th className="py-3.5 px-3">Училище и Клас</th>
                <th className="py-3.5 px-3">Успех и Състезания</th>
                <th className="py-3.5 px-3">6 Индекса (Agent 1)</th>
                <th className="py-3.5 px-3">TPS Бал</th>
                <th className="py-3.5 px-3">Екипна Роля (Agent 2)</th>
                <th className="py-3.5 pl-3 pr-6 text-right">Детайли</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#abb5bb]/40 text-xs bg-white">
              {students.map((student, idx) => {
                const profile = getEvaluatedProfile(student.id);
                const isExpanded = expandedStudentId === student.id;
                const roleConfig = profile ? ROLE_STYLES[profile.role] : null;

                return (
                  <React.Fragment key={student.id}>
                    <tr
                      onClick={() =>
                        setExpandedStudentId(isExpanded ? null : student.id)
                      }
                      className={`transition-colors cursor-pointer ${
                        isExpanded
                          ? "bg-[#58839a]/10"
                          : "hover:bg-[#f8f8f8]"
                      }`}
                    >
                      <td className="py-4 pl-6 pr-3 font-mono font-bold text-[#58839a]">
                        {String(idx + 1).padStart(2, "0")}
                      </td>
                      <td className="py-4 px-3">
                        <div className="font-bold text-[#134c73] text-sm">
                          {student.name}
                        </div>
                        <div className="text-[#58839a] text-[11px]">
                          {student.age} г. • {student.email}
                        </div>
                      </td>
                      <td className="py-4 px-3">
                        <div className="font-semibold text-[#134c73] flex items-center gap-1.5">
                          <School className="h-3.5 w-3.5 text-[#58839a] shrink-0" />
                          <span>{student.school}</span>
                        </div>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded bg-[#f8f8f8] border border-[#abb5bb]/50 text-[#134c73] font-mono text-[11px] font-semibold">
                          Клас: {student.grade}
                        </span>
                      </td>
                      <td className="py-4 px-3 max-w-xs">
                        <div className="font-semibold text-[#ca7552]">
                          {student.gpa}
                        </div>
                        <div className="text-[#58839a] text-[11px] line-clamp-1 mt-0.5">
                          {student.competitions}
                        </div>
                      </td>
                      <td className="py-4 px-3">
                        {profile ? (
                          <div className="flex flex-wrap gap-1 max-w-[230px]">
                            {(
                              Object.entries(profile.indices) as [string, number][]
                            ).map(([key, val]) => (
                              <span
                                key={key}
                                className="px-1.5 py-0.5 rounded bg-[#f8f8f8] border border-[#abb5bb]/60 font-mono text-[10px] font-semibold text-[#134c73]"
                              >
                                {key}:{val}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[#abb5bb] italic text-[11px]">
                            Очаква анализ...
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-3">
                        {profile ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#134c73]/10 border border-[#134c73]/25 text-[#134c73] font-mono font-bold text-xs">
                            <TrendingUp className="h-3.5 w-3.5 text-[#d8421a]" />
                            {profile.tps}
                          </span>
                        ) : (
                          <span className="text-[#abb5bb] font-mono">—</span>
                        )}
                      </td>
                      <td className="py-4 px-3">
                        {profile && roleConfig ? (
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-2xs ${roleConfig.badgeBg}`}
                          >
                            <roleConfig.Icon className="h-3.5 w-3.5" />
                            <span>{profile.role}</span>
                          </span>
                        ) : (
                          <span className="text-[#abb5bb] italic text-[11px]">
                            Неопределена
                          </span>
                        )}
                      </td>
                      <td className="py-4 pl-3 pr-6 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedStudentId(isExpanded ? null : student.id);
                          }}
                          className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border font-semibold text-[11px] transition-colors ${
                            isExpanded
                              ? "border-[#d8421a] bg-[#d8421a] text-[#f8f8f8]"
                              : "border-[#abb5bb]/70 bg-[#f8f8f8] hover:bg-[#abb5bb]/25 text-[#134c73]"
                          }`}
                        >
                          <span>Въпросник</span>
                          {isExpanded ? (
                            <ChevronUp className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </td>
                    </tr>

                    {/* Expanded 15 Questionnaire Answers */}
                    {isExpanded && (
                      <tr className="bg-[#f8f8f8]">
                        <td colSpan={8} className="px-6 py-5">
                          <div className="rounded-xl border border-[#abb5bb]/60 bg-white p-5 shadow-xs space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#abb5bb]/40 pb-3">
                              <div>
                                <h3 className="text-sm font-bold text-[#134c73]">
                                  Пълен Въпросник на {student.name} (15 Полета)
                                </h3>
                                <p className="text-xs text-[#58839a]">
                                  {student.school} • Клас {student.grade} • Възраст {student.age} г. •{" "}
                                  {student.email}
                                </p>
                              </div>
                              {profile && (
                                <div className="text-xs font-mono bg-[#134c73] text-[#f8f8f8] px-3 py-1.5 rounded-lg border border-[#58839a]/40">
                                  {profile.rawProfileLine}
                                </div>
                              )}
                            </div>

                            <div className="space-y-4 text-xs">
                              <div>
                                <div className="text-[11px] font-bold uppercase tracking-wider text-[#58839a] mb-2">
                                  ЧАСТ 2: Академичен профил и Опит (Захранва AI и EI)
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                  <div className="p-3 rounded-lg bg-[#f8f8f8] border border-[#abb5bb]/50">
                                    <span className="font-bold text-[#134c73] block mb-0.5">
                                      6. Какъв е средният ти успех от последната завършена учебна година?{" "}
                                      <code className="text-[10px] text-[#d8421a] font-mono">(gpa → AI)</code>
                                    </span>
                                    <span className="text-[#134c73]/85">{student.gpa}</span>
                                  </div>
                                  <div className="p-3 rounded-lg bg-[#f8f8f8] border border-[#abb5bb]/50">
                                    <span className="font-bold text-[#134c73] block mb-0.5">
                                      7. Имаш ли участия в състезания, олимпиади или хакатони през последните 2 години?{" "}
                                      <code className="text-[10px] text-[#d8421a] font-mono">(competitions → AI)</code>
                                    </span>
                                    <span className="text-[#134c73]/85">{student.competitions}</span>
                                  </div>
                                  <div className="p-3 rounded-lg bg-[#f8f8f8] border border-[#abb5bb]/50">
                                    <span className="font-bold text-[#134c73] block mb-0.5">
                                      8. Кое от следните твърдения описва най-точно твоя извънкласен опит до момента?{" "}
                                      <code className="text-[10px] text-[#d8421a] font-mono">(experience → EI)</code>
                                    </span>
                                    <span className="text-[#134c73]/85">{student.experience}</span>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <div className="text-[11px] font-bold uppercase tracking-wider text-[#58839a] mb-2">
                                  ЧАСТ 3: Мотивация и Потенциал (Захранва MI, LAI, LPI, ENI)
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <div className="p-3 rounded-lg bg-[#f8f8f8] border border-[#abb5bb]/50">
                                    <span className="font-bold text-[#134c73] block mb-0.5">
                                      9. Каква е основната ти мотивация да кандидатстваш за тази програма?{" "}
                                      <code className="text-[10px] text-[#d8421a] font-mono">(motivation → MI)</code>
                                    </span>
                                    <span className="text-[#134c73]/85">{student.motivation}</span>
                                  </div>
                                  <div className="p-3 rounded-lg bg-[#f8f8f8] border border-[#abb5bb]/50">
                                    <span className="font-bold text-[#134c73] block mb-0.5">
                                      10. Как реагираш, когато се сблъскаш с проблем или тема, която ти е напълно непозната?{" "}
                                      <code className="text-[10px] text-[#d8421a] font-mono">(problemSolving → LAI)</code>
                                    </span>
                                    <span className="text-[#134c73]/85">{student.problemSolving}</span>
                                  </div>
                                  <div className="p-3 rounded-lg bg-[#f8f8f8] border border-[#abb5bb]/50">
                                    <span className="font-bold text-[#134c73] block mb-0.5">
                                      11. Представи си, че работиш в екип и възниква сериозен спор относно посоката на проекта. Каква е твоята реакция?{" "}
                                      <code className="text-[10px] text-[#d8421a] font-mono">(teamConflict → LPI)</code>
                                    </span>
                                    <span className="text-[#134c73]/85">{student.teamConflict}</span>
                                  </div>
                                  <div className="p-3 rounded-lg bg-[#f8f8f8] border border-[#abb5bb]/50">
                                    <span className="font-bold text-[#134c73] block mb-0.5">
                                      12. Твоят екип разполага с 200 лева начален бюджет за реализация на идея. Какво предлагаш да направите с тях?{" "}
                                      <code className="text-[10px] text-[#d8421a] font-mono">(budget200 → ENI)</code>
                                    </span>
                                    <span className="text-[#134c73]/85">{student.budget200}</span>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <div className="text-[11px] font-bold uppercase tracking-wider text-[#d8421a] mb-2">
                                  ЧАСТ 4: Екипен профил (Захранва Доминираща роля: Новатор, Аналитик, Лидер, Организатор)
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                  <div className="p-3 rounded-lg bg-[#ca7552]/10 border border-[#ca7552]/35">
                                    <span className="font-bold text-[#134c73] block mb-0.5">
                                      13. Започвате работа по нов групов проект от нулата. Коя роля поемаш най-естествено?{" "}
                                      <code className="text-[10px] text-[#d8421a] font-mono">(newProjectRole)</code>
                                    </span>
                                    <span className="text-[#134c73]/90">{student.newProjectRole}</span>
                                  </div>
                                  <div className="p-3 rounded-lg bg-[#ca7552]/10 border border-[#ca7552]/35">
                                    <span className="font-bold text-[#134c73] block mb-0.5">
                                      14. Остават 48 часа до крайния срок за предаване на проекта, но екипът изостава сериозно. Какво правиш?{" "}
                                      <code className="text-[10px] text-[#d8421a] font-mono">(hours48Role)</code>
                                    </span>
                                    <span className="text-[#134c73]/90">{student.hours48Role}</span>
                                  </div>
                                  <div className="p-3 rounded-lg bg-[#ca7552]/10 border border-[#ca7552]/35">
                                    <span className="font-bold text-[#134c73] block mb-0.5">
                                      15. Влизаш в голям, модерен магазин, но вътре няма почти никакви клиенти. Каква е първата ти мисъл и какво би променил?{" "}
                                      <code className="text-[10px] text-[#d8421a] font-mono">(storeCaseRole)</code>
                                    </span>
                                    <span className="text-[#134c73]/90">{student.storeCaseRole}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Live AI Agents Thought Process Stream */}
      {(thoughtLogs.length > 0 || isAnalyzing) && (
        <section className="rounded-2xl border border-[#58839a]/50 bg-[#134c73] text-[#f8f8f8] shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-[#58839a]/40 flex items-center justify-between bg-[#0e3957]">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-[#d8421a]/25 border border-[#ca7552]/50 flex items-center justify-center text-[#f8f8f8]">
                <Terminal className="h-4 w-4 text-[#ca7552]" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#f8f8f8] flex items-center gap-2">
                  <span>Мисловен Процес на AI Агентите (Live Agent Thoughts)</span>
                  {isAnalyzing && (
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-mono bg-[#d8421a] text-[#f8f8f8] px-2.5 py-0.5 rounded-full">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#f8f8f8] animate-ping" />
                      WORKING LIVE
                    </span>
                  )}
                </h2>
                <p className="text-[11px] text-[#abb5bb]">
                  Реално проследяване на всяка стъпка от Agent 1 (Student Profiling) и Agent 2 (Team Formation)
                </p>
              </div>
            </div>

            <span className="text-xs font-mono text-[#abb5bb]">
              {thoughtLogs.length} стъпки записани
            </span>
          </div>

          <div className="p-6 space-y-3 max-h-[420px] overflow-y-auto font-mono text-xs">
            {thoughtLogs.map((log, index) => {
              const isAgent1 = log.agent.includes("Profiling") || log.agent === "Analyzer";
              return (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3.5 rounded-xl bg-[#0e3957]/90 border border-[#58839a]/35"
                >
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shrink-0 mt-0.5 ${
                      isAgent1
                        ? "bg-[#58839a]/35 text-[#f8f8f8] border border-[#abb5bb]/40"
                        : "bg-[#d8421a]/30 text-[#f8f8f8] border border-[#ca7552]/50"
                    }`}
                  >
                    {log.agent}
                  </span>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-[#ca7552]">
                        ▶ {log.step}
                      </span>
                      <span className="text-[10px] text-[#abb5bb]">
                        {log.timestamp.slice(11, 19)} UTC
                      </span>
                    </div>
                    <p className="text-[#f8f8f8]/95 leading-relaxed font-sans text-xs">
                      {log.message}
                    </p>
                  </div>
                </div>
              );
            })}

            {isAnalyzing && (
              <div className="flex items-center gap-2.5 text-[#ca7552] text-xs p-3 animate-pulse">
                <RotateCw className="h-4 w-4 animate-spin" />
                <span>Агентите обработват следващата стъпка...</span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Balanced Team Cards Section */}
      {teams.length > 0 && (
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-[#d8421a]/15 border border-[#d8421a]/30 flex items-center justify-center">
                <Award className="h-5 w-5 text-[#d8421a]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#134c73]">
                  Сформирани Балансирани Екипи ({teams.length})
                </h2>
                <p className="text-xs text-[#58839a]">
                  Всеки екип е съставен от 4 допълващи се роли (Лидер, Новатор, Аналитик, Организатор) с изчислен процент на съвместимост (Team Balance Index)
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {teams.map((team) => (
              <div
                key={team.id}
                className="rounded-2xl border border-[#abb5bb]/60 bg-white shadow-sm overflow-hidden"
              >
                {/* Team Card Header with % Compatibility */}
                <div
                  className="px-6 py-5 text-[#f8f8f8] flex flex-col md:flex-row md:items-center justify-between gap-4"
                  style={{
                    background:
                      "linear-gradient(105deg, #134c73 0%, #58839a 52%, #ca7552 84%, #d8421a 100%)",
                  }}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 rounded-lg bg-[#f8f8f8]/15 border border-[#f8f8f8]/30 text-[#f8f8f8] font-mono text-xs font-bold">
                        {team.name}
                      </span>
                      <h3 className="text-lg font-bold tracking-tight text-[#f8f8f8]">
                        Балансиран Иновационен Отбор ({team.members.length} членове)
                      </h3>
                    </div>
                    <p className="text-xs text-[#f8f8f8]/85">{team.rationale}</p>
                  </div>

                  {/* Compatibility % Badge & Progress */}
                  <div className="flex items-center gap-4 bg-[#134c73]/55 backdrop-blur-xs border border-[#f8f8f8]/25 rounded-xl px-4 py-3 shrink-0">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-[#abb5bb] font-semibold">
                        Съвместимост (Compatibility)
                      </div>
                      <div className="text-2xl font-extrabold font-mono text-[#f8f8f8] flex items-center gap-1.5">
                        <ShieldCheck className="h-5 w-5 text-[#ca7552]" />
                        <span>{team.compatibilityPercent}%</span>
                      </div>
                    </div>
                    <div className="h-10 w-px bg-[#f8f8f8]/20 hidden sm:block" />
                    <div className="space-y-1 text-[11px] text-[#f8f8f8]/90 font-mono">
                      <div>Ролеви баланс: {team.roleBalanceScore}%</div>
                      <div>Среден TPS: {team.averageTps} т.</div>
                      <div>Разнообразие: {team.diversityScore}%</div>
                    </div>
                  </div>
                </div>

                {/* Compatibility Breakdown Progress Bar */}
                <div className="px-6 py-3 bg-[#f8f8f8] border-b border-[#abb5bb]/40 flex flex-wrap items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-2 font-medium text-[#134c73]">
                    <CheckCircle2 className="h-4 w-4 text-[#d8421a]" />
                    <span>
                      Формула за съвместимост (TBI): 40% Ролеви баланс ({team.roleBalanceScore}%) + 40%
                      Среден TPS ({team.averageTps}) + 20% Класово разнообразие ({team.diversityScore}%)
                    </span>
                  </div>
                  <div className="w-full sm:w-56 h-2.5 rounded-full bg-[#abb5bb]/40 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, team.compatibilityPercent)}%`,
                        background: "linear-gradient(90deg, #134c73 0%, #58839a 40%, #ca7552 75%, #d8421a 100%)",
                      }}
                    />
                  </div>
                </div>

                {/* Team Members Grid (4 Roles) */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-[#f8f8f8]/50">
                  {team.members.map((member) => {
                    const roleStyle = ROLE_STYLES[member.role] || ROLE_STYLES.Лидер;
                    const RoleIcon = roleStyle.Icon;

                    return (
                      <div
                        key={member.studentId}
                        className={`rounded-xl border ${roleStyle.border} ${roleStyle.bg} p-4 flex flex-col justify-between space-y-4 shadow-2xs`}
                      >
                        <div className="space-y-3">
                          {/* Role Badge & TPS */}
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${roleStyle.badgeBg}`}
                            >
                              <RoleIcon className="h-3.5 w-3.5" />
                              <span>{member.role}</span>
                            </span>
                            <span className="font-mono text-xs font-bold bg-white px-2.5 py-1 rounded-lg border border-[#abb5bb]/60 text-[#134c73]">
                              TPS: {member.tps}
                            </span>
                          </div>

                          {/* Member Info */}
                          <div>
                            <h4 className="text-base font-bold text-[#134c73] flex items-center gap-1.5">
                              <UserCheck className="h-4 w-4 text-[#58839a] shrink-0" />
                              <span>{member.name}</span>
                            </h4>
                            <p className="text-xs text-[#134c73]/85 font-medium mt-0.5">
                              {member.school}
                            </p>
                            <p className="text-[11px] text-[#58839a] font-mono mt-0.5">
                              Клас: {member.grade} • {member.age} г.
                            </p>
                          </div>

                          <p className="text-[11px] text-[#58839a] italic">
                            {roleStyle.description}
                          </p>
                        </div>

                        {/* 6 Indices Breakdown */}
                        <div className="pt-3 border-t border-[#abb5bb]/50">
                          <div className="text-[10px] font-semibold uppercase tracking-wider text-[#58839a] mb-1.5">
                            Профилни Индекси (0-100):
                          </div>
                          <div className="grid grid-cols-3 gap-1.5">
                            {(
                              Object.entries(member.indices) as [string, number][]
                            ).map(([k, v]) => (
                              <div
                                key={k}
                                className="bg-white/95 border border-[#abb5bb]/50 rounded px-2 py-1 text-center"
                              >
                                <span className="block text-[9px] text-[#58839a] font-mono uppercase">
                                  {k}
                                </span>
                                <span className="text-xs font-bold font-mono text-[#134c73]">
                                  {v}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Status Footer when idle */}
      {status === "pending" && teams.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[#abb5bb] bg-[#f8f8f8] p-8 text-center space-y-2">
          <Sparkles className="h-8 w-8 text-[#d8421a] mx-auto" />
          <h3 className="text-sm font-bold text-[#134c73]">
            Готови за AI Анализ и Формиране на Екипи
          </h3>
          <p className="text-xs text-[#58839a] max-w-md mx-auto">
            Натиснете бутона <strong className="text-[#d8421a]">Analyze Students ({students.length})</strong> горе вдясно, за да
            стартирате двата AI агента и да видите техните мисли и сформираните отбори със съвместимост в
            реално време.
          </p>
        </div>
      )}
    </div>
  );
}
