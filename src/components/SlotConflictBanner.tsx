import { motion, AnimatePresence } from "framer-motion";
import type { TimetableConflict } from "../lib/conflicts";

type SlotConflictBannerProps = {
  conflicts: TimetableConflict[];
};

export default function SlotConflictBanner({ conflicts }: SlotConflictBannerProps) {
  if (conflicts.length === 0) {
    return (
      <div className="flex items-center gap-2.5 rounded-xl border border-[rgba(231,231,221,0.12)] bg-[#1b3f33] px-4 py-3 text-xs font-medium text-[#c6d4cb]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#f5f2df]" />
        <span>Schedule clear — zero room, faculty, or time conflicts detected.</span>
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        className="rounded-xl border border-rose-500/30 bg-[#2b1f24] p-4 text-rose-200"
      >
        <div className="flex items-start gap-3">
          <div className="flex-1 space-y-1">
            <p className="text-sm font-semibold text-rose-100 flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest rounded bg-rose-900/60 px-2 py-0.5 text-rose-300">
                Conflict Alert
              </span>
              <span>
                {conflicts.length} Schedule Clash{conflicts.length > 1 ? "es" : ""} Detected
              </span>
            </p>
            <ul className="mt-2 space-y-1.5 text-xs">
              {conflicts.map((conflict, index) => (
                <li key={index} className="flex items-start gap-2 text-rose-300">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" />
                  <span>
                    <strong className="text-rose-100 uppercase tracking-wider text-[10px] mr-1">
                      [{conflict.type}]
                    </strong>
                    {conflict.message}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
