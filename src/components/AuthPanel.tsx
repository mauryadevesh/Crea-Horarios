import { useState } from "react";
import { useAttendance } from "../context/AttendanceContext";

export default function AuthPanel() {
  const { session, loading, status, signIn, signUp, signOut } = useAttendance();
  const email = session?.user.email;
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [formEmail, setFormEmail] = useState(email ?? "");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    setMessage(null);
    if (!formEmail || !password) {
      setMessage("Email and password are required.");
      return;
    }
    const error = mode === "signin" ? await signIn(formEmail, password) : await signUp(formEmail, password);
    if (error) setMessage(error);
  };

  if (email) {
    return (
      <div className="glass relative z-20 rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-soft dark:border-slate-800">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Account</p>
        <div className="mt-2 flex items-center gap-3">
          <div className="flex-1">
            <p className="text-sm font-semibold">{email}</p>
            <p className="text-xs text-slate-500">Sync: {status}</p>
          </div>
          <button
            onClick={signOut}
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-500 transition hover:border-slate-400 hover:text-slate-800 dark:border-slate-700 dark:text-slate-300"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="glass relative z-20 rounded-2xl border border-slate-200 px-4 py-3 shadow-soft dark:border-slate-800">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setMode("signin")}
          className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
            mode === "signin"
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
              : "border border-slate-200 text-slate-500 dark:border-slate-700 dark:text-slate-300"
          }`}
        >
          Sign in
        </button>
        <button
          onClick={() => setMode("signup")}
          className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
            mode === "signup"
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
              : "border border-slate-200 text-slate-500 dark:border-slate-700 dark:text-slate-300"
          }`}
        >
          Sign up
        </button>
      </div>
      <div className="mt-3 flex flex-col gap-2">
        <input
          type="email"
          value={formEmail}
          onChange={(event) => setFormEmail(event.target.value)}
          placeholder="Email"
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 shadow-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
        />
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password"
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 shadow-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
        />
        {message && <p className="text-xs text-rose-500">{message}</p>}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60 dark:bg-white dark:text-slate-900"
        >
          {mode === "signin" ? "Sign in" : "Create account"}
        </button>
        <p className="text-[11px] text-slate-500">
          Your data syncs to Supabase when logged in.
        </p>
      </div>
    </div>
  );
}
