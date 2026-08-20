"use client";

import Link from "next/link";
import { useApp } from "@/lib/app-context";
import {
  LoadingScreen,
  MiniTrend,
  PageTitle,
  PrimaryButton,
} from "@/components/ui";

export default function DashboardPage() {
  const { ready, state } = useApp();

  if (!ready) return <LoadingScreen />;

  const focus = state.children.find((c) => c.isDemoFocus) ?? state.children[0];

  return (
    <div>
      <PageTitle
        eyebrow="Teacher dashboard"
        title="Today’s learners"
        subtitle="Three bilingual preschoolers. Start with Lana — the main demo path is highlighted."
      />

      <section className="surface mb-5 overflow-hidden p-4 sm:p-5 fade-up fade-up-delay-1">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--amber)]">
              Suggested demo path
            </p>
            <h2 className="font-display mt-1 text-2xl text-[var(--ink)]">
              Open Lana → Progress → Start lesson
            </h2>
            <p className="mt-1 max-w-lg text-sm text-[var(--ink-soft)]">
              Mark targets with taps, end the lesson, then see the parent summary
              and updated progress.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:items-end">
            <PrimaryButton href={`/child/${focus.id}`} className="pulse-soft w-full sm:w-auto">
              Open Lana’s profile
            </PrimaryButton>
            <PrimaryButton
              href={`/child/${focus.id}/lesson`}
              className="w-full bg-[var(--teal-deep)] sm:w-auto"
            >
              Start 20-min lesson
            </PrimaryButton>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        {state.children.map((child, index) => {
          const lessons = state.lessonsByChild[child.id] ?? [];
          const recent = lessons[0];
          const skills = state.progressByChild[child.id]?.skills ?? [];
          const improving = skills.filter((s) => s.trend === "improving").length;
          const attention = skills.filter((s) => s.trend === "needs_attention").length;
          const overallTrend =
            attention > improving
              ? "needs_attention"
              : improving > 0
                ? "improving"
                : "stable";

          return (
            <Link
              key={child.id}
              href={`/child/${child.id}`}
              className={`surface block p-4 transition hover:-translate-y-0.5 hover:bg-white/90 fade-up ${
                child.isDemoFocus ? "ring-2 ring-[var(--teal)]/35" : ""
              }`}
              style={{ animationDelay: `${0.08 + index * 0.06}s` }}
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-11 w-11 items-center justify-center rounded-2xl text-lg font-semibold text-white"
                    style={{ background: child.avatarColor }}
                  >
                    {child.name.slice(0, 1)}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-display text-xl">{child.name}</h3>
                      {child.isDemoFocus ? (
                        <span className="rounded-full bg-[var(--teal-soft)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--teal-deep)]">
                          Demo
                        </span>
                      ) : null}
                    </div>
                    <p className="text-xs text-[var(--muted)]">
                      Age {child.age} · {child.dominantLanguage}-dominant
                    </p>
                  </div>
                </div>
                <MiniTrend trend={overallTrend} />
              </div>

              <dl className="space-y-2 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-[var(--muted)]">Russian level</dt>
                  <dd className="text-right font-medium">{child.russianLevel}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-[var(--muted)]">Frequency</dt>
                  <dd className="text-right font-medium">{child.lessonFrequency}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-[var(--muted)]">Recent lesson</dt>
                  <dd className="text-right font-medium">
                    {recent ? recent.topic : "—"}
                  </dd>
                </div>
              </dl>

              <div className="mt-3 rounded-xl bg-[var(--sand)]/60 px-3 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                  Current goal
                </p>
                <p className="mt-0.5 text-sm leading-snug text-[var(--ink)]">
                  {child.currentGoal}
                </p>
              </div>

              <p className="mt-3 text-xs text-[var(--ink-soft)]">
                Trend: {improving} improving · {attention} need attention
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
