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
        title="Progress"
        subtitle={`${child.name} · ${snapshot.monthLabel}`}
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

      <section className="mb-8 fade-up">
        <div className="space-y-4">
          <MonthBlock title="Improved" items={snapshot.monthly.improved} />
          <MonthBlock title="Needs attention" items={snapshot.monthly.needsAttention} />
          <MonthBlock title="Next focus" items={snapshot.monthly.nextMonthFocus} />
        </div>
      </section>

      <div className="divide-y divide-[var(--line)]">
        {snapshot.skills.map((skill) => (
          <article key={skill.id} className="py-5 fade-up">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-[16px] font-semibold">{skill.label}</h2>
                <div className="mt-2 flex flex-wrap gap-2">
                  <LevelPill level={formatLevel(skill.level)} />
                  <TrendPill trend={skill.trend} />
                </div>
              </div>
            </div>

            <div className="mt-3 space-y-3">
              <Field label="Evidence" value={skill.evidence} />
              <Field label="Next target" value={skill.nextTarget} />
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
}: {
  title: string;
  items: string[];
  tone?: "neutral" | "good" | "attention" | "teal" | "sand";
}) {
  return (
    <div>
      <h3 className="text-[13px] font-medium text-[var(--muted)]">{title}</h3>
      <ul className="mt-1.5 space-y-1 text-[15px] leading-snug text-[var(--ink-soft)]">
        {items.slice(0, 3).map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function Field({
  label,
  value,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <div>
      <p className="text-[13px] text-[var(--muted)]">{label}</p>
      <p className="mt-0.5 text-[14px] leading-relaxed text-[var(--ink-soft)]">
        {value}
      </p>
    </div>
  );
}
