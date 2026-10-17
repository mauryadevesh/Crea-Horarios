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
      <div className="relative z-20 rounded-2xl border border-[rgba(231,231,221,0.14)] bg-[#1b3f33]/95 px-4 py-3 text-sm shadow-md">
        <p className="text-xs uppercase tracking-[0.2em] text-[#a4b5aa]">Account</p>
        <div className="mt-2 flex items-center gap-3">
          <div className="flex-1">
            <p className="text-sm font-semibold text-[#e7e7dd]">{email}</p>
            <p className="text-xs text-[#a4b5aa]">Sync: {status}</p>
          </div>
          <button
            onClick={signOut}
            className="rounded-xl border border-[rgba(231,231,221,0.14)] bg-[#20493b] px-3.5 py-1.5 text-xs font-semibold text-[#f5f2df] transition hover:border-[rgba(231,231,221,0.3)]"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-20 rounded-2xl border border-[rgba(231,231,221,0.14)] bg-[#1b3f33]/95 px-4 py-3 shadow-md">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setMode("signin")}
          className={`rounded-full px-3.5 py-1 text-xs font-semibold transition ${
            mode === "signin"
              ? "bg-[#f5f2df] text-[#16362b] font-bold shadow-sm"
              : "border border-[rgba(231,231,221,0.14)] bg-[#20493b] text-[#a4b5aa] hover:border-[rgba(231,231,221,0.3)] hover:text-[#e7e7dd]"
          }`}
        >
          Sign in
        </button>
        <button
          onClick={() => setMode("signup")}
          className={`rounded-full px-3.5 py-1 text-xs font-semibold transition ${
            mode === "signup"
              ? "bg-[#f5f2df] text-[#16362b] font-bold shadow-sm"
              : "border border-[rgba(231,231,221,0.14)] bg-[#20493b] text-[#a4b5aa] hover:border-[rgba(231,231,221,0.3)] hover:text-[#e7e7dd]"
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
          className="rounded-xl border border-[rgba(231,231,221,0.16)] bg-[#122c23] px-3 py-2 text-xs text-[#e7e7dd] shadow-sm outline-none focus:border-[#f5f2df]"
        />
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password"
          className="rounded-xl border border-[rgba(231,231,221,0.16)] bg-[#122c23] px-3 py-2 text-xs text-[#e7e7dd] shadow-sm outline-none focus:border-[#f5f2df]"
        />
        {message && <p className="text-xs text-rose-300">{message}</p>}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="rounded-xl bg-[#f5f2df] px-3 py-2 text-xs font-bold text-[#16362b] transition hover:bg-[#ede8d0] disabled:opacity-60 shadow-sm"
        >
          {mode === "signin" ? "Sign in" : "Create account"}
        </button>
        <p className="text-[11px] text-[#a4b5aa]">
          Your timetable data syncs when logged in.
        </p>
      </div>
    </div>
  );
}
