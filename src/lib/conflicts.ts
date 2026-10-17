import type { DayKey, Subject, Timetable, TimetableSlot } from "./types";

export type TimetableConflict = {
  type: "teacher" | "room" | "time";
  day: DayKey;
  slotIds: [string, string];
  message: string;
};

export const STANDARD_TIME_PRESETS = [
  { label: "09:00 - 10:00", startTime: "09:00", endTime: "10:00" },
  { label: "10:00 - 11:00", startTime: "10:00", endTime: "11:00" },
  { label: "11:00 - 12:00", startTime: "11:00", endTime: "12:00" },
  { label: "12:00 - 13:00", startTime: "12:00", endTime: "13:00" },
  { label: "13:00 - 14:00", startTime: "13:00", endTime: "14:00" },
  { label: "14:00 - 15:00", startTime: "14:00", endTime: "15:00" },
  { label: "15:00 - 16:00", startTime: "15:00", endTime: "16:00" },
  { label: "16:00 - 17:00", startTime: "16:00", endTime: "17:00" },
];

export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map((v) => parseInt(v, 10));
  if (isNaN(hours) || isNaN(minutes)) return 0;
  return hours * 60 + minutes;
}

export function timeRangesOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string
): boolean {
  const sA = timeToMinutes(startA);
  const eA = timeToMinutes(endA);
  const sB = timeToMinutes(startB);
  const eB = timeToMinutes(endB);

  return Math.max(sA, sB) < Math.min(eA, eB);
}

export function validateSlot(
  candidate: Omit<TimetableSlot, "id">,
  existingSlots: TimetableSlot[],
  subjects: Subject[],
  ignoreSlotId?: string
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!candidate.subjectId) {
    errors.push("Please select a subject.");
  }

  if (!candidate.startTime || !candidate.endTime) {
    errors.push("Both start time and end time are required.");
  } else if (timeToMinutes(candidate.startTime) >= timeToMinutes(candidate.endTime)) {
    errors.push("Start time must be earlier than end time.");
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  const subjectMap = new Map(subjects.map((s) => [s.id, s]));
  const currentSubject = subjectMap.get(candidate.subjectId);
  const currentTeacher = currentSubject?.teacher?.trim().toLowerCase();
  const currentRoom = candidate.room?.trim().toLowerCase();

  const daySlots = existingSlots.filter(
    (slot) => slot.day === candidate.day && slot.id !== ignoreSlotId
  );

  for (const slot of daySlots) {
    if (timeRangesOverlap(candidate.startTime, candidate.endTime, slot.startTime, slot.endTime)) {
      const otherSubject = subjectMap.get(slot.subjectId);
      const otherTeacher = otherSubject?.teacher?.trim().toLowerCase();
      const otherRoom = slot.room?.trim().toLowerCase();
      const timeSpan = `${slot.startTime} - ${slot.endTime}`;

      errors.push(
        `Time clash: Another class (${otherSubject?.name ?? slot.subjectId}) is already scheduled at ${timeSpan} on ${candidate.day}.`
      );

      if (currentRoom && otherRoom && currentRoom === otherRoom) {
        errors.push(
          `Room clash: Room "${slot.room}" is double-booked with ${otherSubject?.name ?? slot.subjectId} at ${timeSpan}.`
        );
      }

      if (currentTeacher && otherTeacher && currentTeacher === otherTeacher) {
        errors.push(
          `Teacher clash: ${currentSubject?.teacher} is already assigned to teach ${otherSubject?.name ?? slot.subjectId} at ${timeSpan}.`
        );
      }
    }
  }

  return { isValid: errors.length === 0, errors };
}

export function findTimetableConflicts(
  slots: TimetableSlot[],
  subjects: Subject[]
): TimetableConflict[] {
  const conflicts: TimetableConflict[] = [];
  const subjectMap = new Map(subjects.map((s) => [s.id, s]));

  for (let i = 0; i < slots.length; i++) {
    for (let j = i + 1; j < slots.length; j++) {
      const a = slots[i];
      const b = slots[j];

      if (a.day !== b.day) continue;

      if (timeRangesOverlap(a.startTime, a.endTime, b.startTime, b.endTime)) {
        const subA = subjectMap.get(a.subjectId);
        const subB = subjectMap.get(b.subjectId);
        const teacherA = subA?.teacher?.trim().toLowerCase();
        const teacherB = subB?.teacher?.trim().toLowerCase();
        const roomA = a.room?.trim().toLowerCase();
        const roomB = b.room?.trim().toLowerCase();

        conflicts.push({
          type: "time",
          day: a.day,
          slotIds: [a.id, b.id],
          message: `Double class: ${subA?.name ?? a.subjectId} and ${subB?.name ?? b.subjectId} overlap at ${a.startTime}-${a.endTime} on ${a.day}.`,
        });

        if (roomA && roomB && roomA === roomB) {
          conflicts.push({
            type: "room",
            day: a.day,
            slotIds: [a.id, b.id],
            message: `Room conflict: "${a.room}" is double-booked for ${subA?.name ?? a.subjectId} and ${subB?.name ?? b.subjectId} on ${a.day}.`,
          });
        }

        if (teacherA && teacherB && teacherA === teacherB) {
          conflicts.push({
            type: "teacher",
            day: a.day,
            slotIds: [a.id, b.id],
            message: `Teacher conflict: ${subA?.teacher} is scheduled for both ${subA?.name} and ${subB?.name} at the same time on ${a.day}.`,
          });
        }
      }
    }
  }

  return conflicts;
}

export function deriveDefaultSlots(
  timetable: Timetable,
  subjects: Subject[]
): TimetableSlot[] {
  const slots: TimetableSlot[] = [];
  const days: DayKey[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  days.forEach((day) => {
    const daySubjects = timetable[day] ?? [];
    daySubjects.forEach((subjectId, index) => {
      const preset = STANDARD_TIME_PRESETS[index % STANDARD_TIME_PRESETS.length];
      const roomNum = 101 + (index % 4) * 10;
      slots.push({
        id: `slot-${day.toLowerCase()}-${index}-${Date.now().toString(36)}`,
        day,
        subjectId,
        room: `Room ${roomNum}`,
        startTime: preset.startTime,
        endTime: preset.endTime,
      });
    });
  });

  return slots;
}

export function syncTimetableFromSlots(slots: TimetableSlot[]): Timetable {
  const days: DayKey[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const timetable: Timetable = {
    Mon: [],
    Tue: [],
    Wed: [],
    Thu: [],
    Fri: [],
    Sat: [],
    Sun: [],
  };

  const sortedSlots = [...slots].sort(
    (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
  );

  sortedSlots.forEach((slot) => {
    if (timetable[slot.day]) {
      timetable[slot.day].push(slot.subjectId);
    }
  });

  return timetable;
}
