import { motion } from "framer-motion";
import type { Subject, SubjectSummary } from "../lib/types";

const formatValue = (value: number) => (Number.isFinite(value) ? value.toFixed(1) : "0.0");

type SubjectCardProps = {
  subject: Subject;
  summary: SubjectSummary;
  target: number;
  onSelect?: (subjectId: string) => void;
};

export default function SubjectCard({ subject, summary, target, onSelect }: SubjectCardProps) {
  const percentage = summary.percentage;
  const safe = percentage >= target;
  const targetStreak = summary.requiredToRecover;
  const recoveryStreak = targetStreak > 0 ? Math.min(summary.currentStreak, targetStreak) : 0;
  const streakProgress = targetStreak > 0 ? recoveryStreak / targetStreak : 0;

  return (
    <motion.button
      type="button"
      onClick={() => onSelect?.(subject.id)}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="w-full rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-soft transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: subject.color }}
          />
          <div>
            <p className="text-sm font-semibold">{subject.name}</p>
            <p className="text-xs text-slate-400">{summary.attended} attended • {summary.total} total</p>
          </div>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            safe
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
              : "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300"
          }`}
        >
          {safe ? "Safe" : "Risk"}
        </span>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Attendance</span>
          <span>{formatValue(percentage)}%</span>
        </div>
        <div className="mt-2 h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, percentage)}%` }}
            transition={{ duration: 0.8 }}
            className="h-2 rounded-full"
            style={{ backgroundColor: safe ? "#10B981" : "#F43F5E" }}
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-slate-500">
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
          <p className="text-[11px] uppercase tracking-[0.2em]">Safe zone</p>
          <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
            {safe ? `${summary.bunkable} bunkable` : `${summary.requiredToRecover} to recover`}
          </p>
        </div>
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
          <p className="text-[11px] uppercase tracking-[0.2em]">Missed</p>
          <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
            {summary.missed} class{summary.missed !== 1 ? "es" : ""}
          </p>
        </div>
      </div>

      {!safe && targetStreak > 0 && (
        <div className="mt-4 rounded-xl border border-rose-200/40 bg-rose-500/10 p-3 text-xs text-rose-200">
          <p className="text-[11px] uppercase tracking-[0.2em]">Road to safety</p>
          <p className="mt-1 text-sm font-semibold text-rose-100">
            Streak: {recoveryStreak}/{targetStreak} • Attend the next {targetStreak} classes
          </p>
          <div className="mt-2 h-2 rounded-full bg-rose-500/20">
            <div
              className="h-2 rounded-full bg-rose-400"
              style={{ width: `${Math.round(streakProgress * 100)}%` }}
            />
          </div>
        </div>
      )}
    </motion.button>
  );
}
