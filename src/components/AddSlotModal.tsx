import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { DayKey, Subject, TimetableSlot } from "../lib/types";
import { STANDARD_TIME_PRESETS, validateSlot } from "../lib/conflicts";

type AddSlotModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (slot: Omit<TimetableSlot, "id">) => void;
  initialDay?: DayKey;
  subjects: Subject[];
  existingSlots: TimetableSlot[];
  editingSlot?: TimetableSlot | null;
};

const days: DayKey[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const ROOM_SUGGESTIONS = ["Room 101", "Room 201", "Room 301", "Lab A", "Lab B", "Auditorium"];

export default function AddSlotModal({
  isOpen,
  onClose,
  onSave,
  initialDay = "Mon",
  subjects,
  existingSlots,
  editingSlot,
}: AddSlotModalProps) {
  const [day, setDay] = useState<DayKey>(editingSlot?.day ?? initialDay);
  const [subjectId, setSubjectId] = useState(
    editingSlot?.subjectId ?? subjects[0]?.id ?? ""
  );
  const [room, setRoom] = useState(editingSlot?.room ?? "Room 101");
  const [startTime, setStartTime] = useState(editingSlot?.startTime ?? "09:00");
  const [endTime, setEndTime] = useState(editingSlot?.endTime ?? "10:00");
  const [submittedAttempt, setSubmittedAttempt] = useState(false);

  useEffect(() => {
    if (editingSlot) {
      setDay(editingSlot.day);
      setSubjectId(editingSlot.subjectId);
      setRoom(editingSlot.room);
      setStartTime(editingSlot.startTime);
      setEndTime(editingSlot.endTime);
    } else {
      setDay(initialDay);
      if (subjects.length > 0 && !subjectId) {
        setSubjectId(subjects[0].id);
      }
    }
    setSubmittedAttempt(false);
  }, [editingSlot, initialDay, isOpen, subjects]);

  const candidate = {
    day,
    subjectId,
    room,
    startTime,
    endTime,
  };

  const validation = validateSlot(
    candidate,
    existingSlots,
    subjects,
    editingSlot?.id
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedAttempt(true);
    if (!validation.isValid) return;

    onSave(candidate);
    onClose();
  };

  const selectPreset = (start: string, end: string) => {
    setStartTime(start);
    setEndTime(end);
  };

  if (!isOpen) return null;

  const currentSubject = subjects.find((s) => s.id === subjectId);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#0d1e17]/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl border border-[rgba(231,231,221,0.16)] bg-[#1b3f33] p-5 sm:p-6 shadow-2xl text-[#e7e7dd]"
        >
          <div className="flex items-center justify-between border-b border-[rgba(231,231,221,0.12)] pb-4">
            <div>
              <h3 className="text-lg font-bold text-[#e7e7dd]">
                {editingSlot ? "Edit Class Session" : "Schedule Class Session"}
              </h3>
              <p className="text-xs text-[#a4b5aa] mt-0.5">
                Assign room, time, and verify conflict-free placement.
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg px-2.5 py-1 text-xs font-semibold text-[#a4b5aa] hover:bg-[#20493b] hover:text-[#e7e7dd] transition"
            >
              Close
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label className="text-xs font-semibold text-[#a4b5aa] uppercase tracking-wider">Day of Week</label>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {days.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDay(d)}
                    className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
                      day === d
                        ? "bg-[#f5f2df] text-[#16362b] font-bold shadow-sm"
                        : "border border-[rgba(231,231,221,0.14)] bg-[#20493b]/70 text-[#a4b5aa] hover:border-[rgba(231,231,221,0.3)] hover:text-[#e7e7dd]"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#a4b5aa] uppercase tracking-wider">Subject</label>
              {subjects.length === 0 ? (
                <p className="mt-1 text-xs text-rose-300">
                  Please add at least one subject first.
                </p>
              ) : (
                <div className="mt-1.5">
                  <select
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value)}
                    className="w-full rounded-xl border border-[rgba(231,231,221,0.16)] bg-[#122c23] px-3.5 py-2.5 text-sm text-[#e7e7dd] shadow-sm outline-none focus:border-[#f5f2df]"
                  >
                    {subjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name} {sub.teacher ? `(Faculty: ${sub.teacher})` : "(No teacher set)"}
                      </option>
                    ))}
                  </select>
                  {currentSubject?.teacher && (
                    <p className="mt-1 text-xs text-[#a4b5aa]">
                      Assigned Faculty:{" "}
                      <span className="font-semibold text-[#e7e7dd]">
                        {currentSubject.teacher}
                      </span>
                    </p>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-[#a4b5aa] uppercase tracking-wider">Room / Lab Number</label>
              <div className="mt-1.5 space-y-2">
                <input
                  type="text"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  placeholder="e.g. Room 101, Lab 2, Hall B"
                  className="w-full rounded-xl border border-[rgba(231,231,221,0.16)] bg-[#122c23] px-3.5 py-2.5 text-sm text-[#e7e7dd] shadow-sm outline-none focus:border-[#f5f2df]"
                />
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] text-[#a4b5aa]">Quick presets:</span>
                  {ROOM_SUGGESTIONS.map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => setRoom(sug)}
                      className="rounded-lg border border-[rgba(231,231,221,0.12)] bg-[#20493b]/60 px-2.5 py-0.5 text-[11px] text-[#c6d4cb] hover:border-[rgba(231,231,221,0.3)] hover:text-[#e7e7dd]"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#a4b5aa] uppercase tracking-wider">Period Slot</label>
                <span className="text-[11px] text-[#a4b5aa]">Standard presets</span>
              </div>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {STANDARD_TIME_PRESETS.map((preset) => {
                  const isSelected =
                    startTime === preset.startTime && endTime === preset.endTime;
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => selectPreset(preset.startTime, preset.endTime)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                        isSelected
                          ? "bg-[#f5f2df] text-[#16362b] font-bold shadow-sm"
                          : "border border-[rgba(231,231,221,0.12)] bg-[#20493b]/60 text-[#a4b5aa] hover:border-[rgba(231,231,221,0.3)] hover:text-[#e7e7dd]"
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-[#a4b5aa]">Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[rgba(231,231,221,0.16)] bg-[#122c23] px-3.5 py-2.5 text-sm text-[#e7e7dd] shadow-sm outline-none focus:border-[#f5f2df]"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#a4b5aa]">End Time</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[rgba(231,231,221,0.16)] bg-[#122c23] px-3.5 py-2.5 text-sm text-[#e7e7dd] shadow-sm outline-none focus:border-[#f5f2df]"
                  />
                </div>
              </div>
            </div>

            {(!validation.isValid || submittedAttempt) && validation.errors.length > 0 && (
              <div className="rounded-xl border border-rose-500/30 bg-[#2b1f24] p-3.5 text-xs text-rose-300">
                <p className="font-semibold text-rose-100 flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider rounded bg-rose-900/60 px-1.5 py-0.5 text-rose-200">Notice</span>
                  <span>Cannot schedule slot due to conflict:</span>
                </p>
                <ul className="mt-2 list-disc list-inside space-y-1 text-rose-300">
                  {validation.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {validation.isValid && (
              <div className="rounded-xl border border-[rgba(231,231,221,0.12)] bg-[#20493b]/70 p-3 text-xs text-[#c6d4cb] flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#f5f2df]" />
                <span>Ready to schedule — no teacher, room, or time conflict.</span>
              </div>
            )}

            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 pt-3 border-t border-[rgba(231,231,221,0.12)]">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto rounded-xl border border-[rgba(231,231,221,0.16)] px-5 py-2.5 text-xs font-semibold text-[#a4b5aa] hover:bg-[#20493b] hover:text-[#e7e7dd] transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!validation.isValid}
                className="w-full sm:w-auto rounded-xl bg-[#f5f2df] px-6 py-2.5 text-xs font-bold text-[#16362b] hover:bg-[#ede8d0] disabled:opacity-40 transition shadow-sm"
              >
                {editingSlot ? "Update Session" : "Schedule Class"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
