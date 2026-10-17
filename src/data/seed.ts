import type { AttendanceState, Timetable } from "../lib/types";
import { DEFAULT_SUBJECTS } from "../lib/constants";

const timetable: Timetable = {
  Mon: ["psde", "ds-lab", "mppl-lab", "cc-th", "ds-th", "mp-lab"],
  Tue: ["mp-lab", "mppl-lab", "ds-lab", "uhv", "eg-th"],
  Wed: ["uhv", "psde", "idea-lab", "mp-th"],
  Thu: ["eg-lab", "ds-th", "cc-lab", "mppl-th"],
  Fri: ["workshop", "idea-lab-th", "ds-th", "eg-th", "mp-lab"],
  Sat: [],
  Sun: [],
};

export const seedState: AttendanceState = {
  target: 75,
  subjects: DEFAULT_SUBJECTS,
  timetable,
  logs: {},
  overrides: {},
  notes: {},
};
