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
      className="group rounded-2xl border border-[rgba(231,231,221,0.14)] bg-[#1b3f33] p-6 shadow-sm text-[#e7e7dd]"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-[#e7e7dd]">
        <div>
          <h3 className="text-lg font-bold text-[#e7e7dd]">Feedback & Suggestions</h3>
          <p className="text-sm text-[#a4b5aa] mt-0.5">Help improve the Timetable Maker experience.</p>
        </div>
        <div className="flex items-center gap-3">
          {status === "sent" && (
            <span className="rounded-full bg-[#20493b] border border-[rgba(231,231,221,0.14)] px-3 py-1 text-xs font-semibold text-[#f5f2df]">
              Feedback received
            </span>
          )}
          <span className="text-xs font-bold text-[#a4b5aa] transition group-open:rotate-180">
            [+]
          </span>
        </div>
      </summary>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-xs font-semibold text-[#a4b5aa] uppercase tracking-wider">Category</label>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="mt-2 w-full rounded-xl border border-[rgba(231,231,221,0.16)] bg-[#122c23] px-4 py-2.5 text-sm text-[#e7e7dd] shadow-sm outline-none focus:border-[#f5f2df]"
          >
            <option value="general">General</option>
            <option value="bugs">Bug report</option>
            <option value="feature">Feature request</option>
            <option value="ui">UI/UX & Themes</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-[#a4b5aa] uppercase tracking-wider">Rating</label>
          <div className="mt-2 flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                onClick={() => setRating(value)}
                className={`h-10 w-10 rounded-xl text-sm font-semibold transition ${
                  rating >= value
                    ? "bg-[#f5f2df] text-[#16362b] font-bold shadow-sm"
                    : "border border-[rgba(231,231,221,0.14)] bg-[#20493b] text-[#a4b5aa] hover:border-[rgba(231,231,221,0.3)] hover:text-[#e7e7dd]"
                }`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <label className="text-xs font-semibold text-[#a4b5aa] uppercase tracking-wider">Message</label>
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={3}
          placeholder="What should be improved?"
          className="mt-2 w-full rounded-xl border border-[rgba(231,231,221,0.16)] bg-[#122c23] px-4 py-2.5 text-sm text-[#e7e7dd] shadow-sm outline-none focus:border-[#f5f2df]"
        />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
        <div>
          <label className="text-xs font-semibold text-[#a4b5aa] uppercase tracking-wider">Email (optional)</label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className="mt-2 w-full rounded-xl border border-[rgba(231,231,221,0.16)] bg-[#122c23] px-4 py-2.5 text-sm text-[#e7e7dd] shadow-sm outline-none focus:border-[#f5f2df]"
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={submit}
            disabled={status === "sending"}
            className="w-full rounded-xl bg-[#f5f2df] px-6 py-2.5 text-sm font-bold text-[#16362b] hover:bg-[#ede8d0] disabled:opacity-60 transition shadow-sm"
          >
            {status === "sending" ? "Sending..." : "Send feedback"}
          </button>
        </div>
      </div>

      {errorMessage && <p className="mt-3 text-xs text-rose-300">{errorMessage}</p>}
    </details>
  );
}
