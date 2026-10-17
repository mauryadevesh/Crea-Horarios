export type DayKey = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

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

export type TimetableState = {
  subjects: Subject[];
  timetable: Timetable;
  slots: TimetableSlot[];
  notes?: Record<string, string>;
};
