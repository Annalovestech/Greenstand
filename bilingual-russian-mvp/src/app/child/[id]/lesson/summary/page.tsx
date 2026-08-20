"use client";

import { Suspense, useMemo, use } from "react";
import { useSearchParams } from "next/navigation";
import { useApp } from "@/lib/app-context";
import {
  BackLink,
  LoadingScreen,
  PageTitle,
  PrimaryButton,
  SecondaryButton,
} from "@/components/ui";

export default function LessonSummaryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <LessonSummaryInner params={params} />
    </Suspense>
  );
}

function LessonSummaryInner({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const lessonParam = searchParams.get("lesson");
  const { ready, state, getChild } = useApp();

  const child = getChild(id);
  const lesson = useMemo(() => {
    const list = state.lessonsByChild[id] ?? [];
    if (lessonParam) {
      return list.find((l) => l.id === lessonParam) ?? list[0];
    }
    if (state.lastCompletedLessonId) {
      return (
        list.find((l) => l.id === state.lastCompletedLessonId) ?? list[0]
      );
    }
    return list[0];
  }, [state, id, lessonParam]);

  if (!ready) return <LoadingScreen />;

  if (!child || !lesson) {
    return (
      <div className="surface p-6">
        <p>No lesson summary yet. Complete a lesson first.</p>
        <BackLink href={`/child/${id}/lesson`} label="Start a lesson" />
      </div>
    );
  }

  return (
    <div>
      <BackLink href={`/child/${id}`} label={`Back to ${child.name}`} />
      <PageTitle
        eyebrow="Lesson summary"
        title={`${lesson.topic} · done`}
        subtitle="Generated from your taps — deterministic, no invented progress."
        action={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <SecondaryButton href={`/child/${id}/progress`}>
              See updated progress
            </SecondaryButton>
            <PrimaryButton href={`/child/${id}/history`}>
              Lesson history
            </PrimaryButton>
          </div>
        }
      />

      <section className="surface mb-4 border-l-4 border-l-[var(--teal)] p-4 sm:p-5 fade-up">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--teal)]">
          Parent-friendly summary
        </p>
        <p className="mt-2 text-base leading-relaxed text-[var(--ink)]">
          {lesson.parentSummary}
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <SummaryList title="What went well" items={lesson.wentWell} tone="good" />
        <SummaryList title="What improved" items={lesson.improved} tone="teal" />
        <SummaryList title="Still needs work" items={lesson.needsWork} tone="attention" />
      </div>

      <section className="surface mt-4 p-4 sm:p-5 fade-up fade-up-delay-1">
        <h2 className="font-display text-xl">Next learning targets</h2>
        <ol className="mt-3 space-y-2">
          {lesson.nextTargets.map((t, i) => (
            <li
              key={t}
              className="flex items-center gap-3 rounded-xl bg-[var(--sand)]/70 px-3 py-2.5 text-sm"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--teal)] text-xs font-bold text-white">
                {i + 1}
              </span>
              <span className="font-medium">{t}</span>
            </li>
          ))}
        </ol>
        <p className="mt-3 text-sm text-[var(--ink-soft)]">
          Progress gained: {lesson.progressGained}
        </p>
      </section>

      <section className="surface mt-4 p-4 sm:p-5 fade-up fade-up-delay-2">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--amber)]">
          2-minute home practice
        </p>
        <h2 className="font-display mt-1 text-xl">{lesson.homePractice.title}</h2>
        <p className="mt-2 text-sm text-[var(--ink-soft)]">
          {lesson.homePractice.instructions}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {lesson.homePractice.prompts.map((p) => (
            <span
              key={p}
              className="rounded-xl bg-[var(--teal-soft)] px-3 py-2 text-sm text-[var(--teal-deep)]"
            >
              {p}
            </span>
          ))}
        </div>
      </section>

      {lesson.observations.length > 0 ? (
        <section className="surface mt-4 p-4 sm:p-5 fade-up fade-up-delay-3">
          <h2 className="font-display text-xl">Observation log</h2>
          <ul className="mt-3 divide-y divide-[var(--line)]">
            {lesson.observations.map((o) => (
              <li
                key={o.id}
                className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm"
              >
                <span>
                  <span className="font-medium">{o.targetText}</span>
                  <span className="text-[var(--muted)]">
                    {" "}
                    · {o.skill.replaceAll("_", " ")}
                  </span>
                </span>
                <ResultBadge result={o.result} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <PrimaryButton href={`/child/${id}/progress`} className="flex-1">
          View updated progress dashboard
        </PrimaryButton>
        <SecondaryButton href="/" className="flex-1">
          Back to teacher dashboard
        </SecondaryButton>
      </div>
    </div>
  );
}

function SummaryList({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "good" | "teal" | "attention";
}) {
  const bg =
    tone === "good"
      ? "bg-[rgba(47,125,87,0.08)]"
      : tone === "attention"
        ? "bg-[rgba(163,77,63,0.08)]"
        : "bg-[var(--teal-soft)]/60";
  return (
    <section className={`surface p-4 ${bg} fade-up`}>
      <h2 className="font-display text-lg">{title}</h2>
      <ul className="mt-3 space-y-2 text-sm text-[var(--ink-soft)]">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--teal)]" />
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

function ResultBadge({ result }: { result: string }) {
  const label =
    result === "independent"
      ? "Independent"
      : result === "prompted"
        ? "With prompt"
        : "Not yet";
  const cls =
    result === "independent"
      ? "bg-[rgba(47,125,87,0.15)] text-[var(--good)]"
      : result === "prompted"
        ? "bg-[rgba(176,122,42,0.15)] text-[var(--warn)]"
        : "bg-[rgba(163,77,63,0.15)] text-[var(--attention)]";
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${cls}`}>
      {label}
    </span>
  );
}
