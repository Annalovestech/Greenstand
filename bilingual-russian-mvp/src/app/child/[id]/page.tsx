"use client";

import { use } from "react";
import { useApp } from "@/lib/app-context";
import {
  BackLink,
  LoadingScreen,
  PrimaryButton,
  SecondaryButton,
} from "@/components/ui";

export default function ChildProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { ready, state, getChild, startLesson } = useApp();

  if (!ready) return <LoadingScreen />;

  const child = getChild(id);
  if (!child) {
    return (
      <div className="surface p-6">
        <p>Child not found.</p>
        <BackLink href="/" label="Back to dashboard" />
      </div>
    );
  }

  const lessons = state.lessonsByChild[id] ?? [];
  const workingOn = child.attentionAreas[0] ?? child.currentGoal;
  const doingWell = child.strengths[0];
  const recentWin = child.progressHighlights[0];

  return (
    <div>
      <BackLink href="/" label="All learners" />

      <section className="surface p-4 sm:p-5 fade-up">
        <div className="flex items-center gap-3">
          <span
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-xl font-semibold text-white"
            style={{ background: child.avatarColor }}
          >
            {child.name.slice(0, 1)}
          </span>
          <div className="min-w-0">
            <h1 className="font-display text-2xl leading-tight sm:text-3xl">
              {child.name}, {child.age}
            </h1>
            <p className="mt-0.5 text-sm text-[var(--muted)]">
              {child.russianLevel}
            </p>
          </div>
        </div>

        <dl className="mt-4 space-y-2.5 border-t border-[var(--line)] pt-4">
          <MetaRow label="Lesson frequency" value={child.lessonFrequency} />
          <MetaRow label="Learning goal" value={child.currentGoal} />
        </dl>

        <div className="mt-4 flex flex-col gap-2">
          <PrimaryButton
            href={`/child/${id}/lesson`}
            onClick={() => startLesson(id)}
            className="w-full"
          >
            Start lesson
          </PrimaryButton>
          <SecondaryButton
            href={`/child/${id}/progress`}
            className="w-full"
          >
            View progress
          </SecondaryButton>
        </div>
      </section>

      <section className="surface mt-4 p-4 sm:p-5 fade-up fade-up-delay-1">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="font-display text-xl">Progress snapshot</h2>
          <SecondaryButton
            href={`/child/${id}/progress`}
            className="!px-3 !py-1.5 text-xs"
          >
            Full progress
          </SecondaryButton>
        </div>

        <div className="space-y-3">
          <SnapshotRow
            label="Working on"
            value={workingOn}
            detail={
              child.attentionAreas.length > 1
                ? `+${child.attentionAreas.length - 1} more`
                : undefined
            }
          />
          <SnapshotRow
            label="Doing well"
            value={doingWell}
            tone="good"
            detail={
              child.strengths.length > 1
                ? `+${child.strengths.length - 1} more`
                : undefined
            }
          />
          <SnapshotRow
            label="Recent win"
            value={recentWin}
            tone="teal"
            detail={
              child.progressHighlights.length > 1
                ? `+${child.progressHighlights.length - 1} more`
                : undefined
            }
          />
        </div>
      </section>

      <section className="surface mt-4 p-4 sm:p-5 fade-up fade-up-delay-2">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="font-display text-xl">Recent lessons</h2>
          <SecondaryButton
            href={`/child/${id}/history`}
            className="!px-3 !py-1.5 text-xs"
          >
            See all
          </SecondaryButton>
        </div>
        <div className="space-y-3">
          {lessons.slice(0, 2).map((lesson) => (
            <div
              key={lesson.id}
              className="border-t border-[var(--line)] pt-3 first:border-t-0 first:pt-0"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-semibold">{lesson.topic}</p>
                <p className="text-xs text-[var(--muted)]">
                  {formatDate(lesson.date)}
                </p>
              </div>
              <p className="mt-1 text-sm text-[var(--ink-soft)]">
                {lesson.objective}
              </p>
              <p className="mt-1.5 text-xs text-[var(--teal-deep)]">
                Next: {lesson.nextTarget}
              </p>
            </div>
          ))}
          {lessons.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">No lessons yet.</p>
          ) : null}
        </div>
      </section>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm leading-snug text-[var(--ink)]">{value}</dd>
    </div>
  );
}

function SnapshotRow({
  label,
  value,
  tone = "neutral",
  detail,
}: {
  label: string;
  value: string;
  tone?: "neutral" | "good" | "teal";
  detail?: string;
}) {
  const accent =
    tone === "good"
      ? "bg-[var(--good)]"
      : tone === "teal"
        ? "bg-[var(--teal)]"
        : "bg-[var(--amber)]";

  return (
    <div className="flex gap-3">
      <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${accent}`} />
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">
          {label}
        </p>
        <p className="mt-0.5 text-sm leading-snug text-[var(--ink-soft)]">
          {value}
        </p>
        {detail ? (
          <p className="mt-0.5 text-xs text-[var(--muted)]">{detail}</p>
        ) : null}
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
