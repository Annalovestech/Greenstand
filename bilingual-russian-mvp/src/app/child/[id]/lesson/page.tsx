"use client";

import { useEffect, useMemo, use } from "react";
import { useRouter } from "next/navigation";
import { DEMO_LESSON } from "@/lib/data";
import { useApp } from "@/lib/app-context";
import type { ObservationResult } from "@/lib/types";
import {
  BackLink,
  LoadingScreen,
  PageTitle,
  PrimaryButton,
  SecondaryButton,
} from "@/components/ui";

const RESULT_OPTIONS: {
  value: ObservationResult;
  label: string;
  hint: string;
}[] = [
  { value: "independent", label: "Independent", hint: "Produced alone" },
  { value: "prompted", label: "With prompt", hint: "Needed a model" },
  { value: "not_yet", label: "Not yet", hint: "Couldn’t produce" },
];

export default function LessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const {
    ready,
    state,
    getChild,
    startLesson,
    setActivityIndex,
    markTarget,
    endLesson,
  } = useApp();

  const child = getChild(id);
  const active =
    state.activeLesson?.childId === id ? state.activeLesson : undefined;

  useEffect(() => {
    if (!ready) return;
    if (!active) startLesson(id);
  }, [ready, active, id, startLesson]);

  const activityIndex = active?.currentActivityIndex ?? 0;
  const activity = DEMO_LESSON.activities[activityIndex];
  const totalActivities = DEMO_LESSON.activities.length;
  const progressPct = ((activityIndex + 1) / totalActivities) * 100;

  const activityTargets = useMemo(
    () =>
      DEMO_LESSON.targets.filter((t) => activity?.targetIds.includes(t.id)),
    [activity]
  );

  const markedCount = Object.keys(active?.results ?? {}).length;
  const totalTargets = DEMO_LESSON.targets.length;

  if (!ready || !child) return <LoadingScreen />;

  const elapsedHint = DEMO_LESSON.activities
    .slice(0, activityIndex)
    .reduce((sum, a) => sum + a.durationMin, 0);

  function handleEnd() {
    const completed = endLesson(id);
    if (completed) {
      router.push(`/child/${id}/lesson/summary?lesson=${completed.id}`);
    }
  }

  return (
    <div>
      <BackLink href={`/child/${id}`} label={`Leave lesson · ${child.name}`} />
      <PageTitle
        eyebrow="20-minute live lesson"
        title={DEMO_LESSON.topic}
        subtitle={`${DEMO_LESSON.theme} · ${DEMO_LESSON.objective}`}
      />

      <section className="surface mb-4 p-4 fade-up">
        <div className="mb-2 flex items-center justify-between gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
          <span>
            Minute ~{elapsedHint}–{elapsedHint + (activity?.durationMin ?? 0)} of 20
          </span>
          <span>
            Block {activityIndex + 1}/{totalActivities}
          </span>
        </div>
        <div className="progress-bar">
          <span style={{ width: `${progressPct}%` }} />
        </div>
        <p className="mt-2 text-sm text-[var(--ink-soft)]">
          Targets marked: {markedCount}/{totalTargets} · Tap results as you go —
          almost no typing.
        </p>
      </section>

      <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
        {DEMO_LESSON.activities.map((a, index) => {
          const isCurrent = index === activityIndex;
          const isDone = index < activityIndex;
          return (
            <button
              key={a.id}
              type="button"
              onClick={() => setActivityIndex(index)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                isCurrent
                  ? "bg-[var(--teal)] text-white"
                  : isDone
                    ? "bg-[var(--teal-soft)] text-[var(--teal-deep)]"
                    : "bg-white/70 text-[var(--muted)]"
              }`}
            >
              {a.name}
            </button>
          );
        })}
      </div>

      {activity ? (
        <section className="surface p-4 sm:p-5 fade-up fade-up-delay-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--teal)]">
                {activity.durationMin} min block
              </p>
              <h2 className="font-display mt-1 text-2xl">{activity.name}</h2>
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <Panel title="Activity instructions" body={activity.instructions} />
            <Panel title="What to observe" body={activity.observe} tone="sand" />
          </div>

          <div className="mt-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">
              Prompts to ask
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {activity.prompts.map((p) => (
                <span
                  key={p}
                  className="rounded-xl bg-[var(--teal-soft)] px-3 py-1.5 text-sm text-[var(--teal-deep)]"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <h3 className="font-display text-lg">Mark targets</h3>
            <div className="mt-3 space-y-3">
              {activityTargets.map((target) => {
                const current = active?.results[target.id];
                return (
                  <div
                    key={target.id}
                    className="rounded-2xl border border-[var(--line)] bg-white/70 p-3"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-[var(--ink)]">
                          {target.text}
                        </p>
                        <p className="mt-0.5 text-xs text-[var(--muted)]">
                          {target.type === "phrase" ? "Phrase" : "Word"} ·{" "}
                          {target.skill.replaceAll("_", " ")}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {target.prompts.map((p) => (
                        <span
                          key={p}
                          className="rounded-full bg-[var(--sand)]/80 px-2 py-0.5 text-[11px] text-[var(--ink-soft)]"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {RESULT_OPTIONS.map((opt) => {
                        const selected = current === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => markTarget(target.id, opt.value)}
                            className={`rounded-xl px-2 py-2.5 text-center transition active:scale-[0.97] ${
                              selected
                                ? opt.value === "independent"
                                  ? "bg-[var(--good)] text-white"
                                  : opt.value === "prompted"
                                    ? "bg-[var(--amber)] text-white"
                                    : "bg-[var(--attention)] text-white"
                                : "bg-[var(--bg-top)] text-[var(--ink-soft)] hover:bg-white"
                            }`}
                          >
                            <span className="block text-xs font-bold sm:text-sm">
                              {opt.label}
                            </span>
                            <span
                              className={`mt-0.5 block text-[10px] ${
                                selected ? "text-white/80" : "text-[var(--muted)]"
                              }`}
                            >
                              {opt.hint}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-between">
            <SecondaryButton
              onClick={() => setActivityIndex(Math.max(0, activityIndex - 1))}
              className={activityIndex === 0 ? "pointer-events-none opacity-40" : ""}
            >
              Previous block
            </SecondaryButton>
            {activityIndex < totalActivities - 1 ? (
              <PrimaryButton onClick={() => setActivityIndex(activityIndex + 1)}>
                Next block →
              </PrimaryButton>
            ) : (
              <PrimaryButton onClick={handleEnd} className="bg-[var(--teal-deep)]">
                End lesson · generate summary
              </PrimaryButton>
            )}
          </div>
        </section>
      ) : null}

      <section className="surface mt-4 p-4 fade-up fade-up-delay-2">
        <h3 className="font-display text-lg">All lesson targets</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {DEMO_LESSON.targets.map((t) => {
            const result = active?.results[t.id];
            return (
              <span
                key={t.id}
                className={`rounded-full px-3 py-1.5 text-sm ${
                  result === "independent"
                    ? "bg-[rgba(47,125,87,0.15)] text-[var(--good)]"
                    : result === "prompted"
                      ? "bg-[rgba(176,122,42,0.15)] text-[var(--warn)]"
                      : result === "not_yet"
                        ? "bg-[rgba(163,77,63,0.15)] text-[var(--attention)]"
                        : "bg-white/80 text-[var(--muted)]"
                }`}
              >
                {t.text}
              </span>
            );
          })}
        </div>
        <div className="mt-4">
          <PrimaryButton onClick={handleEnd} className="w-full sm:w-auto">
            End lesson early & save observations
          </PrimaryButton>
        </div>
      </section>
    </div>
  );
}

function Panel({
  title,
  body,
  tone = "white",
}: {
  title: string;
  body: string;
  tone?: "white" | "sand";
}) {
  return (
    <div
      className={`rounded-xl px-3 py-3 ${
        tone === "sand" ? "bg-[var(--sand)]/70" : "bg-white/70"
      }`}
    >
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">
        {title}
      </p>
      <p className="mt-1 text-sm leading-relaxed text-[var(--ink-soft)]">{body}</p>
    </div>
  );
}
