import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { computeSubjectSummary } from "./lib/attendance";
import { AttendanceProvider, useAttendance } from "./context/AttendanceContext";
import Alerts from "./components/Alerts";
import TimetableSetup from "./components/TimetableSetup";
import DailyLogging from "./components/DailyLogging";
import JsonDatabasePanel from "./components/JsonDatabasePanel";
import FeedbackForm from "./components/FeedbackForm";

const tabs = [
  { id: "timetable", label: "Timetable" },
  { id: "daily", label: "Log" },
] as const;

type TabId = (typeof tabs)[number]["id"];

function AppContent() {
  const { state } = useAttendance();
  const [activeTab, setActiveTab] = useState<TabId>("timetable");

  const summary = useMemo(
    () => computeSubjectSummary(state),
    [state]
  );

  return (
    <main className="min-h-screen bg-surface-light text-slate-900 dark:bg-surface-dark dark:text-slate-100">
      <section className="mx-auto max-w-6xl px-3.5 sm:px-6 lg:px-8 pb-16 pt-6 sm:pt-10">
        <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="font-dawnwalker text-[11px] sm:text-xs uppercase tracking-[0.25em] text-[#a4b5aa]">
              Weekly Timetable Maker
            </p>
            <h1 className="font-rogenz mt-2 text-2xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-[#e7e7dd]">
              Conflict-free timetable planner
            </h1>
            <p className="mt-2.5 sm:mt-3 text-xs sm:text-sm text-[#a4b5aa] leading-relaxed">
              Build your weekly schedule with teacher and room assignments, preventing double-bookings and clashes automatically.
            </p>
          </div>
          <div className="flex flex-col gap-4 sm:items-start lg:items-end w-full lg:w-auto">
            <JsonDatabasePanel />
          </div>
        </header>

        <section className="mt-6 sm:mt-8" aria-label="Alerts">
          <Alerts summaries={summary.subjectSummaries} subjects={state.subjects} target={state.target} />
        </section>

        <div className="mt-8 flex justify-start">
          <nav
            className="relative z-10 flex w-full sm:w-auto items-center justify-center gap-2 rounded-full border border-[rgba(231,231,221,0.14)] bg-[#1b3f33]/90 p-1.5 text-sm shadow-soft backdrop-blur"
            aria-label="Primary"
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex-1 sm:flex-initial rounded-full px-6 py-2.5 text-xs font-semibold transition-colors ${
                  activeTab === tab.id
                    ? "text-[#16362b] font-bold"
                    : "text-[#a4b5aa] hover:text-[#e7e7dd]"
                }`}
              >
                {activeTab === tab.id && (
                  <motion.span
                    layoutId="active-tab"
                    className="absolute inset-0 rounded-full bg-[#f5f2df] shadow-sm"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <section className="mt-8" aria-live="polite">
          <AnimatePresence mode="wait">
            {activeTab === "timetable" && (
              <motion.article
                key="timetable"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
              >
                <TimetableSetup />
              </motion.article>
            )}
            {activeTab === "daily" && (
              <motion.article
                key="daily"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
              >
                <DailyLogging />
                <div className="mt-8">
                  <FeedbackForm />
                </div>
              </motion.article>
            )}
          </AnimatePresence>
        </section>
      </section>
    </main>
  );
}

export default function App() {
  return (
    <AttendanceProvider>
      <AppContent />
    </AttendanceProvider>
  );
}
