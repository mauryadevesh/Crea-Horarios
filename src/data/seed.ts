import type { AttendanceState, Timetable } from "../lib/types";
import { DEFAULT_SUBJECTS } from "../lib/constants";
import { deriveDefaultSlots } from "../lib/conflicts";

const timetable: Timetable = {
  Mon: ["ADSA", "adsa-lab", "DBMS"],
  Tue: ["dbms", "AT", "ED"],
  Wed: ["dmgt", "ADSA", "DBMS"],
  Thu: ["AT", "ED", "dmgt"],
  Fri: ["ADSA", "dbms", "DBMS"],
  Sat: [],
  Sun: [],
};

const slots = deriveDefaultSlots(timetable, DEFAULT_SUBJECTS);

export const seedState: AttendanceState = {
  target: 75,
  subjects: DEFAULT_SUBJECTS,
  timetable,
  slots,
  logs: {},
  overrides: {},
  notes: {},
};
