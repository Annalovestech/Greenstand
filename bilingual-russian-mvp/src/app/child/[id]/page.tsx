"use client";

import { use, useState } from "react";
import { useApp } from "@/lib/app-context";
import { packageRemaining } from "@/lib/time";
import {
  BackLink,
  LoadingScreen,
  PrimaryButton,
  QuietButton,
  SecondaryButton,
} from "@/components/ui";

export default function ChildProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { ready, state, getChild, getPackage, startLesson } = useApp();
  const [showMore, setShowMore] = useState(false);

  if (!ready) return <LoadingScreen />;

  const child = getChild(id);
  if (!child) {
    return (
      <div className="py-8">
        <p>Child not found.</p>
        <BackLink href="/" label="Back" />
      </div>
    );
  }

  const lessons = state.lessonsByChild[id] ?? [];
  const pkg = getPackage(id);
  const upcoming = state.schedule.find(
    (s) =>
      s.childId === id &&
      (s.status === "upcoming" || s.status === "live")
  );
  const workingOn = child.attentionAreas[0] ?? child.currentGoal;
  const doingWell = child.strengths[0];
  const recentWin = child.progressHighlights[0];

  return (
    <div>
      <BackLink href="/" label="Calendar" />

      <header className="fade-up">
        <div className="flex items-center gap-3.5">
          <span
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-xl font-semibold text-white"
            style={{ background: child.avatarColor }}
          >
            {child.name.slice(0, 1)}
          </span>
          <div className="min-w-0">
            <h1 className="font-display text-[1.85rem] leading-tight tracking-tight">
              {child.name}, {child.age}
            </h1>
            <p className="mt-0.5 text-[15px] text-[var(--muted)]">
              {child.russianLevel}
            </p>
          </div>
        </div>

        <dl className="mt-6 space-y-3">
          <div>
            <dt className="text-[13px] text-[var(--muted)]">Lessons</dt>
            <dd className="mt-0.5 text-[15px] text-[var(--ink)]">
              {child.lessonFrequency}
            </dd>
          </div>
          <div>
            <dt className="text-[13px] text-[var(--muted)]">Learning goal</dt>
            <dd className="mt-0.5 text-[15px] leading-snug text-[var(--ink)]">
              {child.currentGoal}
            </dd>
          </div>
          {pkg && state.role !== "teacher" ? (
            <div>
              <dt className="text-[13px] text-[var(--muted)]">Package</dt>
              <dd className="mt-0.5 text-[15px] text-[var(--ink)]">
                {packageRemaining(pkg)} of {pkg.lessonsPurchased} remaining
              </dd>
            </div>
          ) : null}
          {pkg && state.role === "teacher" ? (
            <div>
              <dt className="text-[13px] text-[var(--muted)]">Package</dt>
              <dd className="mt-0.5 text-[15px] text-[var(--ink)]">
                Eligible · {packageRemaining(pkg)} lessons left
              </dd>
            </div>
          ) : null}
        </dl>

        <div className="mt-7 flex flex-col gap-2">
          <PrimaryButton
            href={
              upcoming
                ? `/child/${id}/lesson?schedule=${upcoming.id}`
                : `/child/${id}/lesson`
            }
            onClick={() => startLesson(id, upcoming?.id)}
            className="w-full"
          >
            Start lesson
          </PrimaryButton>
          <SecondaryButton href={`/child/${id}/progress`} className="w-full">
            View progress
          </SecondaryButton>
        </div>
      </header>

      <section className="section-gap fade-up fade-up-delay-1">
        <div className="mb-4 flex items-baseline justify-between gap-2">
          <h2 className="font-display text-xl tracking-tight">
            Progress snapshot
          </h2>
          <QuietButton href={`/child/${id}/progress`}>Full</QuietButton>
        </div>
        <div className="space-y-4">
          <SnapshotRow label="Working on" value={workingOn} />
          <SnapshotRow label="Doing well" value={doingWell} tone="good" />
          <SnapshotRow label="Recent win" value={recentWin} tone="teal" />
        </div>
        <button
          type="button"
          onClick={() => setShowMore((v) => !v)}
          className="mt-4 text-[13px] font-medium text-[var(--muted)]"
        >
          {showMore ? "Show less" : "Show more details"}
        </button>
        {showMore ? (
          <div className="mt-3 space-y-2 text-[14px] text-[var(--ink-soft)]">
            {child.attentionAreas.slice(1).map((item) => (
              <p key={item}>· {item}</p>
            ))}
            {child.strengths.slice(1).map((item) => (
              <p key={item}>· {item}</p>
            ))}
          </div>
        ) : null}
      </section>

      <section className="section-gap fade-up fade-up-delay-2">
        <div className="mb-4 flex items-baseline justify-between gap-2">
          <h2 className="font-display text-xl tracking-tight">
            Recent lessons
          </h2>
          <QuietButton href={`/child/${id}/history`}>See all</QuietButton>
        </div>
        <div className="divide-y divide-[var(--line)]">
          {lessons.slice(0, 2).map((lesson) => (
            <div key={lesson.id} className="py-3.5 first:pt-0">
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-[15px] font-semibold">{lesson.topic}</p>
                <p className="text-[12px] text-[var(--muted)]">
                  {formatDate(lesson.date)}
                </p>
              </div>
              <p className="mt-1 text-[14px] text-[var(--ink-soft)]">
                {lesson.objective}
              </p>
            </div>
          ))}
          {lessons.length === 0 ? (
            <p className="text-[14px] text-[var(--muted)]">No lessons yet.</p>
          ) : null}
        </div>
      </section>
    </div>
  );
}

function SnapshotRow({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "good" | "teal";
}) {
  const accent =
    tone === "good"
      ? "bg-[var(--good)]"
      : tone === "teal"
        ? "bg-[var(--teal)]"
        : "bg-[var(--amber)]";

  return (
    <div className="flex gap-3">
      <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${accent}`} />
      <div className="min-w-0">
        <p className="text-[13px] text-[var(--muted)]">{label}</p>
        <p className="mt-0.5 text-[15px] leading-snug text-[var(--ink-soft)]">
          {value}
        </p>
      </div>
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso + "T12:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
