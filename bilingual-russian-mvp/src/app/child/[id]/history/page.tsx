"use client";

import { use } from "react";
import { useApp } from "@/lib/app-context";
import {
  BackLink,
  LoadingScreen,
  PageTitle,
  PrimaryButton,
  SecondaryButton,
} from "@/components/ui";

export default function HistoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { ready, state, getChild, startLesson } = useApp();

  if (!ready) return <LoadingScreen />;

  const child = getChild(id);
  const lessons = state.lessonsByChild[id] ?? [];

  if (!child) {
    return (
      <div className="surface p-6">
        <p>Child not found.</p>
        <BackLink href="/" label="Back to dashboard" />
      </div>
    );
  }

  return (
    <div>
      <BackLink href={`/child/${id}`} label={`Back to ${child.name}`} />
      <PageTitle
        eyebrow="Lesson history"
        title={`${child.name}’s journey`}
        subtitle="Longitudinal progress across recent 20-minute sessions — topics, observations, gains, and next targets."
        action={
          child.isDemoFocus ? (
            <PrimaryButton
              href={`/child/${id}/lesson`}
              onClick={() => startLesson(id)}
            >
              Start next lesson
            </PrimaryButton>
          ) : undefined
        }
      />

      <div className="relative space-y-4 before:absolute before:left-[1.15rem] before:top-3 before:bottom-3 before:w-px before:bg-[var(--line)] sm:before:left-[1.35rem]">
        {lessons.map((lesson, index) => (
          <article
            key={lesson.id}
            className="surface relative ml-0 p-4 sm:p-5 fade-up"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="absolute -left-0 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--teal)] text-xs font-bold text-white shadow sm:h-9 sm:w-9">
              {lessons.length - index}
            </div>
            <div className="pl-8 sm:pl-10">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="font-display text-xl">{lesson.topic}</h2>
                <time className="text-xs font-medium text-[var(--muted)]">
                  {formatDate(lesson.date)} · {lesson.durationMin} min
                </time>
              </div>
              <p className="mt-1 text-sm text-[var(--ink-soft)]">
                <span className="font-semibold text-[var(--ink)]">Goal: </span>
                {lesson.objective}
              </p>
              <p className="mt-3 rounded-xl bg-white/70 px-3 py-2 text-sm leading-relaxed text-[var(--ink-soft)]">
                {lesson.observationSummary}
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <Meta label="Progress gained" value={lesson.progressGained} />
                <Meta label="Next target" value={lesson.nextTarget} highlight />
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <SecondaryButton href={`/child/${id}/progress`} className="flex-1">
          Open progress dashboard
        </SecondaryButton>
        <PrimaryButton href="/" className="flex-1">
          Teacher dashboard
        </PrimaryButton>
      </div>
    </div>
  );
}

function Meta({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl px-3 py-2 ${
        highlight ? "bg-[var(--sand)]/80" : "bg-[var(--teal-soft)]/50"
      }`}
    >
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-medium">{value}</p>
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
