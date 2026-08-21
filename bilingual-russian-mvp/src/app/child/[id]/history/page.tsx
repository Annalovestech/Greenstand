"use client";

import { use } from "react";
import { useApp } from "@/lib/app-context";
import {
  BackLink,
  LoadingScreen,
  PageTitle,
  PrimaryButton,
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
      <div className="py-8">
        <p>Child not found.</p>
        <BackLink href="/" label="Back" />
      </div>
    );
  }

  return (
    <div>
      <BackLink href={`/child/${id}`} label={`Back to ${child.name}`} />
      <PageTitle
        title="History"
        subtitle={`${child.name}’s recent lessons`}
        action={
          <PrimaryButton
            href={`/child/${id}/lesson`}
            onClick={() => startLesson(id)}
            className="!px-4 !py-2.5 text-[14px]"
          >
            Start lesson
          </PrimaryButton>
        }
      />

      <div className="divide-y divide-[var(--line)]">
        {lessons.map((lesson) => (
          <article key={lesson.id} className="py-4 fade-up">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-[16px] font-semibold">{lesson.topic}</h2>
              <p className="text-[12px] text-[var(--muted)]">
                {new Date(lesson.date + "T12:00:00").toLocaleDateString(
                  "en-US",
                  { month: "short", day: "numeric" }
                )}
              </p>
            </div>
            <p className="mt-1 text-[14px] text-[var(--ink-soft)]">
              {lesson.observationSummary}
            </p>
            <p className="mt-2 text-[13px] text-[var(--teal-deep)]">
              Next: {lesson.nextTarget}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
