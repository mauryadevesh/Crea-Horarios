import { motion } from "framer-motion";
import type { Subject, SubjectSummary } from "../lib/types";

const CRITICAL_OFFSET = 10;

type AlertsProps = {
  summaries: SubjectSummary[];
  subjects: Subject[];
  target: number;
};

export default function Alerts({ summaries, subjects, target }: AlertsProps) {
  const critical = summaries.filter(
    (summary) => summary.total > 0 && summary.percentage < target - CRITICAL_OFFSET
  );

  if (critical.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-rose-500/30 bg-[#2b1f24] p-4 text-rose-200 shadow-sm"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-rose-100 flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider rounded bg-rose-900/60 px-2 py-0.5 text-rose-200">
              Alert
            </span>
            <span>Attendance below required threshold</span>
          </p>
          <p className="text-xs text-rose-300 mt-1">
            {critical.length} subject{critical.length > 1 ? "s" : ""} require attention to maintain targets.
          </p>
        </div>
        <div className="text-xs text-rose-300">
          Subjects: {critical
            .map((item) => subjects.find((subject) => subject.id === item.subjectId)?.name ?? item.subjectId)
            .join(", ")}
        </div>
      </div>
    </motion.div>
  );
}
