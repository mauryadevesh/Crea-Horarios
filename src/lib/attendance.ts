import type { AttendanceState, SubjectSummary, OverallSummary } from "./types";

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const formatDateKey = (date: Date) =>
  new Intl.DateTimeFormat("en-CA").format(date);

const formatMonthKey = (date: Date) =>
  new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit" }).format(date);

export const computeSubjectSummary = (
  state: AttendanceState,
  monthKey?: string
): { subjectSummaries: SubjectSummary[]; overall: OverallSummary } => {
  const { subjects, logs, target } = state;
  const summaries: SubjectSummary[] = subjects.map((subject) => {
    let attended = 0;
    let missed = 0;
    let cancelled = 0;
    const subjectEntries: { dateKey: string; status: "attended" | "missed" | "cancelled" }[] = [];

    Object.entries(logs).forEach(([dateKey, daily]) => {
      if (monthKey && !dateKey.startsWith(monthKey)) return;
      const status = daily[subject.id];
      if (!status) return;
      if (status === "attended") attended += 1;
      if (status === "missed") missed += 1;
      if (status === "cancelled") cancelled += 1;
      subjectEntries.push({ dateKey, status });
    });

    const total = attended + missed;
    const percentage = total === 0 ? 0 : (attended / total) * 100;
    const status = percentage >= target ? "safe" : "risk";

    const requiredToRecover = calculateRequiredToRecover(attended, total, target);
    const bunkable = calculateBunkable(attended, total, target);
    const currentStreak = calculateCurrentStreak(subjectEntries);

    return {
      subjectId: subject.id,
      attended,
      missed,
      cancelled,
      total,
      percentage,
      status,
      requiredToRecover,
      bunkable,
      currentStreak,
    };
  });

  const overall = summaries.reduce(
    (acc, summary) => {
      acc.attended += summary.attended;
      acc.missed += summary.missed;
      acc.cancelled += summary.cancelled;
      return acc;
    },
    { attended: 0, missed: 0, cancelled: 0, total: 0, percentage: 0 }
  );

  overall.total = overall.attended + overall.missed;
  overall.percentage = overall.total === 0 ? 0 : (overall.attended / overall.total) * 100;

  return { subjectSummaries: summaries, overall };
};

export const calculateRequiredToRecover = (attended: number, total: number, target: number) => {
  if (total === 0) return 0;
  const targetRatio = clamp(target / 100, 0, 0.99);
  if (attended / total >= targetRatio) return 0;
  const needed = (targetRatio * total - attended) / (1 - targetRatio);
  return Math.max(0, Math.ceil(needed));
};

export const calculateBunkable = (attended: number, total: number, target: number) => {
  if (total === 0) return 0;
  const targetRatio = clamp(target / 100, 0.01, 1);
  if (attended / total < targetRatio) return 0;
  const bunkable = Math.floor(attended / targetRatio - total);
  return Math.max(0, bunkable);
};

export const getTodayKey = () => {
  const day = new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(new Date());
  const map: Record<string, "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun"> = {
    Mon: "Mon",
    Tue: "Tue",
    Wed: "Wed",
    Thu: "Thu",
    Fri: "Fri",
    Sat: "Sat",
    Sun: "Sun",
  };
  return map[day] ?? "Mon";
};

export const getTodayDateKey = () => formatDateKey(new Date());

export const getMonthKey = (date: Date) => formatMonthKey(date);

const calculateCurrentStreak = (
  entries: { dateKey: string; status: "attended" | "missed" | "cancelled" }[]
) => {
  if (entries.length === 0) return 0;
  const filtered = entries
    .filter((entry) => entry.status !== "cancelled")
    .sort((a, b) => a.dateKey.localeCompare(b.dateKey));
  let streak = 0;
  for (let i = filtered.length - 1; i >= 0; i -= 1) {
    const entry = filtered[i];
    if (entry.status === "missed") break;
    if (entry.status === "attended") streak += 1;
  }
  return streak;
};

export const computeInsights = (state: AttendanceState, monthKey?: string) => {
  const filteredLogs = Object.entries(state.logs).filter(([dateKey]) =>
    monthKey ? dateKey.startsWith(monthKey) : true
  );

  const subjectMissed = new Map<string, number>();
  const dailyStatus = filteredLogs.map(([dateKey, daily]) => {
    let attended = 0;
    let missed = 0;
    let cancelled = 0;
    Object.entries(daily).forEach(([subjectId, status]) => {
      if (status === "attended") attended += 1;
      if (status === "missed") missed += 1;
      if (status === "cancelled") cancelled += 1;
      if (status === "missed") {
        subjectMissed.set(subjectId, (subjectMissed.get(subjectId) ?? 0) + 1);
      }
    });
    return { dateKey, attended, missed, cancelled };
  });

  dailyStatus.sort((a, b) => a.dateKey.localeCompare(b.dateKey));

  const isPerfectDay = (day: typeof dailyStatus[number]) => day.attended > 0 && day.missed === 0;

  let bestStreak = 0;
  let currentStreak = 0;
  let rolling = 0;
  let prevDate: Date | null = null;

  dailyStatus.forEach((day) => {
    const date = new Date(day.dateKey + "T00:00:00");
    const isConsecutive = prevDate
      ? (date.getTime() - prevDate.getTime()) / (24 * 60 * 60 * 1000) === 1
      : true;
    if (!isConsecutive) rolling = 0;
    if (isPerfectDay(day)) {
      rolling += 1;
      bestStreak = Math.max(bestStreak, rolling);
    } else {
      rolling = 0;
    }
    prevDate = date;
  });

  if (dailyStatus.length > 0) {
    const last = dailyStatus[dailyStatus.length - 1];
    if (isPerfectDay(last)) {
      currentStreak = 1;
      for (let i = dailyStatus.length - 2; i >= 0; i -= 1) {
        const current = dailyStatus[i];
        const next = dailyStatus[i + 1];
        const currentDate = new Date(current.dateKey + "T00:00:00");
        const nextDate = new Date(next.dateKey + "T00:00:00");
        const diff = (nextDate.getTime() - currentDate.getTime()) / (24 * 60 * 60 * 1000);
        if (diff !== 1 || !isPerfectDay(current)) break;
        currentStreak += 1;
      }
    }
  }

  let mostMissedSubjectId: string | null = null;
  let mostMissedCount = 0;
  subjectMissed.forEach((count, subjectId) => {
    if (count > mostMissedCount) {
      mostMissedCount = count;
      mostMissedSubjectId = subjectId;
    }
  });

  return {
    currentStreak,
    bestStreak,
    mostMissedSubjectId,
    mostMissedCount,
  };
};

export const computeForecast = (state: AttendanceState, monthKey?: string) => {
  const resolvedMonthKey = monthKey ?? getMonthKey(new Date());
  const { subjectSummaries } = computeSubjectSummary(state, resolvedMonthKey);
  const targetRatio = clamp(state.target / 100, 0.01, 1);
  const todayKey = getTodayDateKey();

  const upcomingBySubject = new Map<string, number>();
  const [year, month] = resolvedMonthKey.split("-").map(Number);
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);

  for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
    const dateKey = formatDateKey(date);
    if (dateKey < todayKey) continue;
    const day = new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date) as
      | "Mon"
      | "Tue"
      | "Wed"
      | "Thu"
      | "Fri"
      | "Sat"
      | "Sun";
    const hasOverride = Object.prototype.hasOwnProperty.call(state.overrides, dateKey);
    const subjectsForDay = hasOverride ? state.overrides[dateKey] ?? [] : state.timetable[day] ?? [];
    subjectsForDay.forEach((subjectId) => {
      upcomingBySubject.set(subjectId, (upcomingBySubject.get(subjectId) ?? 0) + 1);
    });
  }

  const subjectForecasts = subjectSummaries.map((summary) => {
    const upcoming = upcomingBySubject.get(summary.subjectId) ?? 0;
    const required = Math.max(
      0,
      Math.ceil(targetRatio * (summary.total + upcoming) - summary.attended)
    );
    const unreachable = required > upcoming;
    const bunkable = Math.max(0, upcoming - required);
    return {
      subjectId: summary.subjectId,
      upcoming,
      required,
      bunkable,
      unreachable,
    };
  });

  const totals = subjectForecasts.reduce(
    (acc, forecast) => {
      acc.upcoming += forecast.upcoming;
      acc.required += forecast.required;
      acc.bunkable += forecast.bunkable;
      return acc;
    },
    { upcoming: 0, required: 0, bunkable: 0 }
  );

  return {
    totals,
    subjectForecasts,
  };
};

type SafeBunkDay = {
  dateKey: string;
  label: string;
  classCount: number;
  isHoliday: boolean;
  finalPercentage: number;
};

const formatSafeBunkLabel = (date: Date) =>
  new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(date);

export const computeSafeBunkDays = (
  state: AttendanceState,
  monthKey?: string,
  subjectId?: string,
  overallOverride?: OverallSummary
) => {
  const resolvedMonthKey = monthKey ?? getMonthKey(new Date());
  const overall = overallOverride ?? computeSubjectSummary(state, resolvedMonthKey).overall;
  const targetRatio = clamp(state.target / 100, 0.01, 1);
  const todayKey = getTodayDateKey();

  const [year, month] = resolvedMonthKey.split("-").map(Number);
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);

  const upcomingByDate = new Map<string, number>();
  const holidayKeys = new Set<string>();
  let totalUpcomingAll = 0;

  for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
    const dateKey = formatDateKey(date);
    if (dateKey < todayKey) continue;
    const day = new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date) as
      | "Mon"
      | "Tue"
      | "Wed"
      | "Thu"
      | "Fri"
      | "Sat"
      | "Sun";
    const hasOverride = Object.prototype.hasOwnProperty.call(state.overrides, dateKey);
    const subjectsForDay = hasOverride ? state.overrides[dateKey] ?? [] : state.timetable[day] ?? [];
    const classCount = subjectsForDay.length;
    if (classCount === 0) {
      if (!subjectId && hasOverride) {
        holidayKeys.add(dateKey);
        upcomingByDate.set(dateKey, 0);
      }
      continue;
    }
    totalUpcomingAll += classCount;
    if (subjectId) {
      const subjectCount = subjectsForDay.filter((id) => id === subjectId).length;
      if (subjectCount > 0) {
        upcomingByDate.set(dateKey, subjectCount);
      }
    } else {
      upcomingByDate.set(dateKey, classCount);
    }
  }

  if (totalUpcomingAll === 0 && upcomingByDate.size === 0) {
    return { best: null as SafeBunkDay | null, others: [] as SafeBunkDay[] };
  }

  const safeDays: SafeBunkDay[] = [];
  const totalLogged = overall.attended + overall.missed;

  upcomingByDate.forEach((classCount, dateKey) => {
    if (classCount === 0 && holidayKeys.has(dateKey)) {
      const date = new Date(dateKey + "T00:00:00");
      const baselineTotal = totalLogged === 0 ? 1 : totalLogged;
      const baselinePercentage = totalLogged === 0 ? 0 : (overall.attended / baselineTotal) * 100;
      safeDays.push({
        dateKey,
        label: formatSafeBunkLabel(date),
        classCount,
        isHoliday: true,
        finalPercentage: baselinePercentage,
      });
      return;
    }
    const finalAttended = overall.attended + (totalUpcomingAll - classCount);
    const finalTotal = totalLogged + totalUpcomingAll;
    const ratio = finalTotal === 0 ? 0 : finalAttended / finalTotal;
    if (ratio >= targetRatio) {
      const date = new Date(dateKey + "T00:00:00");
      safeDays.push({
        dateKey,
        label: formatSafeBunkLabel(date),
        classCount,
        isHoliday: false,
        finalPercentage: ratio * 100,
      });
    }
  });

  if (safeDays.length === 0) {
    return { best: null as SafeBunkDay | null, others: [] as SafeBunkDay[] };
  }

  safeDays.sort((a, b) => {
    if (b.classCount !== a.classCount) return b.classCount - a.classCount;
    return a.dateKey.localeCompare(b.dateKey);
  });

  const best = safeDays[0];
  const others = safeDays
    .slice(1)
    .sort((a, b) => a.dateKey.localeCompare(b.dateKey));

  return { best, others };
};
