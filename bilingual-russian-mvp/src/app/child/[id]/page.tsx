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

  return (
    <div>
      <BackLink href="/" label="All learners" />
      <PageTitle
        eyebrow="Child profile"
        title={child.name}
        subtitle={`${child.bilingualEnvironment}`}
        action={
          child.isDemoFocus ? (
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <SecondaryButton href={`/child/${id}/progress`}>
                View progress
              </SecondaryButton>
              <PrimaryButton
                href={`/child/${id}/lesson`}
                onClick={() => startLesson(id)}
              >
                Start lesson
              </PrimaryButton>
            </div>
          ) : (
            <SecondaryButton href={`/child/${id}/progress`}>
              View progress
            </SecondaryButton>
          )
        }
      />

      {child.isDemoFocus ? (
        <div className="mb-4 rounded-2xl border border-dashed border-[var(--teal)]/40 bg-[var(--teal-soft)]/50 px-4 py-3 text-sm text-[var(--teal-deep)] fade-up">
          <strong>Demo flow:</strong> View Progress → Start Lesson → mark targets →
          End Lesson → parent summary.
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="surface p-4 sm:p-5 fade-up fade-up-delay-1">
          <div className="mb-4 flex items-center gap-3">
            <span
              className="flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-semibold text-white"
              style={{ background: child.avatarColor }}
            >
              {child.name.slice(0, 1)}
            </span>
            <div>
              <p className="font-display text-2xl">{child.name}, {child.age}</p>
              <p className="text-sm text-[var(--muted)]">{child.russianLevel}</p>
            </div>
          </div>

          <dl className="grid gap-3 sm:grid-cols-2">
            <Info label="Dominant language" value={child.dominantLanguage} />
            <Info label="Lesson frequency" value={child.lessonFrequency} />
            <Info label="Current Russian level" value={child.russianLevel} />
            <Info label="Current learning goal" value={child.currentGoal} />
          </dl>
        </section>

        <section className="surface p-4 sm:p-5 fade-up fade-up-delay-2">
          <h2 className="font-display text-xl">Current goals</h2>
          <ul className="mt-3 space-y-2 text-sm text-[var(--ink-soft)]">
            <li className="rounded-xl bg-[var(--sand)]/70 px-3 py-2">
              {child.currentGoal}
            </li>
            {child.attentionAreas.slice(0, 2).map((item) => (
              <li key={item} className="rounded-xl bg-white/70 px-3 py-2">
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            <SecondaryButton href={`/child/${id}/history`} className="!py-2 text-xs">
              Lesson history
            </SecondaryButton>
            <SecondaryButton href={`/child/${id}/progress`} className="!py-2 text-xs">
              Full progress
            </SecondaryButton>
          </div>
        </section>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <ListCard title="Strengths" items={child.strengths} />
        <ListCard title="Needs attention" items={child.attentionAreas} tone="attention" />
        <ListCard title="Recent progress highlights" items={child.progressHighlights} tone="good" />
      </div>

      <section className="surface mt-4 p-4 sm:p-5 fade-up fade-up-delay-3">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="font-display text-xl">Recent lessons</h2>
          <SecondaryButton href={`/child/${id}/history`} className="!py-2 text-xs">
            See all
          </SecondaryButton>
        </div>
        <div className="space-y-3">
          {lessons.slice(0, 3).map((lesson) => (
            <div
              key={lesson.id}
              className="rounded-xl border border-[var(--line)] bg-white/60 px-3 py-3"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-semibold">{lesson.topic}</p>
                <p className="text-xs text-[var(--muted)]">{formatDate(lesson.date)}</p>
              </div>
              <p className="mt-1 text-sm text-[var(--ink-soft)]">{lesson.objective}</p>
              <p className="mt-2 text-xs text-[var(--teal-deep)]">
                Next: {lesson.nextTarget}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/60 px-3 py-2.5">
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">
        {label}
      </dt>
      <dd className="mt-1 text-sm leading-snug">{value}</dd>
    </div>
  );
}

function ListCard({
  title,
  items,
  tone = "neutral",
}: {
  title: string;
  items: string[];
  tone?: "neutral" | "attention" | "good";
}) {
  const border =
    tone === "attention"
      ? "border-[var(--attention)]/20"
      : tone === "good"
        ? "border-[var(--good)]/20"
        : "border-[var(--line)]";
  return (
    <section className={`surface p-4 ${border} fade-up`}>
      <h2 className="font-display text-lg">{title}</h2>
      <ul className="mt-3 space-y-2 text-sm text-[var(--ink-soft)]">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--teal)]" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function formatDate(iso: string) {
  return new Date(iso + "T12:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
