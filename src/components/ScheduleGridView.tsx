import { useState } from "react";
import type { DayKey, Subject, TimetableSlot } from "../lib/types";
import type { TimetableConflict } from "../lib/conflicts";
import { timeToMinutes } from "../lib/conflicts";

type ScheduleGridViewProps = {
  slots: TimetableSlot[];
  subjects: Subject[];
  conflicts: TimetableConflict[];
  onEdit: (slot: TimetableSlot) => void;
  onDelete: (slotId: string) => void;
};

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

export default function ScheduleGridView({
  slots,
  subjects,
  conflicts,
  onEdit,
  onDelete,
}: ScheduleGridViewProps) {
  const [selectedDayFilter, setSelectedDayFilter] = useState<DayKey | "ALL">("ALL");

  const subjectMap = new Map(subjects.map((s) => [s.id, s]));
  const conflictingIds = new Set<string>();
  conflicts.forEach((c) => {
    conflictingIds.add(c.slotIds[0]);
    conflictingIds.add(c.slotIds[1]);
  });

  const filteredDays = selectedDayFilter === "ALL" ? days : [selectedDayFilter];

  return (
    <div className="space-y-6">
      {/* Day Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[rgba(231,231,221,0.12)] pb-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#a4b5aa] mr-2">
            Filter Day:
          </span>
          <button
            onClick={() => setSelectedDayFilter("ALL")}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
              selectedDayFilter === "ALL"
                ? "bg-[#f5f2df] text-[#16362b] font-bold shadow-sm"
                : "border border-[rgba(231,231,221,0.14)] bg-[#20493b] text-[#a4b5aa] hover:border-[rgba(231,231,221,0.3)] hover:text-[#e7e7dd]"
            }`}
          >
            All Week ({slots.length})
          </button>
          {days.map((d) => {
            const count = slots.filter((s) => s.day === d).length;
            const isSelected = selectedDayFilter === d;
            return (
              <button
                key={d}
                onClick={() => setSelectedDayFilter(d)}
                className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                  isSelected
                    ? "bg-[#f5f2df] text-[#16362b] font-bold shadow-sm"
                    : "border border-[rgba(231,231,221,0.14)] bg-[#20493b] text-[#a4b5aa] hover:border-[rgba(231,231,221,0.3)] hover:text-[#e7e7dd]"
                }`}
              >
                {d} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Large Schedule Presentation */}
      <div className="space-y-6">
        {filteredDays.map((day) => {
          const daySlots = slots
            .filter((s) => s.day === day)
            .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

          if (selectedDayFilter === "ALL" && daySlots.length === 0) {
            return null;
          }

          return (
            <div
              key={day}
              className="rounded-2xl border border-[rgba(231,231,221,0.14)] bg-[#1b3f33] p-6 shadow-sm space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[rgba(231,231,221,0.12)] pb-3">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold text-[#e7e7dd]">
                    {dayFullNames[day]}
                  </h3>
                  <span className="rounded-full bg-[#20493b] px-3 py-0.5 text-xs font-medium text-[#c6d4cb]">
                    {daySlots.length} {daySlots.length === 1 ? "lecture" : "lectures"}
                  </span>
                </div>
              </div>

              {daySlots.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[rgba(231,231,221,0.14)] py-8 text-center text-sm text-[#a4b5aa]">
                  No classes scheduled for {dayFullNames[day]}.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[rgba(231,231,221,0.12)] text-xs font-semibold uppercase tracking-wider text-[#a4b5aa]">
                        <th className="py-3 px-4">Period</th>
                        <th className="py-3 px-4">Subject</th>
                        <th className="py-3 px-4">Faculty</th>
                        <th className="py-3 px-4">Room</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[rgba(231,231,221,0.08)] text-sm">
                      {daySlots.map((slot) => {
                        const subject = subjectMap.get(slot.subjectId);
                        const hasConflict = conflictingIds.has(slot.id);

                        return (
                          <tr
                            key={slot.id}
                            className={`transition hover:bg-[#20493b]/40 ${
                              hasConflict ? "bg-rose-950/25" : ""
                            }`}
                          >
                            <td className="py-4 px-4 whitespace-nowrap">
                              <span className="inline-flex items-center rounded-lg bg-[#20493b] border border-[rgba(231,231,221,0.14)] px-3 py-1.5 text-xs font-semibold text-[#f5f2df] shadow-sm">
                                {slot.startTime} - {slot.endTime}
                              </span>
                            </td>

                            <td className="py-4 px-4 font-semibold text-[#e7e7dd]">
                              <div className="flex items-center gap-3">
                                <span
                                  className="h-2.5 w-2.5 rounded-full shrink-0 shadow-sm"
                                  style={{ backgroundColor: subject?.color ?? "#a4b5aa" }}
                                />
                                <div>
                                  <p className="text-base font-bold text-[#e7e7dd]">
                                    {subject?.name ?? slot.subjectId}
                                  </p>
                                  {hasConflict && (
                                    <span className="mt-1 inline-flex items-center rounded bg-rose-900/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-200">
                                      Conflict Detected
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>

                            <td className="py-4 px-4 text-[#c6d4cb]">
                              <span className="font-medium text-[#e7e7dd] text-sm">
                                {subject?.teacher || "Not assigned"}
                              </span>
                            </td>

                            <td className="py-4 px-4 whitespace-nowrap">
                              <span className="inline-flex items-center rounded-lg border border-[rgba(231,231,221,0.12)] bg-[#122c23] px-3 py-1.5 text-xs font-medium text-[#c6d4cb]">
                                {slot.room || "No Room"}
                              </span>
                            </td>

                            <td className="py-4 px-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => onEdit(slot)}
                                  className="rounded-lg border border-[rgba(231,231,221,0.14)] bg-[#20493b] px-3.5 py-1.5 text-xs font-semibold text-[#f5f2df] hover:border-[rgba(231,231,221,0.3)] transition"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => onDelete(slot.id)}
                                  className="rounded-lg border border-[rgba(231,231,221,0.14)] bg-[#20493b] px-3.5 py-1.5 text-xs font-semibold text-rose-300 hover:border-rose-400 transition"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
