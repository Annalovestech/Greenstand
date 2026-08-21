"use client";

import { useEffect, useMemo, useState, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DEMO_LESSON } from "@/lib/data";
import { useApp } from "@/lib/app-context";
import type { ObservationResult } from "@/lib/types";
import {
  BackLink,
  LoadingScreen,
  PrimaryButton,
  QuietButton,
  SecondaryButton,
} from "@/components/ui";

const LESSON_MINUTES = 20;

const RESULT_OPTIONS: {
  value: ObservationResult;
  label: string;
}[] = [
  { value: "independent", label: "Independent" },
  { value: "prompted", label: "Prompted" },
  { value: "not_yet", label: "Not yet" },
];

export default function LessonPageInner({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const scheduleId = searchParams.get("schedule") ?? undefined;

  const {
    ready,
    state,
    getChild,
    startLesson,
    setActivityIndex,
    markTarget,
    endLesson,
    updateZoom,
  } = useApp();

  const child = getChild(id);
  const active =
    state.activeLesson?.childId === id ? state.activeLesson : undefined;

  const scheduled =
    state.schedule.find(
      (s) => s.id === (active?.scheduledLessonId ?? scheduleId)
    ) ??
    state.schedule.find(
      (s) =>
        s.childId === id && (s.status === "upcoming" || s.status === "live")
    );

  const [zoomLive, setZoomLive] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(LESSON_MINUTES * 60);
  const [usedPrompts, setUsedPrompts] = useState<Record<string, boolean>>({});
  const [showAllTargets, setShowAllTargets] = useState(false);
  const [editZoom, setEditZoom] = useState(false);
  const [zoomUrl, setZoomUrl] = useState("");
  const [meetingId, setMeetingId] = useState("");

  useEffect(() => {
    if (!ready) return;
    if (!active) startLesson(id, scheduleId ?? scheduled?.id);
  }, [ready, active, id, startLesson, scheduleId, scheduled?.id]);

  useEffect(() => {
    if (scheduled) {
      setZoomUrl(scheduled.zoom.url);
      setMeetingId(scheduled.zoom.meetingId ?? "");
    }
  }, [scheduled]);

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
  const nextIsMovement =
    DEMO_LESSON.activities[activityIndex + 1]?.kind === "movement";

  if (!ready || !child) return <LoadingScreen />;

  function handleEnd() {
    const completed = endLesson(id);
    if (completed) {
      router.push(`/child/${id}/lesson/summary?lesson=${completed.id}`);
    }
  }

  function joinZoom() {
    setZoomLive(true);
    setSecondsLeft(LESSON_MINUTES * 60);
    if (scheduled?.zoom.url) {
      window.open(scheduled.zoom.url, "_blank", "noopener,noreferrer");
    }
  }

  function saveZoom() {
    if (!scheduled || !zoomDraft) return;
    updateZoom(scheduled.id, {
      url: zoomDraft.url,
      meetingId: zoomDraft.meetingId,
    });
    setEditZoom(false);
    setZoomDraft(null);
  }

  return (
    <div className="pb-2">
      <BackLink href={`/child/${id}`} label={`Leave · ${child.name}`} />

      <header className="fade-up">
        <h1 className="font-display text-[1.75rem] leading-tight tracking-tight text-[var(--ink)]">
          {DEMO_LESSON.topic}
        </h1>
        <p className="mt-1 text-[14px] text-[var(--muted)]">
          {LESSON_MINUTES} min · Block {activityIndex + 1} of {totalActivities}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
          {zoomLive ? (
            <p className="text-[14px] font-semibold text-[var(--teal-deep)]">
              Zoom · Live · {formatClock(secondsLeft)} remaining
            </p>
          ) : (
            <SecondaryButton
              onClick={joinZoom}
              className="!px-3.5 !py-2 text-[14px]"
            >
              Join Zoom
            </SecondaryButton>
          )}
          <QuietButton onClick={() => setEditZoom((v) => !v)}>
            {editZoom ? "Close" : "Edit link"}
          </QuietButton>
        </div>

        {editZoom ? (
          <div className="mt-3 space-y-2">
            <input
              className="field"
              value={zoomUrl}
              onChange={(e) => setZoomUrl(e.target.value)}
              placeholder="Zoom URL"
            />
            <input
              className="field"
              value={meetingId}
              onChange={(e) => setMeetingId(e.target.value)}
              placeholder="Meeting ID"
            />
            <QuietButton onClick={saveZoom}>Save Zoom</QuietButton>
          </div>
        ) : null}

        {scheduled?.zoom.meetingId && !editZoom ? (
          <p className="mt-2 text-[12px] text-[var(--muted)]">
            Meeting ID {scheduled.zoom.meetingId}
          </p>
        ) : null}

        <div className="mt-4">
          <div className="progress-bar">
            <span style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      </header>

      {activity ? (
        <div className="mt-6 fade-up fade-up-delay-1">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setActivityIndex(Math.max(0, activityIndex - 1))}
              disabled={activityIndex === 0}
              className="text-[14px] font-semibold text-[var(--teal)] disabled:opacity-30"
            >
              Previous
            </button>
            <div className="min-w-0 text-center">
              <p className="text-[15px] font-semibold text-[var(--ink)]">
                {activityIndex + 1} of {totalActivities} · {activity.name}
              </p>
              <p className="text-[12px] text-[var(--muted)]">
                {activity.durationMin} min
                {activity.kind === "movement" ? " · Movement" : ""}
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
              className="text-[14px] font-semibold text-[var(--teal)] disabled:opacity-30"
            >
              Next
            </button>
          </div>

          {nextIsMovement ? (
            <p className="mt-3 text-center text-[12px] text-[var(--muted)]">
              Movement break next
            </p>
          ) : null}

          <div className="mt-6 space-y-5">
            <BlockCue label="Do" body={activity.instructions} />
            <BlockCue label="Watch for" body={activity.observe} soft />
            <div>
              <p className="text-[13px] font-medium text-[var(--muted)]">Say</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {activity.prompts.map((p) => {
                  const used = usedPrompts[p];
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() =>
                        setUsedPrompts((prev) => ({
                          ...prev,
                          [p]: !prev[p],
                        }))
                      }
                      className={`rounded-full px-3.5 py-2 text-[14px] transition active:scale-[0.97] ${
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

          <div className="mt-8">
            <div className="mb-3 flex items-baseline justify-between gap-2">
              <h2 className="text-[15px] font-semibold">Mark targets</h2>
              <p className="text-[12px] text-[var(--muted)]">
                {markedCount}/{totalTargets}
              </p>
            </div>
            <div className="space-y-5">
              {activityTargets.map((target) => {
                const current = active?.results[target.id];
                return (
                  <div key={target.id}>
                    <p className="text-[15px] font-semibold text-[var(--ink)]">
                      {target.text}
                    </p>
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      {RESULT_OPTIONS.map((opt) => {
                        const selected = current === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => markTarget(target.id, opt.value)}
                            className={`rounded-[12px] px-2 py-2.5 text-center text-[13px] font-semibold transition active:scale-[0.97] ${
                              selected
                                ? opt.value === "independent"
                                  ? "bg-[var(--good)] text-white"
                                  : opt.value === "prompted"
                                    ? "bg-[var(--amber)] text-white"
                                    : "bg-[var(--attention)] text-white"
                                : "bg-[rgba(120,120,128,0.08)] text-[var(--ink-soft)]"
                            }`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 sticky bottom-3 z-10">
            {activityIndex < totalActivities - 1 ? (
              <PrimaryButton
                onClick={() => setActivityIndex(activityIndex + 1)}
                className="w-full"
              >
                Next · {DEMO_LESSON.activities[activityIndex + 1]?.name}
              </PrimaryButton>
            ) : (
              <PrimaryButton onClick={handleEnd} className="w-full">
                End lesson
              </PrimaryButton>
            )}
          </div>
        </div>
      ) : null}

      <div className="mt-8 border-t border-[var(--line)] pt-3">
        <button
          type="button"
          onClick={() => setShowAllTargets((v) => !v)}
          className="flex w-full items-center justify-between text-[14px] text-[var(--muted)]"
        >
          <span>All targets</span>
          <span>{showAllTargets ? "Hide" : "Show"}</span>
        </button>
        {showAllTargets ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {DEMO_LESSON.targets.map((t) => {
              const result = active?.results[t.id];
              return (
                <span
                  key={t.id}
                  className={`rounded-full px-3 py-1 text-[13px] ${
                    result
                      ? "bg-[var(--teal-soft)] text-[var(--teal-deep)]"
                      : "text-[var(--muted)]"
                  }`}
                >
                  {t.text}
                </span>
              );
            })}
          </div>
        ) : null}
        <QuietButton onClick={handleEnd} className="mt-3">
          End early & save
        </QuietButton>
      </div>
    </div>
  );
}

function BlockCue({
  label,
  body,
  soft,
}: {
  label: string;
  body: string;
  soft?: boolean;
}) {
  return (
    <div
      className={
        soft ? "rounded-[12px] bg-[var(--sand)] px-3.5 py-3" : undefined
      }
    >
      <p className="text-[13px] font-medium text-[var(--muted)]">{label}</p>
      <p className="mt-1 text-[15px] leading-relaxed text-[var(--ink-soft)]">
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
