import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { computeSubjectSummary } from "./lib/attendance";
import { AttendanceProvider, useAttendance } from "./context/AttendanceContext";
import Alerts from "./components/Alerts";
import TimetableSetup from "./components/TimetableSetup";
import DailyLogging from "./components/DailyLogging";
import AuthPanel from "./components/AuthPanel";
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
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-dawnwalker text-xs sm:text-sm uppercase tracking-[0.25em] text-[#a4b5aa]">
              Weekly Timetable Maker
            </p>
            <h1 className="font-rogenz mt-2 text-3xl font-normal tracking-tight sm:text-4xl lg:text-5xl text-[#e7e7dd]">
              Conflict-free timetable planner
            </h1>
            <p className="mt-3 max-w-xl text-sm text-[#a4b5aa]">
              Build your weekly schedule with teacher and room assignments, preventing double-bookings and clashes automatically.
            </p>
          </div>
          <div className="flex flex-col gap-4 sm:items-end">
            <AuthPanel />
          </div>
        </header>

        <section className="mt-8" aria-label="Alerts">
          <Alerts summaries={summary.subjectSummaries} subjects={state.subjects} target={state.target} />
        </section>

        <nav
          className="relative z-10 mt-10 inline-flex items-center gap-2 rounded-full border border-[rgba(231,231,221,0.14)] bg-[#1b3f33]/90 p-1.5 text-sm shadow-soft backdrop-blur"
          aria-label="Primary"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative rounded-full px-5 py-2 text-xs font-semibold transition-colors ${
                activeTab === tab.id
                  ? "text-[#16362b] font-bold"
                  : "text-[#a4b5aa] hover:text-[#e7e7dd]"
              }`}
            >
              {activeTab === tab.id && (
                <motion.span
                  layoutId="active-tab"
                  className="absolute inset-0 rounded-full bg-[#f5f2df] shadow-sm"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </button>
          ))}
        </nav>

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
