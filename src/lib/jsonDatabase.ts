import type { AttendanceState } from "./types";
import { seedState } from "../data/seed";
import { deriveDefaultSlots } from "./conflicts";

export const JSON_DB_STORAGE_KEY = "timetable_json_database_v1";

export interface JsonDatabaseFile {
  version: "1.0.0";
  databaseName: "WeeklyTimetableDatabase";
  lastModified: string;
  data: AttendanceState;
}

export function createDatabaseSnapshot(state: AttendanceState): JsonDatabaseFile {
  return {
    version: "1.0.0",
    databaseName: "WeeklyTimetableDatabase",
    lastModified: new Date().toISOString(),
    data: {
      ...state,
      slots: state.slots ?? deriveDefaultSlots(state.timetable, state.subjects),
    },
  };
}

export function saveJsonDatabase(state: AttendanceState): void {
  try {
    const snapshot = createDatabaseSnapshot(state);
    localStorage.setItem(JSON_DB_STORAGE_KEY, JSON.stringify(snapshot));
  } catch (err) {
    console.error("Failed to persist JSON database to localStorage", err);
  }
}

export function loadJsonDatabase(): AttendanceState {
  try {
    const raw = localStorage.getItem(JSON_DB_STORAGE_KEY);
    if (!raw) return seedState;

    const parsed = JSON.parse(raw);
    const candidate: AttendanceState = parsed.data ?? parsed;

    if (!Array.isArray(candidate.subjects)) {
      return seedState;
    }

    return {
      ...seedState,
      ...candidate,
      subjects: candidate.subjects ?? seedState.subjects,
      timetable: candidate.timetable ?? seedState.timetable,
      slots: candidate.slots ?? deriveDefaultSlots(candidate.timetable, candidate.subjects),
      logs: candidate.logs ?? {},
      notes: candidate.notes ?? {},
      overrides: candidate.overrides ?? {},
    };
  } catch (err) {
    console.error("Failed to load JSON database, falling back to seed", err);
    return seedState;
  }
}

export function exportJsonDatabase(state: AttendanceState, fileName = "timetable_database.json"): void {
  const snapshot = createDatabaseSnapshot(state);
  const blob = new Blob([JSON.stringify(snapshot, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export function parseAndValidateJsonDatabase(
  rawText: string
): { success: true; data: AttendanceState } | { success: false; error: string } {
  try {
    const parsed = JSON.parse(rawText);
    const candidate: AttendanceState = parsed.data ?? parsed;

    if (!candidate || typeof candidate !== "object") {
      return { success: false, error: "Invalid JSON database format." };
    }

    if (!Array.isArray(candidate.subjects)) {
      return { success: false, error: "Missing or invalid 'subjects' array in database." };
    }

    const validated: AttendanceState = {
      ...seedState,
      ...candidate,
      subjects: candidate.subjects,
      timetable: candidate.timetable ?? seedState.timetable,
      slots: candidate.slots ?? deriveDefaultSlots(candidate.timetable, candidate.subjects),
      logs: candidate.logs ?? {},
      notes: candidate.notes ?? {},
      overrides: candidate.overrides ?? {},
    };

    return { success: true, data: validated };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to parse JSON file.",
    };
  }
}
