import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { AttendanceStatus, Subject } from "../lib/types";

const statusStyles: Record<AttendanceStatus, string> = {
  attended: "bg-emerald-500/20 text-emerald-200",
  missed: "bg-rose-500/20 text-rose-200",
  cancelled: "bg-slate-500/20 text-slate-200",
};

type SubjectHistoryModalProps = {
  open: boolean;
  subject: Subject | null;
  entries: { dateKey: string; status: AttendanceStatus; note?: string }[];
  onUpdateStatus: (dateKey: string, status: AttendanceStatus) => void;
  onUpdateNote: (dateKey: string, note: string) => void;
  onClose: () => void;
};

export default function SubjectHistoryModal({
  open,
  subject,
  entries,
  onUpdateStatus,
  onUpdateNote,
  onClose,
}: SubjectHistoryModalProps) {
  const [showSaved, setShowSaved] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const notifySaved = () => {
    setShowSaved(true);
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }
    timerRef.current = window.setTimeout(() => setShowSaved(false), 1200);
  };
  return (
    <AnimatePresence>
      {open && subject && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-xl rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-soft"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-slate-400">Subject history</p>
                <h3 className="mt-1 text-2xl font-semibold text-slate-100">
                  {subject.name}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="rounded-full border border-slate-700 px-3 py-1 text-xs font-semibold text-slate-300 hover:border-slate-500"
              >
                Close
              </button>
            </div>

            <div className="mt-6 max-h-80 space-y-3 overflow-auto pr-1">
              {showSaved && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200"
                >
                  Saved
                </motion.div>
              )}
              {entries.length === 0 ? (
                <p className="text-sm text-slate-400">No logs for this subject yet.</p>
              ) : (
                entries.map((entry) => (
                  <div
                    key={entry.dateKey}
                    className="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-200"
                  >
                    <div className="flex items-center justify-between">
                      <span>{entry.dateKey}</span>
                      <div className="flex flex-wrap gap-2">
                        {(["attended", "missed", "cancelled"] as const).map((status) => (
                          <button
                            key={status}
                            onClick={() => {
                              onUpdateStatus(entry.dateKey, status);
                              notifySaved();
                            }}
                            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                              entry.status === status
                                ? statusStyles[status]
                                : "border border-slate-700 text-slate-300"
                            }`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="mt-3">
                      <input
                        value={entry.note ?? ""}
                        onChange={(event) => onUpdateNote(entry.dateKey, event.target.value)}
                        placeholder="Add a note (e.g., medical leave, proxy)"
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 outline-none focus:border-slate-600"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
