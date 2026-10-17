import { TimetableProvider } from "./context/TimetableContext";
import TimetableSetup from "./components/TimetableSetup";
import FeedbackForm from "./components/FeedbackForm";
import AccountAuth from "./components/AccountAuth";

function AppContent() {
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
            <AccountAuth />
          </div>
        </header>

        <section className="mt-8">
          <TimetableSetup />
        </section>

        <section className="mt-12">
          <FeedbackForm />
        </section>
      </section>
    </main>
  );
}

export default function App() {
  return (
    <TimetableProvider>
      <AppContent />
    </TimetableProvider>
  );
}
