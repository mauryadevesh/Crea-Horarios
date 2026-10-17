import { useState } from "react";
import { useTimetable } from "../context/TimetableContext";

export default function AccountAuth() {
  const { user, signIn, signUp, signOut, status } = useTimetable();
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const err =
        mode === "signin"
          ? await signIn(email, password)
          : await signUp(email, password);

      if (err) {
        setErrorMsg(err);
      } else {
        setEmail("");
        setPassword("");
        setIsOpen(false);
      }
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return (
      <div className="relative z-20 rounded-2xl border border-[rgba(231,231,221,0.14)] bg-[#1b3f33]/95 px-4 py-3 text-xs shadow-md">
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-[#a4b5aa]">Account (JSON Storage)</span>
            <span className="font-semibold text-[#e7e7dd] text-sm truncate max-w-[180px]">{user.email}</span>
            <span className="text-[10px] text-[#c6d4cb]">
              Status: {status === "saved" ? "Data Saved" : "Active"}
            </span>
          </div>
          <button
            onClick={() => signOut()}
            className="rounded-xl border border-[rgba(231,231,221,0.16)] bg-[#20493b] px-3 py-1.5 font-semibold text-[#f5f2df] hover:border-[rgba(231,231,221,0.3)] transition"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-20">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="rounded-xl bg-[#f5f2df] px-4 py-2 text-xs font-bold text-[#16362b] hover:bg-[#ede8d0] transition shadow-sm"
        >
          Sign in / Register
        </button>
      ) : (
        <div className="w-72 sm:w-80 rounded-2xl border border-[rgba(231,231,221,0.16)] bg-[#1b3f33]/95 p-4 shadow-xl text-[#e7e7dd] backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-[rgba(231,231,221,0.12)] pb-2.5">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  setErrorMsg(null);
                }}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                  mode === "signin"
                    ? "bg-[#f5f2df] text-[#16362b] font-bold shadow-sm"
                    : "text-[#a4b5aa] hover:text-[#e7e7dd]"
                }`}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setErrorMsg(null);
                }}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                  mode === "signup"
                    ? "bg-[#f5f2df] text-[#16362b] font-bold shadow-sm"
                    : "text-[#a4b5aa] hover:text-[#e7e7dd]"
                }`}
              >
                Sign up
              </button>
            </div>
            <button
              onClick={() => {
                setIsOpen(false);
                setErrorMsg(null);
              }}
              className="text-xs text-[#a4b5aa] hover:text-[#e7e7dd] px-1"
            >
              Close
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-3 space-y-2.5">
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                required
                className="w-full rounded-xl border border-[rgba(231,231,221,0.16)] bg-[#122c23] px-3 py-2 text-xs text-[#e7e7dd] outline-none focus:border-[#f5f2df]"
              />
            </div>

            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="w-full rounded-xl border border-[rgba(231,231,221,0.16)] bg-[#122c23] px-3 py-2 text-xs text-[#e7e7dd] outline-none focus:border-[#f5f2df]"
              />
            </div>

            {errorMsg && (
              <p className="text-[11px] text-rose-300 font-medium">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#f5f2df] py-2 text-xs font-bold text-[#16362b] hover:bg-[#ede8d0] transition shadow-sm disabled:opacity-50"
            >
              {loading ? "Processing..." : mode === "signin" ? "Sign in" : "Create Account"}
            </button>

            <p className="text-[10px] text-center text-[#a4b5aa] pt-1">
              Data is saved automatically in your local JSON database.
            </p>
          </form>
        </div>
      )}
    </div>
  );
}
