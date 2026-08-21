"use client";

import Link from "next/link";
import type { AppRole, Child, ScheduledLesson, Teacher } from "@/lib/types";
import {
  formatLocalTime,
  formatTimezoneAbbrev,
  localDayKey,
} from "@/lib/time";
import { PrimaryButton, QuietButton, StatusDot } from "@/components/ui";

export function CalendarAgenda({
  lessons,
  childrenById,
  teacher,
  role,
  viewerTimezone,
  onStart,
  onStatus,
  compact,
}: {
  lessons: ScheduledLesson[];
  childrenById: Record<string, Child>;
  teacher?: Teacher;
  role: AppRole;
  viewerTimezone: string;
  onStart?: (lesson: ScheduledLesson) => void;
  onStatus?: (id: string, status: ScheduledLesson["status"]) => void;
  compact?: boolean;
}) {
  const grouped = groupByDay(lessons, viewerTimezone);
  const teacherTz = teacher?.timezone;
  const teacherAbbrev = teacherTz
    ? formatTimezoneAbbrev(teacherTz)
    : undefined;
  const viewerAbbrev = formatTimezoneAbbrev(viewerTimezone);

  if (lessons.length === 0) {
    return (
      <p className="py-8 text-center text-[15px] text-[var(--muted)]">
        No lessons in this view.
      </p>
    );
  }

  return (
    <div className="space-y-7">
      {grouped.map(([day, items]) => (
        <section key={day}>
          <h3 className="mb-3 text-[13px] font-semibold text-[var(--muted)]">
            {formatDayHeading(day, viewerTimezone)}
          </h3>
          <ul className="divide-y divide-[var(--line)]">
            {items.map((lesson) => {
              const child = childrenById[lesson.childId];
              const localTime = formatLocalTime(
                lesson.startsAt,
                viewerTimezone
              );
              const teacherTime =
                teacherTz && teacherTz !== viewerTimezone
                  ? formatLocalTime(lesson.startsAt, teacherTz)
                  : null;

              return (
                <li
                  key={lesson.id}
                  className="flex items-center gap-3 py-3.5 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <StatusDot status={lesson.status} />
                      <p className="text-[15px] font-semibold text-[var(--ink)]">
                        {localTime}
                        <span className="font-normal text-[var(--muted)]">
                          {" "}
                          · {lesson.durationMin} min
                        </span>
                      </p>
                    </div>
                    <p className="mt-0.5 truncate text-[15px] text-[var(--ink-soft)]">
                      {role === "parent"
                        ? teacher?.name ?? "Teacher"
                        : child?.name ?? "Learner"}
                      {role === "admin" ? (
                        <span className="text-[var(--muted)]">
                          {" "}
                          · {teacher?.name}
                        </span>
                      ) : null}
                      {!compact ? (
                        <span className="text-[var(--muted)]">
                          {" "}
                          · {lesson.topic}
                        </span>
                      ) : null}
                    </p>
                    <p className="mt-0.5 text-[12px] text-[var(--muted)]">
                      {viewerAbbrev}
                      {teacherTime && teacherAbbrev && role !== "teacher"
                        ? ` · Teacher ${teacherTime} ${teacherAbbrev}`
                        : null}
                      {role === "teacher" && teacherTime && teacherAbbrev
                        ? ` · ${teacherTime} ${teacherAbbrev}`
                        : null}
                      {lesson.eligible && role === "admin"
                        ? " · Eligible"
                        : null}
                      {role === "parent" && lesson.zoom.url
                        ? " · Zoom ready"
                        : null}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-1">
                    {role === "teacher" &&
                    (lesson.status === "upcoming" ||
                      lesson.status === "live") ? (
                      <PrimaryButton
                        className="!px-4 !py-2 text-[13px]"
                        href={`/child/${lesson.childId}/lesson?schedule=${lesson.id}`}
                        onClick={() => onStart?.(lesson)}
                      >
                        Start
                      </PrimaryButton>
                    ) : null}
                    {role === "parent" &&
                    (lesson.status === "upcoming" ||
                      lesson.status === "live") ? (
                      <a
                        href={lesson.zoom.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[13px] font-semibold text-[var(--teal)]"
                      >
                        Join
                      </a>
                    ) : null}
                    {role === "admin" ? (
                      <Link
                        href={`/child/${lesson.childId}`}
                        className="text-[13px] font-semibold text-[var(--teal)]"
                      >
                        Open
                      </Link>
                    ) : null}
                    {role === "admin" && lesson.status === "upcoming" ? (
                      <QuietButton
                        onClick={() => onStatus?.(lesson.id, "cancelled")}
                      >
                        Cancel
                      </QuietButton>
                    ) : null}
                    {role !== "teacher" || lesson.status !== "upcoming" ? (
                      <span
                        className={`text-[11px] font-medium capitalize status-${lesson.status}`}
                      >
                        {lesson.status.replace("_", " ")}
                      </span>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}

function groupByDay(lessons: ScheduledLesson[], timeZone: string) {
  const map = new Map<string, ScheduledLesson[]>();
  const sorted = [...lessons].sort(
    (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
  );
  for (const lesson of sorted) {
    const key = localDayKey(lesson.startsAt, timeZone);
    const list = map.get(key) ?? [];
    list.push(lesson);
    map.set(key, list);
  }
  return Array.from(map.entries());
}

function formatDayHeading(dayKey: string, timeZone: string) {
  const todayKey = localDayKey(new Date().toISOString(), timeZone);
  if (dayKey === todayKey) return "Today";
  const d = new Date(`${dayKey}T12:00:00Z`);
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}
