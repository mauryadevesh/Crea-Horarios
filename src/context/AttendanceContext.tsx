import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import { usePersistentState } from "../lib/storage";

type AttendanceContextValue = ReturnType<typeof usePersistentState>;

const AttendanceContext = createContext<AttendanceContextValue | null>(null);

type AttendanceProviderProps = {
  children: ReactNode;
};

export function AttendanceProvider({ children }: AttendanceProviderProps) {
  const value = usePersistentState();
  return <AttendanceContext.Provider value={value}>{children}</AttendanceContext.Provider>;
}

export function useAttendance() {
  const context = useContext(AttendanceContext);
  if (!context) {
    throw new Error("useAttendance must be used within AttendanceProvider");
  }
  return context;
}
