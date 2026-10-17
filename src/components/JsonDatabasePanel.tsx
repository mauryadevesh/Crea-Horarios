import { useRef, useState } from "react";
import { useAttendance } from "../context/AttendanceContext";

export default function JsonDatabasePanel() {
  const { state, exportDatabase, importDatabase, status } = useAttendance();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [feedback, setFeedback] = useState<{ text: string; isError?: boolean } | null>(null);

  const slotCount = state.slots?.length ?? 0;
  const subjectCount = state.subjects?.length ?? 0;

  const handleExport = () => {
    exportDatabase("timetable_database.json");
    setFeedback({ text: "Database exported successfully." });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      const result = importDatabase(content);
      if (result.success) {
        setFeedback({ text: "JSON database imported and loaded." });
      } else {
        setFeedback({ text: result.error || "Failed to load database.", isError: true });
      }
      setTimeout(() => setFeedback(null), 4000);
    };

    reader.onerror = () => {
      setFeedback({ text: "Error reading file.", isError: true });
      setTimeout(() => setFeedback(null), 4000);
    };

    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="relative z-20 rounded-2xl border border-[rgba(231,231,221,0.14)] bg-[#1b3f33]/95 px-4 py-3 text-xs shadow-md space-y-2">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-bold text-[#e7e7dd] tracking-tight">JSON Database</p>
          <p className="text-[11px] text-[#a4b5aa]">
            {subjectCount} subjects • {slotCount} sessions
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(231,231,221,0.14)] bg-[#122c23] px-2.5 py-1 text-[10px] font-semibold text-[#f5f2df]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#f5f2df]" />
          {status === "saved" ? "Saved Locally" : "Active"}
        </span>
      </div>

      <div className="flex items-center gap-2 pt-1 border-t border-[rgba(231,231,221,0.1)]">
        <button
          onClick={handleExport}
          className="flex-1 rounded-xl bg-[#f5f2df] px-3 py-1.5 font-bold text-[#16362b] transition hover:bg-[#ede8d0] shadow-sm text-center"
        >
          Export JSON
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 rounded-xl border border-[rgba(231,231,221,0.16)] bg-[#20493b] px-3 py-1.5 font-semibold text-[#f5f2df] transition hover:border-[rgba(231,231,221,0.3)] text-center"
        >
          Import JSON
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {feedback && (
        <p
          className={`text-[11px] pt-0.5 ${
            feedback.isError ? "text-rose-300" : "text-[#c6d4cb]"
          }`}
        >
          {feedback.text}
        </p>
      )}
    </div>
  );
}
