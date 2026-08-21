/** Timezone-aware display helpers. Times are stored as UTC ISO strings. */

export function formatLocalTime(
  utcIso: string,
  timeZone?: string,
  opts?: Intl.DateTimeFormatOptions
) {
  return new Date(utcIso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone,
    ...opts,
  });
}

export function formatLocalDate(
  utcIso: string,
  timeZone?: string,
  opts?: Intl.DateTimeFormatOptions
) {
  return new Date(utcIso).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone,
    ...opts,
  });
}

export function formatTimezoneAbbrev(timeZone: string, at = new Date()) {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      timeZoneName: "short",
    }).formatToParts(at);
    return parts.find((p) => p.type === "timeZoneName")?.value ?? timeZone;
  } catch {
    return timeZone;
  }
}

export function sameLocalDay(aIso: string, bIso: string, timeZone?: string) {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return fmt.format(new Date(aIso)) === fmt.format(new Date(bIso));
}

export function startOfLocalDay(date = new Date(), timeZone = "America/New_York") {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const day = fmt.format(date);
  // Interpret midnight in that timezone approximately via Date parsing of offset-less local.
  // For demo seed we build exact UTC; this helper is for filtering ranges.
  return day;
}

export function localDayKey(utcIso: string, timeZone?: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(utcIso));
}

export function isWithinNextDays(
  utcIso: string,
  days: number,
  from = new Date()
) {
  const t = new Date(utcIso).getTime();
  const start = from.getTime() - 2 * 60 * 60 * 1000;
  const end = from.getTime() + days * 24 * 60 * 60 * 1000;
  return t >= start && t <= end;
}

export function packageRemaining(pkg: {
  lessonsPurchased: number;
  lessonsCompleted: number;
}) {
  return Math.max(0, pkg.lessonsPurchased - pkg.lessonsCompleted);
}
