import { useEffect, useMemo, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { AttendanceState } from "./types";
import { seedState } from "../data/seed";
import {
  loadJsonDatabase,
  saveJsonDatabase,
  exportJsonDatabase,
  parseAndValidateJsonDatabase,
} from "./jsonDatabase";

type DbStatus = "ready" | "saved" | "error";

export type PersistentDatabaseState = {
  state: AttendanceState;
  setState: Dispatch<SetStateAction<AttendanceState>>;
  status: DbStatus;
  exportDatabase: (fileName?: string) => void;
  importDatabase: (jsonString: string) => { success: boolean; error?: string };
  resetDatabase: () => void;
};

export const usePersistentState = (): PersistentDatabaseState => {
  const [state, setState] = useState<AttendanceState>(() => loadJsonDatabase());
  const [status, setStatus] = useState<DbStatus>("ready");
  const saveTimer = useRef<number | null>(null);

  useEffect(() => {
    if (saveTimer.current) {
      window.clearTimeout(saveTimer.current);
    }

    saveTimer.current = window.setTimeout(() => {
      try {
        saveJsonDatabase(state);
        setStatus("saved");
      } catch {
        setStatus("error");
      }
    }, 250);

    return () => {
      if (saveTimer.current) {
        window.clearTimeout(saveTimer.current);
      }
    };
  }, [state]);

  const exportDatabase = (fileName?: string) => {
    exportJsonDatabase(state, fileName);
  };

  const importDatabase = (jsonString: string) => {
    const res = parseAndValidateJsonDatabase(jsonString);
    if (!res.success) {
      return { success: false, error: res.error };
    }
    setState(res.data);
    saveJsonDatabase(res.data);
    setStatus("saved");
    return { success: true };
  };

  const resetDatabase = () => {
    setState(seedState);
    saveJsonDatabase(seedState);
    setStatus("saved");
  };

  return useMemo(
    () => ({
      state,
      setState,
      status,
      exportDatabase,
      importDatabase,
      resetDatabase,
    }),
    [state, status]
  );
};
