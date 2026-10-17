import { describe, it, expect } from "vitest";
import {
  timeToMinutes,
  timeRangesOverlap,
  validateSlot,
  findTimetableConflicts,
  deriveDefaultSlots,
  syncTimetableFromSlots,
} from "./conflicts";
import type { Subject, TimetableSlot } from "./types";

const mockSubjects: Subject[] = [
  { id: "ds", name: "Data Structures", color: "#64E0C6", teacher: "Prof. Alan" },
  { id: "algo", name: "Algorithms", color: "#3CBBA6", teacher: "Prof. Alan" },
  { id: "dbms", name: "Database Systems", color: "#B9F3E5", teacher: "Dr. Grace" },
];

describe("conflicts utility", () => {
  it("converts time string to minutes correctly", () => {
    expect(timeToMinutes("00:00")).toBe(0);
    expect(timeToMinutes("09:30")).toBe(570);
    expect(timeToMinutes("14:15")).toBe(855);
  });

  it("checks time ranges overlap correctly", () => {
    // Overlapping
    expect(timeRangesOverlap("09:00", "10:00", "09:30", "10:30")).toBe(true);
    expect(timeRangesOverlap("09:00", "11:00", "09:30", "10:30")).toBe(true);
    // Adjacent (non-overlapping)
    expect(timeRangesOverlap("09:00", "10:00", "10:00", "11:00")).toBe(false);
    expect(timeRangesOverlap("10:00", "11:00", "09:00", "10:00")).toBe(false);
    // Completely separate
    expect(timeRangesOverlap("09:00", "10:00", "11:00", "12:00")).toBe(false);
  });

  it("detects teacher clash when same teacher is scheduled at overlapping time", () => {
    const existingSlots: TimetableSlot[] = [
      {
        id: "s1",
        day: "Mon",
        subjectId: "ds", // Prof. Alan
        room: "Room 101",
        startTime: "09:00",
        endTime: "10:00",
      },
    ];

    const result = validateSlot(
      {
        day: "Mon",
        subjectId: "algo", // Also Prof. Alan!
        room: "Room 202",
        startTime: "09:30",
        endTime: "10:30",
      },
      existingSlots,
      mockSubjects
    );

    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes("Teacher clash"))).toBe(true);
  });

  it("detects room double-booking when same room is used at overlapping time", () => {
    const existingSlots: TimetableSlot[] = [
      {
        id: "s1",
        day: "Mon",
        subjectId: "ds",
        room: "Room 101",
        startTime: "09:00",
        endTime: "10:00",
      },
    ];

    const result = validateSlot(
      {
        day: "Mon",
        subjectId: "dbms", // Different teacher Dr. Grace
        room: "room 101", // Same room!
        startTime: "09:00",
        endTime: "10:00",
      },
      existingSlots,
      mockSubjects
    );

    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes("Room clash"))).toBe(true);
  });

  it("allows non-overlapping slots on the same day", () => {
    const existingSlots: TimetableSlot[] = [
      {
        id: "s1",
        day: "Mon",
        subjectId: "ds",
        room: "Room 101",
        startTime: "09:00",
        endTime: "10:00",
      },
    ];

    const result = validateSlot(
      {
        day: "Mon",
        subjectId: "algo",
        room: "Room 101",
        startTime: "10:00",
        endTime: "11:00",
      },
      existingSlots,
      mockSubjects
    );

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("allows same teacher and room on a different day", () => {
    const existingSlots: TimetableSlot[] = [
      {
        id: "s1",
        day: "Mon",
        subjectId: "ds",
        room: "Room 101",
        startTime: "09:00",
        endTime: "10:00",
      },
    ];

    const result = validateSlot(
      {
        day: "Tue",
        subjectId: "algo",
        room: "Room 101",
        startTime: "09:00",
        endTime: "10:00",
      },
      existingSlots,
      mockSubjects
    );

    expect(result.isValid).toBe(true);
  });

  it("finds timetable conflicts across all slots", () => {
    const slots: TimetableSlot[] = [
      {
        id: "s1",
        day: "Wed",
        subjectId: "ds",
        room: "Room 101",
        startTime: "09:00",
        endTime: "10:00",
      },
      {
        id: "s2",
        day: "Wed",
        subjectId: "algo",
        room: "Room 101",
        startTime: "09:30",
        endTime: "10:30",
      },
    ];

    const conflicts = findTimetableConflicts(slots, mockSubjects);
    expect(conflicts.length).toBeGreaterThan(0);
    expect(conflicts.some((c) => c.type === "room")).toBe(true);
    expect(conflicts.some((c) => c.type === "teacher")).toBe(true);
  });

  it("syncs timetable subject array from slots properly sorted by time", () => {
    const slots: TimetableSlot[] = [
      {
        id: "s2",
        day: "Mon",
        subjectId: "dbms",
        room: "Room 202",
        startTime: "11:00",
        endTime: "12:00",
      },
      {
        id: "s1",
        day: "Mon",
        subjectId: "ds",
        room: "Room 101",
        startTime: "09:00",
        endTime: "10:00",
      },
    ];

    const timetable = syncTimetableFromSlots(slots);
    expect(timetable.Mon).toEqual(["ds", "dbms"]);
  });
});
