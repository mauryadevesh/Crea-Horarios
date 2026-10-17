import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { AttendanceState, DayKey, Subject, TimetableSlot } from "../lib/types";
import { SUBJECT_COLOR_PALETTE } from "../lib/constants";
import { seedState } from "../data/seed";
import { useAttendance } from "../context/AttendanceContext";
import {
  findTimetableConflicts,
  deriveDefaultSlots,
  syncTimetableFromSlots,
  timeToMinutes,
} from "../lib/conflicts";
import AddSlotModal from "./AddSlotModal";
import SlotConflictBanner from "./SlotConflictBanner";
import ScheduleGridView from "./ScheduleGridView";

const days: DayKey[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const dayFullNames: Record<DayKey, string> = {
  Mon: "Monday",
  Tue: "Tuesday",
  Wed: "Wednesday",
  Thu: "Thursday",
  Fri: "Friday",
  Sat: "Saturday",
  Sun: "Sunday",
};

const createId = (name: string) => name.trim().toLowerCase().replace(/\s+/g, "-");

const pickColor = (subjects: Subject[]) =>
  SUBJECT_COLOR_PALETTE[subjects.length % SUBJECT_COLOR_PALETTE.length];

export default function TimetableSetup() {
  const { state, setState } = useAttendance();
  const [subjectName, setSubjectName] = useState("");
  const [teacherName, setTeacherName] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalDay, setModalDay] = useState<DayKey>("Mon");
  const [editingSlot, setEditingSlot] = useState<TimetableSlot | null>(null);

  const slots = useMemo(() => {
    return state.slots ?? deriveDefaultSlots(state.timetable, state.subjects);
  }, [state.slots, state.timetable, state.subjects]);

  const conflicts = useMemo(() => {
    return findTimetableConflicts(slots, state.subjects);
  }, [slots, state.subjects]);

  const conflictingSlotIds = useMemo(() => {
    const set = new Set<string>();
    conflicts.forEach((c) => {
      set.add(c.slotIds[0]);
      set.add(c.slotIds[1]);
    });
    return set;
  }, [conflicts]);

  const subjectMap = useMemo(() => {
    return new Map(state.subjects.map((subject) => [subject.id, subject]));
  }, [state.subjects]);

  const handleAddSubject = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = subjectName.trim();
    if (!trimmed) return;
    const id = createId(trimmed);
    if (state.subjects.some((subject) => subject.id === id)) return;

    const nextSubject: Subject = {
      id,
      name: trimmed,
      teacher: teacherName.trim() || undefined,
      color: pickColor(state.subjects),
    };

    setState({
      ...state,
      subjects: [...state.subjects, nextSubject],
    });

    setSubjectName("");
    setTeacherName("");
  };

  const handleRemoveSubject = (subjectId: string) => {
    const nextSubjects = state.subjects.filter((subject) => subject.id !== subjectId);
    const nextSlots = slots.filter((slot) => slot.subjectId !== subjectId);
    const nextTimetable = syncTimetableFromSlots(nextSlots);

    const nextLogs = Object.fromEntries(
      Object.entries(state.logs).map(([date, daily]) => {
        const { [subjectId]: _, ...rest } = daily;
        return [date, rest];
      })
    ) as AttendanceState["logs"];

    setState({
      ...state,
      subjects: nextSubjects,
      slots: nextSlots,
      timetable: nextTimetable,
      logs: nextLogs,
    });
  };

  const handleOpenAddModal = (day: DayKey) => {
    setEditingSlot(null);
    setModalDay(day);
    setModalOpen(true);
  };

  const handleOpenEditModal = (slot: TimetableSlot) => {
    setEditingSlot(slot);
    setModalDay(slot.day);
    setModalOpen(true);
  };

  const handleSaveSlot = (candidate: Omit<TimetableSlot, "id">) => {
    let nextSlots: TimetableSlot[];

    if (editingSlot) {
      nextSlots = slots.map((s) =>
        s.id === editingSlot.id ? { ...candidate, id: editingSlot.id } : s
      );
    } else {
      const newSlot: TimetableSlot = {
        ...candidate,
        id: `slot-${candidate.day.toLowerCase()}-${Date.now().toString(36)}`,
      };
      nextSlots = [...slots, newSlot];
    }

    const nextTimetable = syncTimetableFromSlots(nextSlots);
    setState({
      ...state,
      slots: nextSlots,
      timetable: nextTimetable,
    });
  };

  const handleDeleteSlot = (slotId: string) => {
    const nextSlots = slots.filter((s) => s.id !== slotId);
    const nextTimetable = syncTimetableFromSlots(nextSlots);
    setState({
      ...state,
      slots: nextSlots,
      timetable: nextTimetable,
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
    <div className="space-y-8 text-[#e7e7dd]">
      {/* Subjects Card */}
      <div className="rounded-2xl border border-[rgba(231,231,221,0.14)] bg-[#1b3f33] p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#e7e7dd]">Subjects & Faculty</h2>
            <p className="text-sm text-[#a4b5aa] mt-0.5">
              Add subjects and assign faculty to prevent scheduling clashes.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={clearLogs}
              className="rounded-full border border-[rgba(231,231,221,0.14)] px-3.5 py-1 text-xs font-semibold text-[#a4b5aa] transition hover:border-[rgba(231,231,221,0.3)] hover:text-[#e7e7dd]"
            >
              Clear logs
            </button>
            <button
              onClick={resetToDefaults}
              className="rounded-full border border-[rgba(231,231,221,0.14)] px-3.5 py-1 text-xs font-semibold text-[#a4b5aa] transition hover:border-[rgba(231,231,221,0.3)] hover:text-[#e7e7dd]"
            >
              Reset to defaults
            </button>
          </div>
        </div>

        <form onSubmit={handleAddSubject} className="mt-6 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <input
            value={subjectName}
            onChange={(event) => setSubjectName(event.target.value)}
            placeholder="Subject name (e.g. Data Structures)"
            className="rounded-xl border border-[rgba(231,231,221,0.16)] bg-[#122c23] px-4 py-3 text-sm text-[#e7e7dd] shadow-sm outline-none focus:border-[#f5f2df]"
          />
          <input
            value={teacherName}
            onChange={(event) => setTeacherName(event.target.value)}
            placeholder="Teacher's name (e.g. Dr. Alan Turing)"
            className="rounded-xl border border-[rgba(231,231,221,0.16)] bg-[#122c23] px-4 py-3 text-sm text-[#e7e7dd] shadow-sm outline-none focus:border-[#f5f2df]"
          />
          <button
            type="submit"
            className="rounded-xl bg-[#f5f2df] px-6 py-3 text-sm font-bold text-[#16362b] transition hover:bg-[#ede8d0] shadow-sm"
          >
            Add Subject
          </button>
        </form>

        <div className="mt-6 flex flex-wrap gap-2.5">
          {state.subjects.map((subject) => (
            <motion.div
              whileHover={{ y: -1 }}
              key={subject.id}
              className="flex items-center gap-2.5 rounded-full border border-[rgba(231,231,221,0.14)] bg-[#20493b] px-4 py-2 text-xs text-[#e7e7dd] shadow-sm"
            >
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: subject.color }} />
              <span className="font-semibold text-[#e7e7dd]">{subject.name}</span>
              {subject.teacher && (
                <span className="rounded-md bg-[#122c23] px-2.5 py-0.5 text-[11px] font-semibold text-[#f5f2df]">
                  {subject.teacher}
                </span>
              )}
              <button
                onClick={() => handleRemoveSubject(subject.id)}
                className="ml-1 text-[#a4b5aa] hover:text-rose-300 transition text-sm font-bold"
                title="Remove subject"
              >
                ×
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Weekly Schedule Section */}
      <div className="rounded-2xl border border-[rgba(231,231,221,0.14)] bg-[#1b3f33] p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#e7e7dd]">Weekly Schedule & Clash Prevention</h2>
            <p className="text-sm text-[#a4b5aa] mt-0.5">
              Organized by day, room, and period. Overlaps are prevented deterministically.
            </p>
          </div>
          <button
            onClick={() => handleOpenAddModal("Mon")}
            className="rounded-xl bg-[#f5f2df] px-5 py-2.5 text-xs font-bold text-[#16362b] hover:bg-[#ede8d0] transition shadow-sm"
          >
            + Schedule New Class
          </button>
        </div>

        <SlotConflictBanner conflicts={conflicts} />

        <div className="space-y-6">
          {days.map((day) => {
            const daySlots = slots
              .filter((slot) => slot.day === day)
              .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

            return (
              <div
                key={day}
                className="rounded-2xl border border-[rgba(231,231,221,0.12)] bg-[#16362b]/80 p-5 sm:p-6 transition"
              >
                <div className="flex items-center justify-between border-b border-[rgba(231,231,221,0.12)] pb-4">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-base sm:text-lg text-[#e7e7dd]">
                      {dayFullNames[day]}
                    </span>
                    <span className="rounded-full bg-[#20493b] px-3 py-0.5 text-xs font-semibold text-[#f5f2df]">
                      {daySlots.length} {daySlots.length === 1 ? "class" : "classes"}
                    </span>
                  </div>
                  <button
                    onClick={() => handleOpenAddModal(day)}
                    className="rounded-xl border border-[rgba(231,231,221,0.14)] bg-[#20493b] px-4 py-1.5 text-xs font-semibold text-[#f5f2df] hover:border-[rgba(231,231,221,0.3)] hover:bg-[#275647] transition"
                  >
                    + Add Class
                  </button>
                </div>

                <div className="mt-4">
                  {daySlots.length === 0 ? (
                    <p className="py-3 text-sm text-[#a4b5aa] italic">
                      No classes scheduled for {dayFullNames[day]}.
                    </p>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {daySlots.map((slot) => {
                        const subject = subjectMap.get(slot.subjectId);
                        const hasConflict = conflictingSlotIds.has(slot.id);

                        return (
                          <div
                            key={slot.id}
                            className={`flex flex-col justify-between rounded-xl border p-5 transition ${
                              hasConflict
                                ? "border-rose-500/80 bg-[#2b1f24]"
                                : "border-[rgba(231,231,221,0.14)] bg-[#1b3f33] hover:border-[rgba(231,231,221,0.28)]"
                            }`}
                          >
                            <div className="space-y-3">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className="inline-flex items-center rounded-lg bg-[#20493b] border border-[rgba(231,231,221,0.14)] px-3 py-1 text-xs font-bold text-[#f5f2df] shadow-sm">
                                  {slot.startTime} - {slot.endTime}
                                </span>
                                <span className="inline-flex items-center rounded-lg bg-[#122c23] border border-[rgba(231,231,221,0.12)] px-3 py-1 text-xs font-semibold text-[#c6d4cb]">
                                  {slot.room || "No Room"}
                                </span>
                              </div>

                              <div className="flex items-center gap-2.5 pt-1">
                                <span
                                  className="h-2.5 w-2.5 rounded-full shrink-0 shadow-sm"
                                  style={{ backgroundColor: subject?.color ?? "#a4b5aa" }}
                                />
                                <p className="font-bold text-base sm:text-lg text-[#e7e7dd] truncate">
                                  {subject?.name ?? slot.subjectId}
                                </p>
                              </div>

                              <p className="text-sm text-[#c6d4cb] flex items-center gap-2">
                                <span className="text-[#a4b5aa]">Faculty:</span>
                                <span className="font-medium text-[#e7e7dd]">
                                  {subject?.teacher || "Not assigned"}
                                </span>
                              </p>

                              {hasConflict && (
                                <p className="rounded-md bg-rose-950/60 border border-rose-500/30 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-rose-200">
                                  Schedule Clash Detected
                                </p>
                              )}
                            </div>

                            <div className="mt-4 flex items-center justify-end gap-3 border-t border-[rgba(231,231,221,0.1)] pt-3">
                              <button
                                onClick={() => handleOpenEditModal(slot)}
                                className="rounded-lg border border-[rgba(231,231,221,0.14)] bg-[#20493b] px-3.5 py-1.5 text-xs font-semibold text-[#f5f2df] hover:border-[rgba(231,231,221,0.3)] transition"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteSlot(slot.id)}
                                className="rounded-lg border border-[rgba(231,231,221,0.14)] bg-[#20493b] px-3.5 py-1.5 text-xs font-semibold text-rose-300 hover:border-rose-400 transition"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Expanded Master Schedule Matrix */}
      <div className="rounded-2xl border border-[rgba(231,231,221,0.14)] bg-[#1b3f33] p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <h2 className="text-xl font-bold text-[#e7e7dd]">Schedule Master Matrix</h2>
          <p className="text-sm text-[#a4b5aa] mt-0.5">
            Full comprehensive timetable matrix sorted chronologically with day filtering.
          </p>
        </div>

        <ScheduleGridView
          slots={slots}
          subjects={state.subjects}
          conflicts={conflicts}
          onEdit={handleOpenEditModal}
          onDelete={handleDeleteSlot}
        />
      </div>

      <AddSlotModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveSlot}
        initialDay={modalDay}
        subjects={state.subjects}
        existingSlots={slots}
        editingSlot={editingSlot}
      />
    </div>
  );
}
