"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useApp } from "@/lib/app-context";
import { DEMO_TEACHER_ID, LEARNER_TZ } from "@/lib/data";
import { CalendarAgenda } from "@/components/CalendarAgenda";
import {
  BackLink,
  LoadingScreen,
  PageTitle,
  PrimaryButton,
  QuietButton,
  SegmentedControl,
} from "@/components/ui";
import { packageRemaining } from "@/lib/time";
import type { LessonStatus } from "@/lib/types";

export default function AdminPage() {
  const {
    ready,
    state,
    getTeacher,
    getPackage,
    adjustPackageBalance,
    markPackagePaid,
    updateLessonStatus,
    scheduleLesson,
    setRole,
  } = useApp();

  const [tab, setTab] = useState<"learners" | "calendar" | "billing" | "schedule">(
    "learners"
  );
  const [form, setForm] = useState({
    childId: "lana",
    date: "2026-08-28",
    time: "16:00",
    durationMin: 20,
    topic: "Practice lesson",
    zoomUrl: "https://zoom.us/j/81234567890",
    meetingId: "812 3456 7890",
    recurring: false,
  });

  const teacher = getTeacher();
  const childrenById = useMemo(
    () => Object.fromEntries(state.children.map((c) => [c.id, c])),
    [state.children]
  );

  const billing = useMemo(() => {
    const revenue = state.packages.reduce((s, p) => s + p.priceUsd, 0);
    const used = state.packages.reduce((s, p) => s + p.lessonsCompleted, 0);
    const remaining = state.packages.reduce(
      (s, p) => s + packageRemaining(p),
      0
    );
    const teacherCost = used * (teacher?.ratePerLesson ?? 15);
    return {
      revenue,
      used,
      remaining,
      teacherCost,
      margin: revenue - teacherCost,
    };
  }, [state.packages, teacher]);

  if (!ready) return <LoadingScreen />;

  function submitSchedule(e: React.FormEvent) {
    e.preventDefault();
    // Store as ET wall clock → UTC (EDT = +4)
    const [hh, mm] = form.time.split(":").map(Number);
    const utcHour = String(hh + 4).padStart(2, "0");
    const startsAt = `${form.date}T${utcHour}:${String(mm).padStart(2, "0")}:00.000Z`;
    scheduleLesson({
      childId: form.childId,
      teacherId: DEMO_TEACHER_ID,
      startsAt,
      durationMin: form.durationMin,
      topic: form.topic,
      zoom: { url: form.zoomUrl, meetingId: form.meetingId },
      seriesId: form.recurring ? `series-${form.childId}-custom` : undefined,
    });
    setTab("calendar");
  }

  return (
    <div>
      <BackLink href="/" label="Back" />
      <PageTitle
        title="Admin"
        subtitle="Operational view — learners, calendar, billing."
        action={
          <QuietButton
            onClick={() => {
              setRole("teacher");
            }}
          >
            Teacher view
          </QuietButton>
        }
      />

      <div className="mb-6">
        <SegmentedControl
          value={tab}
          onChange={(id) =>
            setTab(id as "learners" | "calendar" | "billing" | "schedule")
          }
          options={[
            { id: "learners", label: "Learners" },
            { id: "calendar", label: "Calendar" },
            { id: "billing", label: "Billing" },
            { id: "schedule", label: "Schedule" },
          ]}
        />
      </div>

      {tab === "learners" ? (
        <ul className="divide-y divide-[var(--line)]">
          {state.children.map((child) => {
            const pkg = getPackage(child.id);
            const next = state.schedule.find(
              (s) =>
                s.childId === child.id &&
                (s.status === "upcoming" || s.status === "live")
            );
            return (
              <li key={child.id} className="py-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link
                      href={`/child/${child.id}`}
                      className="text-[16px] font-semibold text-[var(--ink)]"
                    >
                      {child.name}
                    </Link>
                    <p className="mt-0.5 text-[13px] text-[var(--muted)]">
                      {teacher?.name} ·{" "}
                      {pkg
                        ? `${packageRemaining(pkg)} left · ${pkg.paymentStatus}`
                        : "No package"}
                    </p>
                    {next ? (
                      <p className="mt-1 text-[13px] text-[var(--ink-soft)]">
                        Next:{" "}
                        {new Date(next.startsAt).toLocaleString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                          timeZone: LEARNER_TZ,
                        })}
                      </p>
                    ) : null}
                  </div>
                  {pkg ? (
                    <div className="flex flex-col items-end gap-1">
                      <QuietButton
                        onClick={() => adjustPackageBalance(child.id, 1)}
                      >
                        +1 lesson
                      </QuietButton>
                      {pkg.paymentStatus !== "paid" ? (
                        <QuietButton
                          onClick={() => markPackagePaid(child.id)}
                        >
                          Mark paid
                        </QuietButton>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}

      {tab === "calendar" ? (
        <div>
          <p className="mb-4 text-[13px] text-[var(--muted)]">
            All scheduled lessons · filter by status via actions
          </p>
          <CalendarAgenda
            lessons={state.schedule}
            childrenById={childrenById}
            teacher={teacher}
            role="admin"
            viewerTimezone={LEARNER_TZ}
            onStatus={(id, status: LessonStatus) =>
              updateLessonStatus(id, status)
            }
          />
          <div className="mt-4">
            <h3 className="mb-2 text-[13px] font-semibold text-[var(--muted)]">
              Teachers
            </h3>
            {state.teachers.map((t) => {
              const completed = state.packages.reduce(
                (s, p) => s + p.lessonsCompleted,
                0
              );
              return (
                <p key={t.id} className="text-[15px] text-[var(--ink-soft)]">
                  {t.name} · {state.children.length} learners · {completed}{" "}
                  completed · ${t.ratePerLesson}/lesson · $
                  {completed * t.ratePerLesson} due · {t.earningsStatus}
                </p>
              );
            })}
          </div>
        </div>
      ) : null}

      {tab === "billing" ? (
        <div className="space-y-4 text-[15px] text-[var(--ink-soft)]">
          <p>
            Packages purchased:{" "}
            <span className="font-semibold text-[var(--ink)]">
              {state.packages.length}
            </span>
          </p>
          <p>
            Used lessons:{" "}
            <span className="font-semibold text-[var(--ink)]">
              {billing.used}
            </span>
          </p>
          <p>
            Remaining:{" "}
            <span className="font-semibold text-[var(--ink)]">
              {billing.remaining}
            </span>
          </p>
          <p>
            Revenue:{" "}
            <span className="font-semibold text-[var(--ink)]">
              ${billing.revenue}
            </span>
          </p>
          <p>
            Teacher cost:{" "}
            <span className="font-semibold text-[var(--ink)]">
              ${billing.teacherCost}
            </span>
          </p>
          <p>
            Platform margin:{" "}
            <span className="font-semibold text-[var(--ink)]">
              ${billing.margin}
            </span>
          </p>
          <hr className="hairline my-4" />
          {state.packages.map((p) => {
            const child = childrenById[p.childId];
            return (
              <div key={p.id} className="py-2">
                <p className="font-semibold text-[var(--ink)]">
                  {child?.name}
                </p>
                <p className="text-[13px] text-[var(--muted)]">
                  {p.lessonsPurchased} purchased · {p.lessonsCompleted}{" "}
                  completed · {packageRemaining(p)} left · ${p.priceUsd} ·{" "}
                  {p.paymentStatus}
                  {p.nextPaymentDue ? ` · due ${p.nextPaymentDue}` : ""}
                </p>
              </div>
            );
          })}
        </div>
      ) : null}

      {tab === "schedule" ? (
        <form onSubmit={submitSchedule} className="space-y-4">
          <Field label="Learner">
            <select
              className="field"
              value={form.childId}
              onChange={(e) =>
                setForm((f) => ({ ...f, childId: e.target.value }))
              }
            >
              {state.children.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Teacher">
            <input className="field" value={teacher?.name ?? "Anna"} disabled />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Date">
              <input
                type="date"
                className="field"
                value={form.date}
                onChange={(e) =>
                  setForm((f) => ({ ...f, date: e.target.value }))
                }
              />
            </Field>
            <Field label="Time (ET)">
              <input
                type="time"
                className="field"
                value={form.time}
                onChange={(e) =>
                  setForm((f) => ({ ...f, time: e.target.value }))
                }
              />
            </Field>
          </div>
          <Field label="Duration (min)">
            <select
              className="field"
              value={form.durationMin}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  durationMin: Number(e.target.value),
                }))
              }
            >
              <option value={20}>20</option>
              <option value={30}>30</option>
            </select>
          </Field>
          <Field label="Topic">
            <input
              className="field"
              value={form.topic}
              onChange={(e) =>
                setForm((f) => ({ ...f, topic: e.target.value }))
              }
            />
          </Field>
          <Field label="Zoom URL">
            <input
              className="field"
              value={form.zoomUrl}
              onChange={(e) =>
                setForm((f) => ({ ...f, zoomUrl: e.target.value }))
              }
            />
          </Field>
          <Field label="Meeting ID">
            <input
              className="field"
              value={form.meetingId}
              onChange={(e) =>
                setForm((f) => ({ ...f, meetingId: e.target.value }))
              }
            />
          </Field>
          <label className="flex items-center gap-2 text-[14px] text-[var(--ink-soft)]">
            <input
              type="checkbox"
              checked={form.recurring}
              onChange={(e) =>
                setForm((f) => ({ ...f, recurring: e.target.checked }))
              }
            />
            Recurring series (Tue/Thu style)
          </label>
          <PrimaryButton type="submit" className="w-full">
            Confirm lesson
          </PrimaryButton>
          <p className="text-[12px] text-[var(--muted)]">
            Stored in UTC · shown in learner ET / teacher local time. Recurring
            edits: this lesson / this and future / entire series (policy hooks
            ready).
          </p>
        </form>
      ) : null}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium text-[var(--muted)]">
        {label}
      </span>
      {children}
    </label>
  );
}
