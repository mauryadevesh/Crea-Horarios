export type DayKey = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

export type AttendanceStatus = "attended" | "missed" | "cancelled";

export type Subject = {
  id: string;
  name: string;
  color: string;
  teacher?: string;
};

export type TimetableSlot = {
  id: string;
  day: DayKey;
  subjectId: string;
  room: string;
  startTime: string;
  endTime: string;
};

export type Timetable = Record<DayKey, string[]>;

export type DailyLog = Record<string, Record<string, AttendanceStatus>>; // date -> subjectId -> status
export type NotesLog = Record<string, Record<string, string>>; // date -> subjectId -> note

export type AttendanceState = {
  subjects: Subject[];
  timetable: Timetable;
  slots?: TimetableSlot[];
  logs: DailyLog;
  overrides: Record<string, string[]>; // date -> subjectIds
  notes: NotesLog;
  target: number; // percentage 0-100
};

export type SubjectSummary = {
  subjectId: string;
  attended: number;
  missed: number;
  cancelled: number;
  total: number;
  percentage: number;
  status: "safe" | "risk";
  requiredToRecover: number;
  bunkable: number;
  currentStreak: number;
};

export type OverallSummary = {
  attended: number;
  missed: number;
  cancelled: number;
  total: number;
  percentage: number;
};
