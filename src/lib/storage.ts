import { useEffect, useMemo, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { AttendanceState } from "./types";
import { seedState } from "../data/seed";
import { supabase, supabaseAnonKey, supabaseUrl } from "./supabase";
import { deriveDefaultSlots } from "./conflicts";
import { STORAGE_KEY } from "./constants";

const TABLE = "attendance_state";
type SyncStatus = "idle" | "loading" | "synced" | "error";

type SyncedState = {
  state: AttendanceState;
  setState: Dispatch<SetStateAction<AttendanceState>>;
  session: { user: { id: string; email?: string | null } } | null;
  loading: boolean;
  status: SyncStatus;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
};

const mergeState = (incoming?: AttendanceState | null): AttendanceState => {
  if (!incoming) return seedState;
  const subjects = incoming.subjects ?? seedState.subjects;
  const timetable = incoming.timetable ?? seedState.timetable;
  return {
    ...seedState,
    ...incoming,
    subjects,
    timetable,
    slots: incoming.slots ?? deriveDefaultSlots(timetable, subjects),
    overrides: incoming.overrides ?? {},
    notes: incoming.notes ?? {},
  };
};

export const usePersistentState = (): SyncedState => {
  const [state, setState] = useState<AttendanceState>(seedState);
  const [session, setSession] = useState<SyncedState["session"]>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<SyncStatus>("idle");
  const [remoteLoaded, setRemoteLoaded] = useState(false);
  const saveTimer = useRef<number | null>(null);
  const latestState = useRef(state);
  const pendingLocalChanges = useRef(false);
  const hasLocalSnapshot = useRef(false);

  useEffect(() => {
    latestState.current = state;
    if (!remoteLoaded && hasLocalSnapshot.current) {
      pendingLocalChanges.current = true;
    }
  }, [state, remoteLoaded]);


  const saveRemoteState = async (payload: AttendanceState) => {
    if (!session || !supabase || !remoteLoaded) return;
    const client = supabase;
    setStatus("loading");
    const { error } = await client.from(TABLE).upsert({
      user_id: session.user.id,
      state: payload,
      updated_at: new Date().toISOString(),
    });
    setStatus(error ? "error" : "synced");
  };

  const saveRemoteStateKeepalive = () => {
    if (!session || !supabaseUrl || !supabaseAnonKey || !remoteLoaded) return;
    const body = JSON.stringify({
      user_id: session.user.id,
      state: latestState.current,
      updated_at: new Date().toISOString(),
    });

    fetch(`${supabaseUrl}/rest/v1/${TABLE}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
        Prefer: "resolution=merge-duplicates",
      },
      body,
      keepalive: true,
    }).catch(() => undefined);
  };

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as AttendanceState;
        setState(mergeState(parsed));
        hasLocalSnapshot.current = true;
      } catch {
        setState(seedState);
        hasLocalSnapshot.current = false;
      }
    }
  }, []);


  const hasLocalEdits = (snapshot: AttendanceState) => {
    if (snapshot.target !== seedState.target) return true;
    if (snapshot.subjects.length !== seedState.subjects.length) return true;
    if (
      snapshot.subjects.some((subject, index) => {
        const seedSubject = seedState.subjects[index];
        return (
          !seedSubject ||
          seedSubject.id !== subject.id ||
          seedSubject.name !== subject.name ||
          seedSubject.color !== subject.color
        );
      })
    ) {
      return true;
    }
    if (JSON.stringify(snapshot.timetable) !== JSON.stringify(seedState.timetable)) return true;
    if (Object.keys(snapshot.logs).length > 0) return true;
    if (Object.keys(snapshot.notes).length > 0) return true;
    if (Object.keys(snapshot.overrides).length > 0) return true;
    return false;
  };


  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    const client = supabase;
    let mounted = true;

    const init = async () => {
      const { data } = await client.auth.getSession();
      if (!mounted) return;
      setSession(data.session ? { user: data.session.user } : null);
      setLoading(false);
    };

    init();

    const { data: listener } = client.auth.onAuthStateChange((_event, authSession) => {
      if (!mounted) return;
      setSession(authSession ? { user: authSession.user } : null);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session || !supabase) return;
    const client = supabase;
    setRemoteLoaded(false);
    const fetchState = async () => {
      setStatus("loading");
      const { data, error } = await client
        .from(TABLE)
        .select("state")
        .eq("user_id", session.user.id)
        .single();
      if (error && error.code !== "PGRST116") {
        setStatus("error");
        return;
      }
      if (data?.state) {
        const remoteState = data.state as AttendanceState;
        if (pendingLocalChanges.current && hasLocalEdits(latestState.current)) {
          const merged = mergeState({
            ...remoteState,
            ...latestState.current,
          });
          setState(merged);
        } else {
          setState(mergeState(remoteState));
        }
      }
      setStatus("synced");
      setRemoteLoaded(true);
      pendingLocalChanges.current = false;
    };

    fetchState();
  }, [session]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

    if (!session || !supabase || !remoteLoaded) return;

    if (saveTimer.current) {
      window.clearTimeout(saveTimer.current);
    }

    saveTimer.current = window.setTimeout(() => {
      saveRemoteState(latestState.current).catch(() => undefined);
    }, 500);

  }, [state, session, remoteLoaded]);

  useEffect(() => {
    if (!session || !supabaseUrl || !supabaseAnonKey || !remoteLoaded) return;

    const flushPendingSave = () => {
      if (saveTimer.current) {
        window.clearTimeout(saveTimer.current);
        saveTimer.current = null;
      }
      saveRemoteStateKeepalive();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        flushPendingSave();
      }
    };

    window.addEventListener("pagehide", flushPendingSave);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("pagehide", flushPendingSave);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [session, remoteLoaded]);

  const signIn = async (email: string, password: string) => {
    if (!supabase) return "Supabase is not configured.";
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error?.message ?? null;
  };

  const signUp = async (email: string, password: string) => {
    if (!supabase) return "Supabase is not configured.";
    const { error } = await supabase.auth.signUp({ email, password });
    return error?.message ?? null;
  };

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  };

  return useMemo(
    () => ({ state, setState, session, loading, status, signIn, signUp, signOut }),
    [state, session, loading, status]
  );
};
