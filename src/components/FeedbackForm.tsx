import { useState } from "react";
const FEEDBACK_WEBHOOK_URL = import.meta.env.VITE_FEEDBACK_WEBHOOK_URL as string | undefined;

export default function FeedbackForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [category, setCategory] = useState("general");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const submit = async () => {
    setErrorMessage(null);
    if (!message.trim()) {
      setErrorMessage("Please add a message.");
      return;
    }
    if (!FEEDBACK_WEBHOOK_URL) {
      setErrorMessage("Feedback is not configured yet.");
      return;
    }
    setStatus("sending");
    const formData = new FormData();
    formData.append("rating", String(rating));
    formData.append("category", category);
    formData.append("message", message.trim());
    formData.append("email", email.trim());

    const response = await fetch(FEEDBACK_WEBHOOK_URL, {
      method: "POST",
      body: formData,
    }).catch(() => null);

    if (!response || !response.ok) {
      setStatus("error");
      setErrorMessage("Failed to send feedback. Please try again.");
      return;
    }

    setStatus("sent");
    setMessage("");
    setEmail("");
    setIsOpen(false);
  };

  return (
    <details
      open={isOpen}
      onToggle={(event) => setIsOpen(event.currentTarget.open)}
      className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-slate-100">
        <div>
          <h3 className="text-lg font-semibold">Feedback</h3>
          <p className="text-sm text-slate-500">Help improve the experience.</p>
        </div>
        <div className="flex items-center gap-3">
          {status === "sent" && (
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
              Thanks for your feedback
            </span>
          )}
          <span className="text-xs text-slate-400 transition group-open:rotate-180">▾</span>
        </div>
      </summary>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-xs font-semibold text-slate-500">Category</label>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-950"
          >
            <option value="general">General</option>
            <option value="bugs">Bug report</option>
            <option value="feature">Feature request</option>
            <option value="ui">UI/UX</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500">Rating</label>
          <div className="mt-2 flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                onClick={() => setRating(value)}
                className={`h-10 w-10 rounded-full text-sm font-semibold transition ${
                  rating >= value
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                    : "border border-slate-200 text-slate-400 dark:border-slate-700 dark:text-slate-500"
                }`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <label className="text-xs font-semibold text-slate-500">Message</label>
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={4}
          placeholder="What should be improved?"
          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-950"
        />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
        <div>
          <label className="text-xs font-semibold text-slate-500">Email (optional)</label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-950"
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={submit}
            disabled={status === "sending"}
            className="w-full rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60 dark:bg-white dark:text-slate-900"
          >
            {status === "sending" ? "Sending..." : "Send feedback"}
          </button>
        </div>
      </div>

      {errorMessage && <p className="mt-3 text-xs text-rose-500">{errorMessage}</p>}
    </details>
  );
}
