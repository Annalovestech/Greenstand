"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useApp } from "@/lib/app-context";
import { LEARNER_TZ, TEACHER_TZ } from "@/lib/data";
import { CalendarAgenda } from "@/components/CalendarAgenda";
import {
  LoadingScreen,
  PageTitle,
  QuietButton,
  SegmentedControl,
} from "@/components/ui";
import { isWithinNextDays, localDayKey, packageRemaining } from "@/lib/time";

export default function DashboardPage() {
  const {
    ready,
    state,
    startLesson,
    updateLessonStatus,
    getTeacher,
    getPackage,
  } = useApp();
  const [range, setRange] = useState<"today" | "week">("today");

  const teacher = getTeacher();
  const viewerTz =
    state.role === "teacher"
      ? teacher?.timezone ?? TEACHER_TZ
      : LEARNER_TZ;

  const childrenById = useMemo(
    () => Object.fromEntries(state.children.map((c) => [c.id, c])),
    [state.children]
  );

  const filtered = useMemo(() => {
    const now = new Date();
    // Anchor demo “today” to seeded Aug 21, 2026 when running near that seed.
    const seedToday = new Date("2026-08-21T12:00:00Z");
    const anchor =
      Math.abs(now.getTime() - seedToday.getTime()) < 120 * 24 * 60 * 60 * 1000
        ? seedToday
        : now;

    return state.schedule.filter((lesson) => {
      if (range === "today") {
        return (
          localDayKey(lesson.startsAt, LEARNER_TZ) ===
          localDayKey(anchor.toISOString(), LEARNER_TZ)
        );
      }
      return isWithinNextDays(lesson.startsAt, 7, anchor);
    });
  }, [state.schedule, range]);

  const earnings = useMemo(() => {
    const completed = state.schedule.filter((s) => s.status === "completed")
      .length;
    // Count completed from packages this month as demo earnings base
    const monthCompleted = state.packages.reduce(
      (sum, p) => sum + p.lessonsCompleted,
      0
    );
    const rate = teacher?.ratePerLesson ?? 15;
    return {
      completed: monthCompleted + completed,
      rate,
      due: (monthCompleted + completed) * rate,
      status: teacher?.earningsStatus ?? "pending",
    };
  }, [state.schedule, state.packages, teacher]);

  if (!ready) return <LoadingScreen />;

  if (state.role === "admin") {
    return <AdminHome />;
  }

  if (state.role === "parent") {
    return <ParentHome />;
  }

  return (
    <div>
      <PageTitle
        title="Today"
        subtitle={`${teacher?.name ?? "Teacher"} · times in ${viewerTz === TEACHER_TZ ? "your local time" : "learner time"}`}
        action={
          <SegmentedControl
            value={range}
            onChange={(id) => setRange(id as "today" | "week")}
            options={[
              { id: "today", label: "Today" },
              { id: "week", label: "Week" },
            ]}
          />
        }
      />

      <CalendarAgenda
        lessons={filtered}
        childrenById={childrenById}
        teacher={teacher}
        role="teacher"
        viewerTimezone={LEARNER_TZ}
        onStart={(lesson) => startLesson(lesson.childId, lesson.id)}
        onStatus={(id, status) => updateLessonStatus(id, status)}
      />

      <section className="section-gap fade-up fade-up-delay-1">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-[13px] font-semibold text-[var(--muted)]">
            Learners
          </h2>
          <QuietButton href="/admin">Admin</QuietButton>
        </div>
        <ul className="divide-y divide-[var(--line)]">
          {state.children.map((child) => {
            const pkg = getPackage(child.id);
            return (
              <li key={child.id}>
                <Link
                  href={`/child/${child.id}`}
                  className="flex items-center gap-3 py-3.5 transition active:opacity-70"
                >
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-full text-[15px] font-semibold text-white"
                    style={{ background: child.avatarColor }}
                  >
                    {child.name.slice(0, 1)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-semibold">{child.name}</p>
                    <p className="truncate text-[13px] text-[var(--muted)]">
                      {child.russianLevel}
                      {pkg
                        ? ` · ${packageRemaining(pkg)} lessons left`
                        : null}
                    </p>
                  </div>
                  <span className="text-[13px] text-[var(--teal)]">Open</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="section-gap fade-up fade-up-delay-2">
        <h2 className="mb-2 text-[13px] font-semibold text-[var(--muted)]">
          Earnings
        </h2>
        <p className="text-[15px] text-[var(--ink-soft)]">
          Completed this month:{" "}
          <span className="font-semibold text-[var(--ink)]">
            {earnings.completed}
          </span>
        </p>
        <p className="mt-1 text-[15px] text-[var(--ink-soft)]">
          Rate: ${earnings.rate} / lesson · Amount due:{" "}
          <span className="font-semibold text-[var(--ink)]">
            ${earnings.due}
          </span>
        </p>
        <p className="mt-1 text-[13px] capitalize text-[var(--muted)]">
          {earnings.status}
        </p>
      </section>
    </div>
  );
}

function ParentHome() {
  const { state, getTeacher, getPackage, updateLessonStatus } = useApp();
  const [range, setRange] = useState<"today" | "week">("week");
  const teacher = getTeacher();
  const childrenById = Object.fromEntries(
    state.children.map((c) => [c.id, c])
  );
  const focus = state.children.find((c) => c.isDemoFocus) ?? state.children[0];
  const pkg = getPackage(focus.id);

  const lessons = state.schedule.filter((l) => l.childId === focus.id);
  const visible =
    range === "today"
      ? lessons.filter(
          (l) =>
            localDayKey(l.startsAt, LEARNER_TZ) ===
            localDayKey("2026-08-21T12:00:00Z", LEARNER_TZ)
        )
      : lessons.filter((l) =>
          isWithinNextDays(l.startsAt, 14, new Date("2026-08-21T12:00:00Z"))
        );

  return (
    <div>
      <PageTitle
        title={focus.name}
        subtitle="Upcoming lessons"
        action={
          <SegmentedControl
            value={range}
            onChange={(id) => setRange(id as "today" | "week")}
            options={[
              { id: "today", label: "Today" },
              { id: "week", label: "Week" },
            ]}
          />
        }
      />

      {pkg ? (
        <p className="mb-6 text-[15px] text-[var(--ink-soft)]">
          <span className="font-semibold text-[var(--ink)]">
            {pkg.lessonsPurchased}
          </span>{" "}
          purchased ·{" "}
          <span className="font-semibold text-[var(--ink)]">
            {pkg.lessonsCompleted}
          </span>{" "}
          completed ·{" "}
          <span className="font-semibold text-[var(--ink)]">
            {packageRemaining(pkg)}
          </span>{" "}
          remaining
        </p>
      ) : null}

      <CalendarAgenda
        lessons={visible}
        childrenById={childrenById}
        teacher={teacher}
        role="parent"
        viewerTimezone={LEARNER_TZ}
        onStatus={(id, status) => updateLessonStatus(id, status)}
      />
    </div>
  );
}

function AdminHome() {
  return (
    <div>
      <PageTitle
        title="Admin"
        subtitle="Learners, calendar, and billing — compact operations."
        action={<QuietButton href="/admin">Open workspace</QuietButton>}
      />
      <p className="text-[15px] text-[var(--ink-soft)]">
        Use the Admin workspace for packages, scheduling, and teacher earnings.
      </p>
      <Link
        href="/admin"
        className="mt-4 inline-flex text-[15px] font-semibold text-[var(--teal)]"
      >
        Go to admin →
      </Link>
    </div>
  );
}
