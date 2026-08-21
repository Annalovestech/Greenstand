"use client";

import { useEffect, useMemo, useState, use } from "react";
import { useRouter } from "next/navigation";
import { DEMO_LESSON } from "@/lib/data";
import { useApp } from "@/lib/app-context";
import type { ObservationResult } from "@/lib/types";
import {
  BackLink,
  LoadingScreen,
  PrimaryButton,
  SecondaryButton,
} from "@/components/ui";

const LESSON_MINUTES = 20;

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

  const [zoomLive, setZoomLive] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(LESSON_MINUTES * 60);
  const [usedPrompts, setUsedPrompts] = useState<Record<string, boolean>>({});
  const [showAllTargets, setShowAllTargets] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (!active) startLesson(id);
  }, [ready, active, id, startLesson]);

  useEffect(() => {
    if (!zoomLive) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [zoomLive]);

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

  const remainingHint = DEMO_LESSON.activities
    .slice(activityIndex)
    .reduce((sum, a) => sum + a.durationMin, 0);

  if (!ready || !child) return <LoadingScreen />;

  function handleEnd() {
    const completed = endLesson(id);
    if (completed) {
      router.push(`/child/${id}/lesson/summary?lesson=${completed.id}`);
    }
  }

  function togglePrompt(prompt: string) {
    setUsedPrompts((prev) => ({ ...prev, [prompt]: !prev[prompt] }));
  }

  return (
    <div className="pb-2">
      <BackLink href={`/child/${id}`} label={`Leave · ${child.name}`} />

      {/* Focused lesson header — not a heavy card stack */}
      <header className="fade-up">
        <h1 className="font-display text-2xl leading-tight text-[var(--ink)] sm:text-3xl">
          {DEMO_LESSON.topic}
        </h1>
        <p className="mt-1 text-sm text-[var(--ink-soft)]">
          {LESSON_MINUTES}-minute lesson · {DEMO_LESSON.theme} · Block{" "}
          {activityIndex + 1} of {totalActivities}
        </p>

        <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-2">
          {zoomLive ? (
            <p className="text-sm font-semibold text-[var(--teal-deep)]">
              Zoom · Live · {formatClock(secondsLeft)} remaining
            </p>
          ) : (
            <SecondaryButton
              onClick={() => {
                setZoomLive(true);
                setSecondsLeft(LESSON_MINUTES * 60);
              }}
              className="!px-3.5 !py-2 text-sm"
            >
              Join Zoom
            </SecondaryButton>
          )}
          {!zoomLive ? (
            <p className="text-xs font-medium text-[var(--muted)]">
              ~{Math.max(0, remainingHint)} min left in plan
            </p>
          ) : null}
        </div>

        <div className="mt-3">
          <div className="progress-bar">
            <span style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      </header>

      {/* Step navigation replaces horizontal tabs */}
      {activity ? (
        <div className="mt-4 fade-up fade-up-delay-1">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setActivityIndex(Math.max(0, activityIndex - 1))}
              disabled={activityIndex === 0}
              className="rounded-xl border border-[var(--line)] bg-white/80 px-3 py-2.5 text-sm font-semibold text-[var(--ink)] transition enabled:active:scale-[0.98] disabled:opacity-35"
              aria-label="Previous block"
            >
              Prev
            </button>
            <div className="min-w-0 text-center">
              <p className="text-sm font-semibold text-[var(--ink)]">
                {activityIndex + 1} of {totalActivities} · {activity.name}
              </p>
              <p className="text-xs text-[var(--muted)]">
                {activity.durationMin} min
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setActivityIndex(
                  Math.min(totalActivities - 1, activityIndex + 1)
                )
              }
              disabled={activityIndex >= totalActivities - 1}
              className="rounded-xl border border-[var(--line)] bg-white/80 px-3 py-2.5 text-sm font-semibold text-[var(--ink)] transition enabled:active:scale-[0.98] disabled:opacity-35"
              aria-label="Next block"
            >
              Next
            </button>
          </div>

          {/* Light activity content — Do / Watch for / Say */}
          <div className="mt-4 space-y-4 border-t border-[var(--line)] pt-4">
            <BlockCue label="Do" body={activity.instructions} />
            <BlockCue
              label="Watch for"
              body={activity.observe}
              accent="sand"
            />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                Say
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {activity.prompts.map((p) => {
                  const used = usedPrompts[p];
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => togglePrompt(p)}
                      className={`rounded-xl px-3 py-2 text-sm transition active:scale-[0.97] ${
                        used
                          ? "bg-[var(--teal)] text-white"
                          : "bg-[var(--teal-soft)] text-[var(--teal-deep)]"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Mark targets — essential teacher action, lighter framing */}
          <div className="mt-5 border-t border-[var(--line)] pt-4">
            <div className="mb-3 flex items-baseline justify-between gap-2">
              <h2 className="font-display text-lg">Mark targets</h2>
              <p className="text-xs text-[var(--muted)]">
                {markedCount}/{totalTargets} marked
              </p>
            </div>
            <div className="space-y-4">
              {activityTargets.map((target) => {
                const current = active?.results[target.id];
                return (
                  <div key={target.id}>
                    <p className="font-semibold text-[var(--ink)]">
                      {target.text}
                    </p>
                    <p className="mt-0.5 text-xs text-[var(--muted)]">
                      {target.type === "phrase" ? "Phrase" : "Word"} ·{" "}
                      {target.skill.replaceAll("_", " ")}
                    </p>
                    <div className="mt-2 grid grid-cols-3 gap-2">
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
                                : "bg-white/70 text-[var(--ink-soft)] ring-1 ring-[var(--line)]"
                            }`}
                          >
                            <span className="block text-xs font-bold sm:text-sm">
                              {opt.label}
                            </span>
                            <span
                              className={`mt-0.5 block text-[10px] ${
                                selected
                                  ? "text-white/80"
                                  : "text-[var(--muted)]"
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
              {activityTargets.length === 0 ? (
                <p className="text-sm text-[var(--muted)]">
                  No targets for this block — move on when ready.
                </p>
              ) : null}
            </div>
          </div>

          <div className="mt-5 sticky bottom-3 z-10">
            {activityIndex < totalActivities - 1 ? (
              <PrimaryButton
                onClick={() => setActivityIndex(activityIndex + 1)}
                className="w-full shadow-[var(--shadow)]"
              >
                Next · {DEMO_LESSON.activities[activityIndex + 1]?.name}
              </PrimaryButton>
            ) : (
              <PrimaryButton
                onClick={handleEnd}
                className="w-full bg-[var(--teal-deep)] shadow-[var(--shadow)]"
              >
                End lesson · generate summary
              </PrimaryButton>
            )}
          </div>
        </div>
      ) : null}

      {/* Progressive disclosure for secondary overview */}
      <div className="mt-6 border-t border-[var(--line)] pt-3 fade-up fade-up-delay-2">
        <button
          type="button"
          onClick={() => setShowAllTargets((v) => !v)}
          className="flex w-full items-center justify-between gap-2 text-left text-sm font-semibold text-[var(--ink-soft)]"
        >
          <span>All lesson targets</span>
          <span className="text-xs font-medium text-[var(--muted)]">
            {showAllTargets ? "Hide" : "Show"}
          </span>
        </button>
        {showAllTargets ? (
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
        ) : null}
        <button
          type="button"
          onClick={handleEnd}
          className="mt-3 text-sm font-medium text-[var(--muted)] underline-offset-2 hover:text-[var(--ink-soft)] hover:underline"
        >
          End lesson early & save observations
        </button>
      </div>
    </div>
  );
}

function BlockCue({
  label,
  body,
  accent,
}: {
  label: string;
  body: string;
  accent?: "sand";
}) {
  return (
    <div
      className={
        accent === "sand"
          ? "-mx-1 rounded-xl bg-[var(--sand)]/55 px-3 py-2.5"
          : undefined
      }
    >
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-1 text-sm leading-relaxed text-[var(--ink-soft)]">
        {body}
      </p>
    </div>
  );
}

function formatClock(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
