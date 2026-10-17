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
      "Weekly Timetable Maker is an academic schedule planning application designed to build college schedules without conflicts. It prevents the same instructor from being scheduled in two rooms at once, eliminates room double-booking, and avoids overlapping class hours.",
  },
  {
    id: "clash-engine",
    question: "How does the conflict detection system work?",
    answer:
      "Whenever a lecture is added or modified, our validation engine cross-references all scheduled slots against three rules: (1) Room Availability (no double-booking of any room or lab), (2) Faculty Availability (instructors cannot teach two classes simultaneously), and (3) Time Overlap (no overlapping period intervals). Any collision is highlighted immediately with detailed notice banners.",
  },
  {
    id: "custom-times",
    question: "Can I customize class timings and periods?",
    answer:
      "Yes. You can select standard period presets (such as 09:00 - 10:00 or 10:00 - 11:00) or input custom start and end times down to the minute using the time pickers.",
  },
  {
    id: "assign-teachers",
    question: "How do I assign faculty to subjects?",
    answer:
      "Under 'Subjects & Faculty' in the Timetable tab, type the subject name along with the teacher's name (e.g. Dr. Alan Turing) and click 'Add Subject'. The assigned teacher automatically links to all scheduled slots for that subject.",
  },
  {
    id: "daily-override",
    question: "What if a lecture is swapped or a proxy is assigned for a day?",
    answer:
      "In the Log tab, you can toggle subjects under 'Today’s Schedule' to apply a single-day override without altering your weekly master timetable. You can reset back to the default schedule with one click.",
  },
  {
    id: "persistence",
    question: "Is my timetable data saved automatically?",
    answer:
      "Yes. All subjects, timetable slots, daily logs, and notes are saved instantly to your browser's local storage. If Supabase is configured with your credentials, your schedule synchronizes securely to cloud storage.",
  },
  {
    id: "devices",
    question: "Does the website work on mobile devices and tablets?",
    answer:
      "Yes. On phones, the schedule automatically adapts into responsive lecture cards and bottom-sheet editors. On tablets and desktops, it displays the full master matrix with day filtering.",
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
