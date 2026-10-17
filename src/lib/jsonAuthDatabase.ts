import type { TimetableState } from "./types";
import { seedState } from "../data/seed";
import { deriveDefaultSlots } from "./conflicts";

export interface UserAccount {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  lastLogin: string;
  data: TimetableState;
}

export interface JsonAuthDatabase {
  version: "1.0.0";
  activeUserId: string | null;
  users: Record<string, UserAccount>;
}

const AUTH_DB_KEY = "weekly_timetable_auth_db_v1";

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString(36);
}

export function loadAuthDatabase(): JsonAuthDatabase {
  try {
    const raw = localStorage.getItem(AUTH_DB_KEY);
    if (!raw) {
      return {
        version: "1.0.0",
        activeUserId: null,
        users: {},
      };
    }
    const parsed = JSON.parse(raw);
    return {
      version: "1.0.0",
      activeUserId: parsed.activeUserId ?? null,
      users: parsed.users ?? {},
    };
  } catch (err) {
    console.error("Failed to load JSON auth database", err);
    return {
      version: "1.0.0",
      activeUserId: null,
      users: {},
    };
  }
}

export function saveAuthDatabase(db: JsonAuthDatabase): void {
  try {
    localStorage.setItem(AUTH_DB_KEY, JSON.stringify(db));
  } catch (err) {
    console.error("Failed to persist JSON auth database", err);
  }
}

export function registerUser(
  email: string,
  password: string,
  initialState?: TimetableState
): { success: boolean; error?: string; user?: UserAccount } {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail || !normalizedEmail.includes("@")) {
    return { success: false, error: "Please enter a valid email address." };
  }
  if (!password || password.length < 4) {
    return { success: false, error: "Password must be at least 4 characters." };
  }

  const db = loadAuthDatabase();
  const existingId = Object.keys(db.users).find(
    (id) => db.users[id].email.toLowerCase() === normalizedEmail
  );
  if (existingId) {
    return { success: false, error: "An account with this email already exists." };
  }

  const id = "usr_" + Math.random().toString(36).substring(2, 10);
  const baseData = initialState ?? seedState;
  const user: UserAccount = {
    id,
    email: normalizedEmail,
    passwordHash: simpleHash(password),
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    data: {
      ...baseData,
      slots: baseData.slots ?? deriveDefaultSlots(baseData.timetable, baseData.subjects),
    },
  };

  db.users[id] = user;
  db.activeUserId = id;
  saveAuthDatabase(db);

  return { success: true, user };
}

export function authenticateUser(
  email: string,
  password: string
): { success: boolean; error?: string; user?: UserAccount } {
  const normalizedEmail = email.trim().toLowerCase();
  const db = loadAuthDatabase();
  const userId = Object.keys(db.users).find(
    (id) => db.users[id].email.toLowerCase() === normalizedEmail
  );

  if (!userId) {
    return { success: false, error: "Account not found. Please sign up first." };
  }

  const user = db.users[userId];
  if (user.passwordHash !== simpleHash(password)) {
    return { success: false, error: "Incorrect password." };
  }

  user.lastLogin = new Date().toISOString();
  db.activeUserId = userId;
  saveAuthDatabase(db);

  return { success: true, user };
}

export function logoutUser(): void {
  const db = loadAuthDatabase();
  db.activeUserId = null;
  saveAuthDatabase(db);
}

export function getActiveUser(): UserAccount | null {
  const db = loadAuthDatabase();
  if (!db.activeUserId) return null;
  return db.users[db.activeUserId] ?? null;
}

export function saveActiveUserData(state: TimetableState): void {
  const db = loadAuthDatabase();
  if (!db.activeUserId || !db.users[db.activeUserId]) return;

  db.users[db.activeUserId].data = {
    ...state,
    slots: state.slots ?? deriveDefaultSlots(state.timetable, state.subjects),
  };
  saveAuthDatabase(db);
}
