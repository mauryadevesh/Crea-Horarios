import React from "react";
import { STORAGE_KEY } from "../lib/constants";

type ErrorBoundaryState = {
  hasError: boolean;
};

type ErrorBoundaryProps = {
  children: React.ReactNode;
};

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error("ErrorBoundary caught an error", error);
  }

  handleReset = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("timetable_json_database_v1");
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="min-h-screen bg-surface-light px-6 py-12 text-slate-900 dark:bg-surface-dark dark:text-slate-100">
        <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white/80 p-6 text-center shadow-soft backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Something went wrong</p>
          <h1 className="mt-3 text-2xl font-semibold">We could not load your timetable data.</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            You can reset local data and start fresh with a clean default database.
          </p>
          <button
            onClick={this.handleReset}
            className="mt-6 rounded-full bg-slate-900 px-5 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900"
          >
            Reset data
          </button>
        </div>
      </div>
    );
  }
}
