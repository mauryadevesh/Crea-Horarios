import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    id: "purpose",
    question: "What is the Weekly Timetable Maker?",
    answer:
      "Weekly Timetable Maker is an academic planner designed to build weekly class schedules and log daily attendance without conflicts. It prevents the same instructor from being scheduled in two rooms at once, eliminates room double-booking, and avoids overlapping class hours.",
  },
  {
    id: "clash-engine",
    question: "What kinds of scheduling clashes are detected and prevented?",
    answer:
      "Our clash engine checks three constraints in real time: (1) Faculty Availability (the same instructor cannot be scheduled in two classes simultaneously), (2) Room Availability (a classroom or laboratory cannot be double-booked during overlapping hours), and (3) Time Collisions (multiple lectures cannot overlap on the same day). Conflicting slots are flagged with warning banners.",
  },
  {
    id: "assign-teachers",
    question: "How do I add a subject and assign a teacher?",
    answer:
      "In the Timetable tab under 'Subjects & Faculty', enter the subject name along with the teacher's name (e.g. Dr. Alan Turing) and click 'Add Subject'. The assigned faculty member is linked automatically to every class slot scheduled for that subject.",
  },
  {
    id: "schedule-slot",
    question: "How do I schedule a class session?",
    answer:
      "Click '+ Schedule New Class' (or '+ Add Class' on any day card). Select the day and subject, choose a room from quick presets (e.g. Room 101, Lab A) or type a custom room, and pick a standard period preset or custom start and end times. The system validates the slot in real time before scheduling.",
  },
  {
    id: "matrix-filtering",
    question: "How do I view my timetable by specific days?",
    answer:
      "In the 'Schedule Master Matrix' section at the bottom of the Timetable tab, use the 'Filter Day' buttons to view 'All Week' or filter by any single day (Monday through Sunday). On phones it renders as compact cards, while on tablets and laptops it presents a full matrix table.",
  },
  {
    id: "daily-log",
    question: "How does the Daily Log work?",
    answer:
      "Switch to the 'Log' tab and pick any date on the calendar. For every class scheduled on that day, you can record attendance with a single tap ('Attended', 'Missed', or 'Cancelled') and add custom notes for assignment deadlines, proxy lecturers, or room announcements.",
  },
  {
    id: "daily-override",
    question: "What if a lecture is swapped or cancelled for just one day?",
    answer:
      "In the Log tab under 'Today’s Schedule', tap any subject pill to toggle it on or off for that date. This lets you handle single-day room changes, substitute teachers, or cancelled lectures without changing your recurring weekly master timetable. Click 'Reset to default schedule' anytime to revert back.",
  },
  {
    id: "edit-delete",
    question: "How do I edit or delete a scheduled class?",
    answer:
      "Every scheduled lecture in both the day cards and the Schedule Master Matrix includes dedicated 'Edit' and 'Delete' buttons. Clicking 'Edit' opens the session modal with existing details pre-filled for immediate adjustment.",
  },
  {
    id: "persistence",
    question: "Is my timetable data saved automatically?",
    answer:
      "Yes. All subjects, timetable slots, daily logs, and notes are saved instantly to your browser's local storage. You can also sign in with email and password via the account panel in the header to synchronize your schedule to the cloud.",
  },
  {
    id: "reset",
    question: "How do I reset my schedule if I want to start over?",
    answer:
      "In the 'Subjects & Faculty' section, click 'Reset to defaults' to restore sample subjects and slots, or click 'Clear logs' to wipe logged attendance and notes while keeping your timetable structure intact.",
  },
];


export default function FaqSection() {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section
      aria-label="Frequently Asked Questions"
      className="rounded-2xl border border-[rgba(231,231,221,0.14)] bg-[#1b3f33] p-5 sm:p-7 lg:p-8 shadow-sm space-y-5"
    >
      <div className="flex flex-col gap-1 border-b border-[rgba(231,231,221,0.12)] pb-4">
        <h2 className="text-lg sm:text-xl font-bold text-[#e7e7dd]">
          Frequently Asked Questions
        </h2>
        <p className="text-xs sm:text-sm text-[#a4b5aa]">
          Common questions about conflict-free scheduling, faculty management, and daily logs.
        </p>
      </div>

      <div className="space-y-3">
        {FAQS.map((faq) => {
          const isOpen = openId === faq.id;

          return (
            <div
              key={faq.id}
              className="rounded-xl border border-[rgba(231,231,221,0.12)] bg-[#16362b]/80 transition hover:border-[rgba(231,231,221,0.24)]"
            >
              <button
                type="button"
                onClick={() => toggle(faq.id)}
                className="flex w-full items-center justify-between gap-4 p-4 text-left transition"
                aria-expanded={isOpen}
              >
                <span className="text-sm font-semibold text-[#e7e7dd]">
                  {faq.question}
                </span>
                <span
                  className={`shrink-0 flex h-6 w-6 items-center justify-center rounded-lg border border-[rgba(231,231,221,0.16)] bg-[#20493b] text-xs font-bold text-[#f5f2df] transition-transform duration-200 ${
                    isOpen ? "rotate-45" : ""
                  }`}
                >
                  +
                </span>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 pt-1 text-xs sm:text-sm leading-relaxed text-[#c6d4cb] border-t border-[rgba(231,231,221,0.08)] mt-1">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
