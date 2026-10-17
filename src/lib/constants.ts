export const STORAGE_KEY = "weekly-timetable-maker-state";

export const SUBJECT_COLOR_PALETTE = [
  "#A8C5B2", // Sage
  "#EAE4D3", // Almond cream
  "#82A796", // Eucalyptus
  "#D5C7B3", // Sandstone
  "#6C9484", // Spruce
  "#C89F88", // Terracotta
  "#9AA882", // Olive
  "#B8CEBF", // Pale mist
  "#BA9C7F", // Warm cedar
  "#7DA294", // Seafoam slate
  "#B3A277", // Muted brass
  "#5D8370", // Deep foliage
  "#96B09E", // Herbal green
];

export const DEFAULT_SUBJECTS = [
  { id: "ADSA", name: "ADSA", color: SUBJECT_COLOR_PALETTE[0], teacher: "Prof. Alan Turing" },
  { id: "adsa-lab", name: "ADSA (LAB)", color: SUBJECT_COLOR_PALETTE[2], teacher: "Prof. Alan Turing" },
  { id: "DBMS", name: "DBMS", color: SUBJECT_COLOR_PALETTE[1], teacher: "Dr. Edgar Codd" },
  { id: "dbms", name: "DBMS (LAB)", color: SUBJECT_COLOR_PALETTE[3], teacher: "Dr. Edgar Codd" },
  { id: "AT", name: "AT", color: SUBJECT_COLOR_PALETTE[4], teacher: "Dr. Ada Lovelace" },
  { id: "ED", name: "ED", color: SUBJECT_COLOR_PALETTE[5], teacher: "Prof. Claude Shannon" },
  { id: "dmgt", name: "DMGT", color: SUBJECT_COLOR_PALETTE[6], teacher: "Prof. George Boole" },
];
