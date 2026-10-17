import { useState } from "react";
import { motion } from "framer-motion";
import type { AttendanceStatus } from "../lib/types";
import { getTodayDateKey, getTodayKey } from "../lib/attendance";
import { useAttendance } from "../context/AttendanceContext";

const statusOptions: { value: AttendanceStatus; label: string; tone: string }[] = [
  { value: "attended", label: "Attended", tone: "bg-emerald-500" },
  { value: "missed", label: "Missed", tone: "bg-rose-500" },
  { value: "cancelled", label: "Cancelled", tone: "bg-slate-400" },
];

export default function DailyLogging() {
  const { state, setState } = useAttendance();
  const [selectedDate, setSelectedDate] = useState(getTodayDateKey());
  const dateKey = selectedDate;
  const selectedDayKey = new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(
    new Date(dateKey + "T00:00:00")
  ) as ReturnType<typeof getTodayKey>;
  const baseSubjects = state.timetable[selectedDayKey] ?? [];
  const overrideSubjects = state.overrides[dateKey];
  const todaySubjects = overrideSubjects ?? baseSubjects;
  const dailyLog = state.logs[dateKey] ?? {};

  const updateStatus = (subjectId: string, status: AttendanceStatus) => {
    setState({
      ...state,
      logs: {
        ...state.logs,
        [dateKey]: { ...dailyLog, [subjectId]: status },
      },
    });
  };

  const updateNote = (subjectId: string, note: string) => {
    const notes = state.notes ?? {};
    const dailyNotes = notes[dateKey] ?? {};
    setState({
      ...state,
      notes: {
        ...notes,
        [dateKey]: { ...dailyNotes, [subjectId]: note },
      },
    });
  };

  const clearDay = () => {
    const { [dateKey]: _, ...rest } = state.logs;
    setState({ ...state, logs: rest });
  };

  const setAllStatuses = (status: AttendanceStatus) => {
    if (todaySubjects.length === 0) return;
    const nextLog = { ...dailyLog };
    todaySubjects.forEach((subjectId) => {
      nextLog[subjectId] = status;
    });
    setState({
      ...state,
      logs: {
        ...state.logs,
        [dateKey]: nextLog,
      },
    });
  };

  const toggleOverrideSubject = (subjectId: string) => {
    const current = overrideSubjects ?? baseSubjects;
    const exists = current.includes(subjectId);
    const next = exists ? current.filter((item) => item !== subjectId) : [...current, subjectId];
    setState({
      ...state,
      overrides: {
        ...state.overrides,
        [dateKey]: next,
      },
    });
  };

  const resetOverride = () => {
    const { [dateKey]: _, ...rest } = state.overrides;
    setState({
      ...state,
      overrides: rest,
    });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Daily log</h2>
            <p className="text-sm text-slate-500">{selectedDayKey} • {dateKey}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <input
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 shadow-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
            />
            <button
              onClick={() => setAllStatuses("cancelled")}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-500 transition hover:border-slate-400 hover:text-slate-800 dark:border-slate-700 dark:text-slate-300"
            >
              Mark day holiday
            </button>
            <button
              onClick={() => setAllStatuses("attended")}
              className="rounded-xl border border-emerald-200 px-4 py-2 text-xs font-semibold text-emerald-600 transition hover:border-emerald-400 dark:border-emerald-500/40 dark:text-emerald-300"
            >
              Mark all attended
            </button>
            <button
              onClick={() => setAllStatuses("missed")}
              className="rounded-xl border border-rose-200 px-4 py-2 text-xs font-semibold text-rose-600 transition hover:border-rose-400 dark:border-rose-500/40 dark:text-rose-300"
            >
              Mark all missed
            </button>
            <button
              onClick={clearDay}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-500 transition hover:border-slate-400 hover:text-slate-800 dark:border-slate-700 dark:text-slate-300"
            >
              Reset day
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold">Today’s schedule</h3>
            <p className="text-xs text-slate-500">
              Adjust subjects if a lecture changes or gets swapped.
            </p>
          </div>
          {overrideSubjects && (
            <button
              onClick={resetOverride}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-500 transition hover:border-slate-400 hover:text-slate-800 dark:border-slate-700 dark:text-slate-300"
            >
              Use timetable
            </button>
          )}
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          {state.subjects.map((subject) => {
            const active = todaySubjects.includes(subject.id);
            return (
              <button
                key={subject.id}
                onClick={() => toggleOverrideSubject(subject.id)}
                className={`module-outline rounded-full border px-4 py-2 text-xs font-semibold transition ${
                  active
                    ? "border-[#7DD3FC] bg-[#7DD3FC] text-[#0B1020]"
                    : "border-slate-200 text-slate-500 hover:border-slate-400 dark:border-slate-700 dark:text-slate-300"
                }`}
              >
                {subject.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        {todaySubjects.length === 0 ? (
          <p className="text-sm text-slate-500">No classes scheduled for today.</p>
        ) : (
          <div className="space-y-4">
            {todaySubjects.map((subjectId) => {
              const subject = state.subjects.find((item) => item.id === subjectId);
              if (!subject) return null;
              const current = dailyLog[subjectId];
              return (
                <motion.div
                  key={subjectId}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="module-outline flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950"
                >
                  <div className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: subject.color }} />
                    <p className="text-sm font-semibold">{subject.name}</p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {statusOptions.map((option) => {
                      const active = current === option.value;
                      return (
                        <button
                          key={option.value}
                          onClick={() => updateStatus(subjectId, option.value)}
                          className={`module-outline rounded-full border px-4 py-2 text-xs font-semibold transition ${
                            active
                              ? "text-white"
                              : "border border-slate-200 text-slate-500 hover:border-slate-400 dark:border-slate-700 dark:text-slate-300"
                          } ${active ? option.tone : "bg-white dark:bg-slate-900"}`}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                  <input
                    value={state.notes?.[dateKey]?.[subjectId] ?? ""}
                    onChange={(event) => updateNote(subjectId, event.target.value)}
                    placeholder="Add a note (e.g. proxy, quiz, medical)"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 shadow-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  />
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
