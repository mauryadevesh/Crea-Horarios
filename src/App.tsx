import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { computeSubjectSummary } from "./lib/attendance";
import { AttendanceProvider, useAttendance } from "./context/AttendanceContext";
import Alerts from "./components/Alerts";
import Dashboard from "./components/Dashboard";
import TimetableSetup from "./components/TimetableSetup";
import DailyLogging from "./components/DailyLogging";
import TargetMode from "./components/TargetMode";
import AuthPanel from "./components/AuthPanel";
import FeedbackForm from "./components/FeedbackForm";

const tabs = [
  { id: "dashboard", label: "Dashboard" },
  { id: "timetable", label: "Timetable" },
  { id: "daily", label: "Daily Log" },
] as const;

type TabId = (typeof tabs)[number]["id"];

function AppContent() {
  const { state } = useAttendance();
  const [activeTab, setActiveTab] = useState<TabId>("timetable");
  const [scope, setScope] = useState<"month" | "all">("month");
  const [monthKey, setMonthKey] = useState(() => new Date().toISOString().slice(0, 7));

  const summary = useMemo(
    () => computeSubjectSummary(state, scope === "month" ? monthKey : undefined),
    [state, scope, monthKey]
  );

  return (
    <main className="min-h-screen bg-surface-light text-slate-900 dark:bg-surface-dark dark:text-slate-100">
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
              Weekly Timetable Maker
            </p>
            <h1 className="font-gals mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Stay above your target
            </h1>
            <p className="mt-2 max-w-xl text-sm text-slate-500 dark:text-slate-400">
              Build a clear weekly plan, keep attendance in check, and log classes in seconds.
            </p>
          </div>
          <div className="flex flex-col gap-4 sm:items-end">
            <TargetMode />
            <AuthPanel />
          </div>
        </header>

        <section className="mt-8" aria-label="Alerts">
          <Alerts summaries={summary.subjectSummaries} subjects={state.subjects} target={state.target} />
        </section>

        <nav
          className="relative z-10 mt-10 flex items-center gap-3 rounded-full border border-slate-200 bg-white/70 p-2 text-sm shadow-soft backdrop-blur dark:border-slate-800 dark:bg-slate-900/70"
          aria-label="Primary"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-4 py-2 font-medium transition-colors ${
                activeTab === tab.id
                  ? "text-slate-900 dark:text-white"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              {activeTab === tab.id && (
                <motion.span
                  layoutId="active-tab"
                  className="absolute inset-0 rounded-full bg-slate-100 dark:bg-slate-800"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </button>
          ))}
        </nav>

        <section className="mt-8" aria-live="polite">
          <AnimatePresence mode="wait">
            {activeTab === "dashboard" && (
              <motion.article
                key="dashboard"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
              >
                <Dashboard
                  summaries={summary.subjectSummaries}
                  overall={summary.overall}
                  scope={scope}
                  monthKey={monthKey}
                  onScopeChange={setScope}
                  onMonthChange={setMonthKey}
                  onSelectTab={setActiveTab}
                />
              </motion.article>
            )}
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
