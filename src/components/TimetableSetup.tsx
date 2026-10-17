import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { AttendanceState, DayKey, Subject } from "../lib/types";
import { SUBJECT_COLOR_PALETTE } from "../lib/constants";
import { seedState } from "../data/seed";
import { useAttendance } from "../context/AttendanceContext";

const days: DayKey[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const createId = (name: string) => name.trim().toLowerCase().replace(/\s+/g, "-");

const pickColor = (subjects: Subject[]) =>
  SUBJECT_COLOR_PALETTE[subjects.length % SUBJECT_COLOR_PALETTE.length];

export default function TimetableSetup() {
  const { state, setState } = useAttendance();
  const [subjectName, setSubjectName] = useState("");

  const subjectMap = useMemo(() => {
    const map = new Map(state.subjects.map((subject) => [subject.id, subject]));
    return map;
  }, [state.subjects]);

  const handleAddSubject = () => {
    const trimmed = subjectName.trim();
    if (!trimmed) return;
    const id = createId(trimmed);
    if (state.subjects.some((subject) => subject.id === id)) return;

    const nextSubject: Subject = {
      id,
      name: trimmed,
      color: pickColor(state.subjects),
    };

    setState({
      ...state,
      subjects: [...state.subjects, nextSubject],
      timetable: Object.fromEntries(
        Object.entries(state.timetable).map(([day, list]) => [day, [...list]])
      ) as AttendanceState["timetable"],
    });

    setSubjectName("");
  };

  const handleRemoveSubject = (subjectId: string) => {
    const nextSubjects = state.subjects.filter((subject) => subject.id !== subjectId);
    const nextTimetable = Object.fromEntries(
      Object.entries(state.timetable).map(([day, list]) => [
        day,
        list.filter((item) => item !== subjectId),
      ])
    ) as AttendanceState["timetable"];

    const nextLogs = Object.fromEntries(
      Object.entries(state.logs).map(([date, daily]) => {
        const { [subjectId]: _, ...rest } = daily;
        return [date, rest];
      })
    ) as AttendanceState["logs"];

    setState({ ...state, subjects: nextSubjects, timetable: nextTimetable, logs: nextLogs });
  };

  const toggleSubjectForDay = (day: DayKey, subjectId: string) => {
    const current = state.timetable[day];
    const exists = current.includes(subjectId);
    const nextDay = exists ? current.filter((item) => item !== subjectId) : [...current, subjectId];
    setState({
      ...state,
      timetable: { ...state.timetable, [day]: nextDay },
    });
  };

  const resetToDefaults = () => {
    if (!window.confirm("Reset all subjects, timetable, and logs to defaults?")) {
      return;
    }
    const nextState = JSON.parse(JSON.stringify(seedState)) as AttendanceState;
    setState(nextState);
  };

  const clearLogs = () => {
    if (!window.confirm("Clear all logs and notes?")) {
      return;
    }
    setState({
      ...state,
      logs: {},
      notes: {},
      overrides: {},
    });
  };

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Your subjects</h2>
            <p className="text-sm text-slate-500">
              Add subjects or use <span className="font-semibold text-[#7DD3FC]">Remove</span> to
              keep your timetable focused.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={clearLogs}
              className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500 transition hover:border-slate-400 hover:text-slate-800 dark:border-slate-700 dark:text-slate-300"
            >
              Clear logs
            </button>
            <button
              onClick={resetToDefaults}
              className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500 transition hover:border-slate-400 hover:text-slate-800 dark:border-slate-700 dark:text-slate-300"
            >
              Reset to defaults
            </button>
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            value={subjectName}
            onChange={(event) => setSubjectName(event.target.value)}
            placeholder="e.g. Data Structures"
            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-950"
          />
          <button
            onClick={handleAddSubject}
            className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900"
          >
            Add subject
          </button>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          {state.subjects.map((subject) => (
            <motion.div
              whileHover={{ y: -2 }}
              key={subject.id}
              className="module-outline flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            >
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: subject.color }} />
              {subject.name}
              <button
                onClick={() => handleRemoveSubject(subject.id)}
                className="ml-2 text-xs text-slate-400 hover:text-rose-500"
              >
                Remove
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-semibold">Build your weekly timetable</h2>
        <p className="text-sm text-slate-500">
          Tap a subject to add or remove it from each day. Your plan updates instantly.
        </p>
        <div className="mt-6 space-y-4">
          {days.map((day) => (
            <div key={day} className="module-outline grid gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
              <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">{day}</div>
              <div className="flex flex-wrap gap-3">
                {state.subjects.length === 0 && (
                  <p className="text-xs text-slate-400">Add a subject to build your timetable.</p>
                )}
                {state.subjects.map((subject) => {
                  const active = state.timetable[day].includes(subject.id);
                  return (
                    <button
                      key={subject.id}
                      onClick={() => toggleSubjectForDay(day, subject.id)}
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
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-semibold">Quick summary</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {days.map((day) => (
            <div key={day} className="module-outline rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{day}</p>
              <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">
                {state.timetable[day].length === 0
                  ? "No classes"
                  : state.timetable[day]
                      .map((id) => subjectMap.get(id)?.name ?? id)
                      .join(", ")}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
