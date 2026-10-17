import { motion } from "framer-motion";
import { useAttendance } from "../context/AttendanceContext";

const clamp = (value: number) => Math.min(Math.max(value, 50), 95);

export default function TargetMode() {
  const { state, setState } = useAttendance();
  const target = state.target;
  const updateTarget = (value: number) => {
    setState({ ...state, target: clamp(value) });
  };
  return (
    <div className="glass rounded-2xl border border-slate-200 px-4 py-3 shadow-soft dark:border-slate-800">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Target mode</p>
          <p className="text-sm text-slate-600 dark:text-slate-300">Adjust required attendance</p>
        </div>
        <motion.div
          key={target}
          initial={{ scale: 0.9, opacity: 0.6 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-2xl font-semibold"
        >
          {target}%
        </motion.div>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <input
          type="range"
          min={50}
          max={95}
          value={target}
          onChange={(event) => updateTarget(Number(event.target.value))}
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-slate-900 dark:bg-slate-700 dark:accent-white"
        />
        <input
          type="number"
          min={50}
          max={95}
          value={target}
          onChange={(event) => updateTarget(Number(event.target.value))}
          className="w-16 rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm text-slate-900 shadow-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        />
      </div>
    </div>
  );
}
