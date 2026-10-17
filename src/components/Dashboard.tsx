import { useMemo, useState } from "react";
import type { OverallSummary, SubjectSummary } from "../lib/types";
import { computeForecast, computeInsights, computeSafeBunkDays, computeSubjectSummary } from "../lib/attendance";
import SubjectCard from "./SubjectCard";
import CalendarHistory from "./CalendarHistory";
import SubjectHistoryModal from "./SubjectHistoryModal";
import { useAttendance } from "../context/AttendanceContext";

const formatValue = (value: number) => (Number.isFinite(value) ? value.toFixed(1) : "0.0");

type DashboardProps = {
  summaries: SubjectSummary[];
  overall: OverallSummary;
  scope: "month" | "all";
  monthKey: string;
  onScopeChange: (scope: "month" | "all") => void;
  onMonthChange: (month: string) => void;
  onSelectTab: (tab: "dashboard" | "timetable" | "daily") => void;
};

export default function Dashboard({
  summaries,
  overall,
  scope,
  monthKey,
  onScopeChange,
  onMonthChange,
  onSelectTab,
}: DashboardProps) {
  const { state, setState } = useAttendance();
  const [activeSubjectHistoryId, setActiveSubjectHistoryId] = useState<string | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [showOtherSafeDates, setShowOtherSafeDates] = useState(false);
  const [safeBunkSubjectId, setSafeBunkSubjectId] = useState("");
  const attendedPercent = overall.total === 0 ? 0 : (overall.attended / overall.total) * 100;
  const missedPercent = overall.total === 0 ? 0 : 100 - attendedPercent;
  const insights = useMemo(
    () => computeInsights(state, scope === "month" ? monthKey : undefined),
    [state, scope, monthKey]
  );
  const forecast = useMemo(
    () => computeForecast(state, scope === "month" ? monthKey : undefined),
    [state, scope, monthKey]
  );
  const monthlySummary = useMemo(
    () => computeSubjectSummary(state, monthKey),
    [state, monthKey]
  );
  const safeBunk = useMemo(
    () =>
      computeSafeBunkDays(
        state,
        scope === "month" ? monthKey : undefined,
        safeBunkSubjectId || undefined,
        monthlySummary.overall
      ),
    [state, scope, monthKey, safeBunkSubjectId, monthlySummary.overall]
  );
  const resolvedSubjectId =
    selectedSubjectId || summaries[0]?.subjectId || state.subjects[0]?.id || "";
  const selectedSummary = summaries.find((summary) => summary.subjectId === resolvedSubjectId);
  const selectedSubject = state.subjects.find((subject) => subject.id === resolvedSubjectId);
  const selectedForecast = forecast.subjectForecasts.find(
    (item) => item.subjectId === resolvedSubjectId
  );
  const mostMissedSubject = insights.mostMissedSubjectId
    ? state.subjects.find((subject) => subject.id === insights.mostMissedSubjectId)
    : null;

  const historySubject = activeSubjectHistoryId
    ? state.subjects.find((subject) => subject.id === activeSubjectHistoryId) ?? null
    : null;

  const historyEntries = useMemo(() => {
    if (!activeSubjectHistoryId) return [] as { dateKey: string; status: "attended" | "missed" | "cancelled"; note?: string }[];
    return Object.entries(state.logs)
      .filter(([dateKey]) => (scope === "month" ? dateKey.startsWith(monthKey) : true))
      .map(([dateKey, daily]) => ({
        dateKey,
        status: daily[activeSubjectHistoryId],
        note: state.notes?.[dateKey]?.[activeSubjectHistoryId] ?? "",
      }))
      .filter((entry) => Boolean(entry.status))
      .sort((a, b) => b.dateKey.localeCompare(a.dateKey)) as {
      dateKey: string;
      status: "attended" | "missed" | "cancelled";
      note?: string;
    }[];
  }, [activeSubjectHistoryId, monthKey, scope, state.logs, state.notes]);

  const updateHistoryStatus = (dateKey: string, status: "attended" | "missed" | "cancelled") => {
    if (!activeSubjectHistoryId) return;
    const daily = state.logs[dateKey] ?? {};
    const nextDaily = { ...daily, [activeSubjectHistoryId]: status };
    setState({
      ...state,
      logs: {
        ...state.logs,
        [dateKey]: nextDaily,
      },
    });
  };

  const updateHistoryNote = (dateKey: string, note: string) => {
    if (!activeSubjectHistoryId) return;
    const notes = state.notes ?? {};
    const dailyNotes = notes[dateKey] ?? {};
    const nextNotes = { ...dailyNotes, [activeSubjectHistoryId]: note };
    setState({
      ...state,
      notes: {
        ...notes,
        [dateKey]: nextNotes,
      },
    });
  };

  if (state.subjects.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Get started</p>
        <h2 className="mt-3 text-2xl font-semibold text-slate-900 dark:text-slate-100">
          Add your subjects to begin tracking.
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Set up your semester timetable and the dashboard will auto-calculate your attendance.
        </p>
        <button
          onClick={() => onSelectTab("timetable")}
          className="mt-6 rounded-full bg-slate-900 px-5 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900"
        >
          Go to Timetable
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold">Overall attendance</p>
              <p className="mt-1 text-sm text-slate-500">
                {scope === "month" ? "Monthly" : "All time"} • {overall.attended} attended • {overall.missed} missed • {overall.total} total
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onScopeChange("month")}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                  scope === "month"
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                    : "border border-slate-200 text-slate-500 hover:border-slate-400 dark:border-slate-700 dark:text-slate-300"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => onScopeChange("all")}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                  scope === "all"
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                    : "border border-slate-200 text-slate-500 hover:border-slate-400 dark:border-slate-700 dark:text-slate-300"
                }`}
              >
                All time
              </button>
              {scope === "month" && (
                <input
                  type="month"
                  value={monthKey}
                  onChange={(event) => onMonthChange(event.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 shadow-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                />
              )}
            </div>
          </div>
          <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row">
            <div
              className="relative h-36 w-36 rounded-full"
              style={{
                background: `conic-gradient(#10B981 ${attendedPercent}%, #F43F5E 0)`
              }}
            >
              <div className="absolute inset-3 rounded-full bg-white dark:bg-slate-900" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <p className="text-3xl font-semibold">{formatValue(attendedPercent)}%</p>
                <p className="text-xs text-slate-500">Attendance</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Attended ({formatValue(attendedPercent)}%)
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                <span className="h-2 w-2 rounded-full bg-rose-400" />
                Missed ({formatValue(missedPercent)}%)
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm font-semibold">Next steps</p>
          <p className="mt-1 text-sm text-slate-500">
            Review subjects below target and log today’s classes.
          </p>
          <div className="mt-5 space-y-4 text-sm text-slate-600 dark:text-slate-300">
            {summaries.slice(0, 3).map((summary) => {
              const subject = state.subjects.find((item) => item.id === summary.subjectId);
              if (!subject) return null;
              const safe = summary.percentage >= state.target;
              return (
                <div key={summary.subjectId} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: subject.color }} />
                    <span>{subject.name}</span>
                  </div>
                  <span className={safe ? "text-emerald-500" : "text-rose-500"}>
                    {formatValue(summary.percentage)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold">Subject-wise breakdown</p>
            <p className="mt-1 text-sm text-slate-500">
              Select a subject to see need-to-attend and bunkable counts.
            </p>
          </div>
          <select
            value={resolvedSubjectId}
            onChange={(event) => setSelectedSubjectId(event.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 shadow-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            {state.subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>
        {selectedSubject && selectedSummary && (
          <button
            type="button"
            onClick={() => setActiveSubjectHistoryId(selectedSubject.id)}
            className="mt-5 w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 text-left text-sm transition hover:border-slate-200 dark:border-slate-800 dark:bg-slate-950"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: selectedSubject.color }} />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    {selectedSubject.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    Total logged: {selectedSummary.total} • Attendance: {formatValue(selectedSummary.percentage)}%
                  </p>
                </div>
              </div>
              <span
                className={
                  selectedSummary.percentage >= state.target
                    ? "text-emerald-500"
                    : "text-rose-500"
                }
              >
                {selectedSummary.percentage >= state.target ? "Safe" : "Risk"}
              </span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-100 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Upcoming</p>
                <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {selectedForecast?.upcoming ?? 0}
                </p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Need to attend</p>
                <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {selectedForecast?.required ?? 0}
                </p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Can skip</p>
                <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {selectedForecast?.bunkable ?? 0}
                </p>
              </div>
            </div>
            {selectedForecast?.unreachable && (
              <p className="mt-3 text-xs text-rose-500">
                Target unreachable this month based on upcoming classes.
              </p>
            )}
          </button>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        {safeBunk.best ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold">Safe bunk available</p>
              <p className="mt-2 text-lg font-semibold">
                🎉 {safeBunk.best.label}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {safeBunk.best.isHoliday
                  ? "Holiday (no classes scheduled)."
                  : `You can skip ${safeBunk.best.classCount} class${safeBunk.best.classCount !== 1 ? "es" : ""}${
                      safeBunkSubjectId && selectedSubject ? ` in ${selectedSubject.name}` : ""
                    } and stay above ${state.target}%.`}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Skipping this leaves you at {formatValue(safeBunk.best.finalPercentage)}%.
              </p>
            </div>
            {safeBunk.others.length > 0 && (
              <button
                type="button"
                onClick={() => setShowOtherSafeDates((prev) => !prev)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-300"
              >
                {showOtherSafeDates ? "Hide other safe dates" : "See other safe dates"}
              </button>
            )}
          </div>
        ) : (
          <div>
            <p className="text-sm font-semibold">Safe bunk available</p>
            <p className="mt-2 text-sm text-slate-500">
              No safe bunk days found for this month.
            </p>
          </div>
        )}
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-400">Filter by subject</p>
          <select
            value={safeBunkSubjectId}
            onChange={(event) => {
              setSafeBunkSubjectId(event.target.value);
              setShowOtherSafeDates(false);
            }}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 shadow-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <option value="">All subjects</option>
            {state.subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>
        {showOtherSafeDates && safeBunk.others.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {safeBunk.others.map((day) => (
              <span
                key={day.dateKey}
                className="rounded-full border border-slate-200 px-3 py-1 text-[11px] font-semibold text-slate-500 dark:border-slate-700 dark:text-slate-300"
              >
                {day.label}{day.isHoliday ? " (Holiday)" : ""}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm font-semibold">Insights</p>
          <p className="mt-1 text-sm text-slate-500">Streaks and most missed subject.</p>
          <div className="mt-5 grid gap-3 sm:mt-6 sm:gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950 sm:p-4">
              <div className="flex items-center gap-2 text-slate-400">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M12 3v6l4 2" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="12" r="9" />
                </svg>
                <p className="text-xs uppercase tracking-[0.2em]">Current streak</p>
              </div>
              <p className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-100 sm:text-2xl">
                {insights.currentStreak}
              </p>
              <p className="text-xs text-slate-500">day{insights.currentStreak === 1 ? "" : "s"}</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950 sm:p-4">
              <div className="flex items-center gap-2 text-slate-400">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M5 20h14" strokeLinecap="round" />
                  <path d="M7 20l1-7 4 3 4-6 1 10" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p className="text-xs uppercase tracking-[0.2em]">Best streak</p>
              </div>
              <p className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-100 sm:text-2xl">
                {insights.bestStreak}
              </p>
              <p className="text-xs text-slate-500">day{insights.bestStreak === 1 ? "" : "s"}</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950 sm:p-4">
              <div className="flex items-center gap-2 text-slate-400">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M12 4v10" strokeLinecap="round" />
                  <path d="M8 14l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M4 20h16" strokeLinecap="round" />
                </svg>
                <p className="text-xs uppercase tracking-[0.2em]">Most missed</p>
              </div>
              <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100 sm:text-xl">
                {mostMissedSubject ? mostMissedSubject.name : "-"}
              </p>
              <p className="text-xs text-slate-500">subject</p>
            </div>
          </div>
      </div>

      <CalendarHistory state={state} monthKey={monthKey} onMonthChange={onMonthChange} />

      <div className="mt-2 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {summaries.map((summary) => {
          const subject = state.subjects.find((item) => item.id === summary.subjectId);
          if (!subject) return null;
          return (
            <SubjectCard
              key={summary.subjectId}
              subject={subject}
              summary={summary}
              target={state.target}
              onSelect={setActiveSubjectHistoryId}
            />
          );
        })}
      </div>

      <SubjectHistoryModal
        open={Boolean(activeSubjectHistoryId)}
        subject={historySubject}
        entries={historyEntries}
        onUpdateStatus={updateHistoryStatus}
        onUpdateNote={updateHistoryNote}
        onClose={() => setActiveSubjectHistoryId(null)}
      />
    </div>
  );
}
