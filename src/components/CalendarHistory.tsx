import type { AttendanceState, AttendanceStatus, DayKey } from "../lib/types";

const days: DayKey[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const formatMonth = (monthKey: string) => {
  const date = new Date(monthKey + "-01T00:00:00");
  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(date);
};

const getDayKey = (dateKey: string) => {
  const day = new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(
    new Date(dateKey + "T00:00:00")
  );
  return day as DayKey;
};

type CalendarHistoryProps = {
  state: AttendanceState;
  monthKey: string;
  onMonthChange?: (monthKey: string) => void;
};

type DayStatus = "attended" | "missed" | "holiday" | "partial" | "unmarked";

const getStatus = (
  scheduled: string[],
  dailyLog: Record<string, AttendanceStatus> | undefined
): DayStatus => {
  if (scheduled.length === 0) return "holiday";
  
  let missedCount = 0;
  let attendedCount = 0;
  let cancelledCount = 0;
  let unmarkedCount = 0;

  scheduled.forEach((subjectId) => {
    const status = dailyLog?.[subjectId];
    if (!status) {
      unmarkedCount += 1;
      return;
    }
    if (status === "missed") missedCount += 1;
    if (status === "attended") attendedCount += 1;
    if (status === "cancelled") cancelledCount += 1;
  });

  if (unmarkedCount === scheduled.length) return "unmarked";
  if (cancelledCount === scheduled.length) return "holiday";
  if (missedCount > 0) return "missed";
  if (attendedCount > 0 && unmarkedCount === 0) return "attended";
  return "partial";
};

const statusClass: Record<DayStatus, string> = {
  attended: "bg-[#7DD3FC]/80 text-[#0B1020]",
  missed: "bg-rose-500/70 text-white",
  holiday: "bg-slate-600/40 text-slate-100",
  partial: "bg-[#BAE6FD]/80 text-[#0B1020]",
  unmarked: "bg-slate-800/40 text-slate-200",
};

const statusLabel: Record<DayStatus, string> = {
  attended: "All attended",
  missed: "Missed some",
  holiday: "Holiday",
  partial: "Partially attended",
  unmarked: "Not logged",
};

const shiftMonthKey = (monthKey: string, delta: number) => {
  const [year, month] = monthKey.split("-").map(Number);
  const date = new Date(year, month - 1 + delta, 1);
  return date.toISOString().slice(0, 7);
};

export default function CalendarHistory({ state, monthKey, onMonthChange }: CalendarHistoryProps) {
  const firstDate = new Date(monthKey + "-01T00:00:00");
  const year = firstDate.getFullYear();
  const month = firstDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const offset = (firstDay + 6) % 7; // Monday start

  const cells = Array.from({ length: offset + daysInMonth }, (_, index) => {
    if (index < offset) return null;
    const day = index - offset + 1;
    const dateKey = `${monthKey}-${String(day).padStart(2, "0")}`;
    const dayKey = getDayKey(dateKey);
    const scheduled = state.overrides[dateKey] ?? state.timetable[dayKey] ?? [];
    const dailyLog = state.logs[dateKey];
    const status = getStatus(scheduled, dailyLog);
    return { day, dateKey, status };
  });

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold">Calendar history</p>
          <p className="mt-1 text-sm text-slate-500">{formatMonth(monthKey)}</p>
        </div>
        {onMonthChange && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onMonthChange(shiftMonthKey(monthKey, -1))}
              className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500 transition hover:border-slate-400 hover:text-slate-800 dark:border-slate-700 dark:text-slate-300"
              aria-label="Previous month"
            >
              Prev
            </button>
            <button
              onClick={() => onMonthChange(shiftMonthKey(monthKey, 1))}
              className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500 transition hover:border-slate-400 hover:text-slate-800 dark:border-slate-700 dark:text-slate-300"
              aria-label="Next month"
            >
              Next
            </button>
          </div>
        )}
      </div>

      <div className="mt-5 grid grid-cols-7 gap-2 text-xs">
        {days.map((day) => (
          <div key={day} className="text-center text-[11px] uppercase tracking-[0.2em] text-slate-400">
            {day}
          </div>
        ))}
        {cells.map((cell, index) => {
          if (!cell) return <div key={`empty-${index}`} className="h-10" />;
          return (
            <div
              key={cell.dateKey}
              title={statusLabel[cell.status]}
              className={`flex h-10 items-center justify-center rounded-lg ${statusClass[cell.status]}`}
            >
              {cell.day}
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex flex-wrap gap-3 text-xs text-slate-500">
        {Object.entries(statusLabel).map(([status, label]) => (
          <div key={status} className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${statusClass[status as DayStatus]}`} />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}
