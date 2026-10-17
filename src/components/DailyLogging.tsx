import { useState } from "react";
import { motion } from "framer-motion";
import type { AttendanceStatus } from "../lib/types";
import { getTodayDateKey, getTodayKey } from "../lib/attendance";
import { useAttendance } from "../context/AttendanceContext";

const statusOptions: { value: AttendanceStatus; label: string; tone: string }[] = [
  { value: "attended", label: "Attended", tone: "bg-[#2e6954] text-[#f5f2df] border-[#55947b]" },
  { value: "missed", label: "Missed", tone: "bg-[#5c2d36] text-[#ffdadf] border-[#8a424e]" },
  { value: "cancelled", label: "Cancelled", tone: "bg-[#20493b] text-[#c6d4cb] border-[rgba(231,231,221,0.2)]" },
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
    <div className="space-y-6 text-[#e7e7dd]">
      <div className="rounded-2xl border border-[rgba(231,231,221,0.14)] bg-[#1b3f33] p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#e7e7dd]">Daily Class Log</h2>
            <p className="text-sm text-[#a4b5aa] mt-0.5">
              {selectedDayKey} • {dateKey}
            </p>
          </div>
          <div>
            <input
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              className="rounded-xl border border-[rgba(231,231,221,0.16)] bg-[#122c23] px-4 py-2 text-xs text-[#e7e7dd] shadow-sm outline-none focus:border-[#f5f2df]"
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[rgba(231,231,221,0.14)] bg-[#1b3f33] p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-bold text-[#e7e7dd]">Today’s Schedule</h3>
            <p className="text-xs text-[#a4b5aa] mt-0.5">
              Toggle subjects if a lecture changes or gets swapped.
            </p>
          </div>
          {overrideSubjects && (
            <button
              onClick={resetOverride}
              className="rounded-xl border border-[rgba(231,231,221,0.14)] bg-[#20493b] px-3.5 py-1.5 text-xs font-semibold text-[#f5f2df] hover:border-[rgba(231,231,221,0.3)] transition"
            >
              Reset to default schedule
            </button>
          )}
        </div>
        <div className="mt-4 flex flex-wrap gap-2.5">
          {state.subjects.map((subject) => {
            const active = todaySubjects.includes(subject.id);
            return (
              <button
                key={subject.id}
                onClick={() => toggleOverrideSubject(subject.id)}
                className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition ${
                  active
                    ? "border-transparent bg-[#f5f2df] text-[#16362b] font-bold shadow-sm"
                    : "border-[rgba(231,231,221,0.14)] bg-[#20493b] text-[#a4b5aa] hover:border-[rgba(231,231,221,0.3)] hover:text-[#e7e7dd]"
                }`}
              >
                {subject.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-[rgba(231,231,221,0.14)] bg-[#1b3f33] p-6 shadow-sm">
        {todaySubjects.length === 0 ? (
          <p className="text-sm text-[#a4b5aa] italic">No classes scheduled for today.</p>
        ) : (
          <div className="space-y-4">
            {todaySubjects.map((subjectId) => {
              const subject = state.subjects.find((item) => item.id === subjectId);
              if (!subject) return null;
              const current = dailyLog[subjectId];
              const slot = state.slots?.find(
                (s) => s.day === selectedDayKey && s.subjectId === subjectId
              );

              return (
                <motion.div
                  key={subjectId}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col gap-3 rounded-xl border border-[rgba(231,231,221,0.12)] bg-[#16362b]/80 p-5 transition"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: subject.color }} />
                      <p className="text-base font-bold text-[#e7e7dd]">{subject.name}</p>
                      {subject.teacher && (
                        <span className="rounded-md bg-[#20493b] px-2.5 py-0.5 text-xs font-semibold text-[#f5f2df]">
                          {subject.teacher}
                        </span>
                      )}
                    </div>
                    {slot && (
                      <span className="rounded-md bg-[#122c23] border border-[rgba(231,231,221,0.12)] px-3 py-1 text-xs font-medium text-[#c6d4cb]">
                        {slot.room} • {slot.startTime} - {slot.endTime}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {statusOptions.map((option) => {
                      const active = current === option.value;
                      return (
                        <button
                          key={option.value}
                          onClick={() => updateStatus(subjectId, option.value)}
                          className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition ${
                            active
                              ? `${option.tone} shadow-sm font-bold`
                              : "border-[rgba(231,231,221,0.14)] bg-[#20493b] text-[#a4b5aa] hover:border-[rgba(231,231,221,0.3)] hover:text-[#e7e7dd]"
                          }`}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                  <input
                    value={state.notes?.[dateKey]?.[subjectId] ?? ""}
                    onChange={(event) => updateNote(subjectId, event.target.value)}
                    placeholder="Add a note (e.g. proxy, assignment due, room change)"
                    className="mt-1 w-full rounded-xl border border-[rgba(231,231,221,0.16)] bg-[#122c23] px-3.5 py-2 text-xs text-[#e7e7dd] shadow-sm outline-none focus:border-[#f5f2df]"
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
