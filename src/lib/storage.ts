import { useEffect, useMemo, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { TimetableState } from "./types";
import { seedState } from "../data/seed";
import {
  loadJsonDatabase,
  saveJsonDatabase,
  exportJsonDatabase,
  parseAndValidateJsonDatabase,
} from "./jsonDatabase";
import {
  getActiveUser,
  authenticateUser,
  registerUser,
  logoutUser,
  saveActiveUserData,
  type UserAccount,
} from "./jsonAuthDatabase";

type DbStatus = "ready" | "saved" | "error";

export type PersistentDatabaseState = {
  state: TimetableState;
  setState: Dispatch<SetStateAction<TimetableState>>;
  user: UserAccount | null;
  status: DbStatus;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  exportDatabase: (fileName?: string) => void;
  importDatabase: (jsonString: string) => { success: boolean; error?: string };
  resetDatabase: () => void;
};

export const usePersistentState = (): PersistentDatabaseState => {
  const [user, setUser] = useState<UserAccount | null>(() => getActiveUser());
  const [state, setState] = useState<TimetableState>(() => {
    const active = getActiveUser();
    if (active && active.data) {
      return active.data;
    }
    return loadJsonDatabase();
  });
  const [status, setStatus] = useState<DbStatus>("ready");
  const saveTimer = useRef<number | null>(null);

  useEffect(() => {
    if (saveTimer.current) {
      window.clearTimeout(saveTimer.current);
    }

    saveTimer.current = window.setTimeout(() => {
      try {
        saveJsonDatabase(state);
        if (user) {
          saveActiveUserData(state);
        }
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
  }, [state, user]);

  const signIn = async (email: string, password: string): Promise<string | null> => {
    const res = authenticateUser(email, password);
    if (!res.success || !res.user) {
      return res.error ?? "Failed to sign in.";
    }
    setUser(res.user);
    if (res.user.data) {
      setState(res.user.data);
      saveJsonDatabase(res.user.data);
    }
    setStatus("saved");
    return null;
  };

  const signUp = async (email: string, password: string): Promise<string | null> => {
    const res = registerUser(email, password, state);
    if (!res.success || !res.user) {
      return res.error ?? "Failed to register account.";
    }
    setUser(res.user);
    setStatus("saved");
    return null;
  };

  const signOut = async (): Promise<void> => {
    logoutUser();
    setUser(null);
    setStatus("ready");
  };

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
    if (user) {
      saveActiveUserData(res.data);
    }
    setStatus("saved");
    return { success: true };
  };

  const resetDatabase = () => {
    setState(seedState);
    saveJsonDatabase(seedState);
    if (user) {
      saveActiveUserData(seedState);
    }
    setStatus("saved");
  };

  return useMemo(
    () => ({
      state,
      setState,
      user,
      status,
      signIn,
      signUp,
      signOut,
      exportDatabase,
      importDatabase,
      resetDatabase,
    }),
    [state, user, status]
  );
};
