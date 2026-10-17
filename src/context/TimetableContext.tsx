import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import { usePersistentState } from "../lib/storage";

type TimetableContextValue = ReturnType<typeof usePersistentState>;

const TimetableContext = createContext<TimetableContextValue | null>(null);

type TimetableProviderProps = {
  children: ReactNode;
};

export function TimetableProvider({ children }: TimetableProviderProps) {
  const value = usePersistentState();
  return <TimetableContext.Provider value={value}>{children}</TimetableContext.Provider>;
}

export function useTimetable() {
  const context = useContext(TimetableContext);
  if (!context) {
    throw new Error("useTimetable must be used within TimetableProvider");
  }
  return context;
}
