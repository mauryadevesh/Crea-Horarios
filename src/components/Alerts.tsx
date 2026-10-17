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
      className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-900 shadow-soft dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold">Attendance alert</p>
          <p className="text-sm opacity-80">
            {critical.length} subject{critical.length > 1 ? "s" : ""} are critically below target.
          </p>
        </div>
        <div className="text-sm opacity-80">
          Focus on: {critical
            .map((item) => subjects.find((subject) => subject.id === item.subjectId)?.name ?? item.subjectId)
            .join(", ")}
        </div>
      </div>
    </motion.div>
  );
}
