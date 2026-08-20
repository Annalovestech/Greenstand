"use client";

import { use } from "react";
import { useApp } from "@/lib/app-context";
import { formatLevel } from "@/lib/progress";
import {
  BackLink,
  LevelPill,
  LoadingScreen,
  PageTitle,
  PrimaryButton,
  TrendPill,
} from "@/components/ui";

export default function ProgressPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { ready, state, getChild, startLesson } = useApp();

  if (!ready) return <LoadingScreen />;

  const child = getChild(id);
  const snapshot = state.progressByChild[id];

  if (!child || !snapshot) {
    return (
      <div className="surface p-6">
        <p>Progress not found.</p>
        <BackLink href="/" label="Back to dashboard" />
      </div>
    );
  }

  return (
    <div>
      <BackLink href={`/child/${id}`} label={`Back to ${child.name}`} />
      <PageTitle
        eyebrow="Progress dashboard"
        title={`${child.name}’s Russian growth`}
        subtitle="Parent-readable in under 30 seconds — levels, trends, evidence, and next targets. No empty percentages."
        action={
          child.isDemoFocus ? (
            <PrimaryButton
              href={`/child/${id}/lesson`}
              onClick={() => startLesson(id)}
            >
              Start lesson
            </PrimaryButton>
          ) : undefined
        }
      />

      <section className="surface mb-4 p-4 sm:p-5 fade-up">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--teal)]">
          {snapshot.monthLabel} · monthly snapshot
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <MonthBlock title="What improved" items={snapshot.monthly.improved} tone="good" />
          <MonthBlock title="What is stable" items={snapshot.monthly.stable} />
          <MonthBlock
            title="Needs attention"
            items={snapshot.monthly.needsAttention}
            tone="attention"
          />
          <MonthBlock title="New words / phrases" items={snapshot.monthly.newWordsPhrases} tone="teal" />
          <MonthBlock title="Next month focus" items={snapshot.monthly.nextMonthFocus} tone="sand" />
        </div>
      </section>

      <div className="space-y-3">
        {snapshot.skills.map((skill, index) => (
          <article
            key={skill.id}
            className="surface p-4 sm:p-5 fade-up"
            style={{ animationDelay: `${index * 0.04}s` }}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-xl">{skill.label}</h2>
                <div className="mt-2 flex flex-wrap gap-2">
                  <LevelPill level={formatLevel(skill.level)} />
                  <TrendPill trend={skill.trend} />
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <Field label="Evidence from recent lessons" value={skill.evidence} />
              <Field label="Current weakness" value={skill.weakness} />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                  Examples the child can use
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {skill.examples.map((ex) => (
                    <span
                      key={ex}
                      className="rounded-full bg-[var(--teal-soft)] px-2.5 py-1 text-sm text-[var(--teal-deep)]"
                    >
                      {ex}
                    </span>
                  ))}
                </div>
              </div>
              <Field label="Next target" value={skill.nextTarget} emphasize />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function MonthBlock({
  title,
  items,
  tone = "neutral",
}: {
  title: string;
  items: string[];
  tone?: "neutral" | "good" | "attention" | "teal" | "sand";
}) {
  const bg =
    tone === "good"
      ? "bg-[rgba(47,125,87,0.08)]"
      : tone === "attention"
        ? "bg-[rgba(163,77,63,0.08)]"
        : tone === "teal"
          ? "bg-[var(--teal-soft)]/70"
          : tone === "sand"
            ? "bg-[var(--sand)]/80"
            : "bg-white/70";
  return (
    <div className={`rounded-xl ${bg} px-3 py-3`}>
      <h3 className="text-xs font-bold uppercase tracking-wide text-[var(--ink-soft)]">
        {title}
      </h3>
      <ul className="mt-2 space-y-1.5 text-sm leading-snug text-[var(--ink)]">
        {items.slice(0, 4).map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
    </div>
  );
}

function Field({
  label,
  value,
  emphasize,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <div className={emphasize ? "rounded-xl bg-[var(--sand)]/70 px-3 py-2.5" : ""}>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-1 text-sm leading-relaxed text-[var(--ink-soft)]">{value}</p>
    </div>
  );
}
