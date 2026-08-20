import { DEMO_LESSON } from "./data";
import type {
  CompletedLesson,
  LanguageSkill,
  Observation,
  ObservationResult,
  ProgressSnapshot,
  SkillId,
  SkillLevel,
  Trend,
} from "./types";

const LEVEL_RANK: Record<SkillLevel, number> = {
  emerging: 0,
  developing: 1,
  consolidating: 2,
  confident: 3,
};

const RANK_LEVEL: SkillLevel[] = [
  "emerging",
  "developing",
  "consolidating",
  "confident",
];

function scoreResult(result: ObservationResult): number {
  if (result === "independent") return 2;
  if (result === "prompted") return 1;
  return 0;
}

function bumpLevel(level: SkillLevel, delta: number): SkillLevel {
  const next = Math.min(3, Math.max(0, LEVEL_RANK[level] + delta));
  return RANK_LEVEL[next];
}

function trendFromScores(independent: number, prompted: number, notYet: number): Trend {
  if (independent >= 2 || (independent >= 1 && prompted >= 1 && notYet === 0)) {
    return "improving";
  }
  if (notYet >= 2 || (notYet >= 1 && independent === 0)) {
    return "needs_attention";
  }
  return "stable";
}

export function generateLessonSummary(input: {
  childId: string;
  childName: string;
  results: Record<string, ObservationResult>;
  date: string;
}): CompletedLesson {
  const template = DEMO_LESSON;
  const observations: Observation[] = template.targets
    .filter((t) => input.results[t.id])
    .map((t, index) => ({
      id: `obs-${input.date}-${t.id}-${index}`,
      childId: input.childId,
      lessonId: `lesson-${input.date}-clothes`,
      skill: t.skill,
      targetId: t.id,
      targetText: t.text,
      result: input.results[t.id],
      date: input.date,
    }));

  const independent = observations.filter((o) => o.result === "independent");
  const prompted = observations.filter((o) => o.result === "prompted");
  const notYet = observations.filter((o) => o.result === "not_yet");

  const wentWell =
    independent.length > 0
      ? independent.map((o) => `Independent: ${o.targetText}`)
      : prompted.length > 0
        ? prompted.slice(0, 2).map((o) => `Emerging with support: ${o.targetText}`)
        : ["Stayed engaged through the lesson blocks"];

  const improved =
    independent.length > 0
      ? [
          `Production moving toward independence on ${independent
            .map((o) => o.targetText)
            .join(", ")}`,
        ]
      : prompted.length > 0
        ? [
            `Responds with a prompt on ${prompted
              .slice(0, 3)
              .map((o) => o.targetText)
              .join(", ")}`,
          ]
        : ["Listening and participation observed; production still emerging"];

  const needsWork =
    notYet.length > 0
      ? notYet.map((o) => o.targetText)
      : prompted
          .filter((o) => !independent.some((i) => i.skill === o.skill))
          .slice(0, 2)
          .map((o) => `${o.targetText} (still needs a model)`);

  const nextTargets = [
    ...notYet.map((o) => o.targetText),
    ...prompted.map((o) => o.targetText),
  ]
    .filter((v, i, arr) => arr.indexOf(v) === i)
    .slice(0, 3);

  if (nextTargets.length < 2) {
    nextTargets.push("Я надеваю…", "Где мои носки?");
  }

  const parentSummary = buildParentSummary(
    input.childName,
    independent.map((o) => o.targetText),
    prompted.map((o) => o.targetText),
    notYet.map((o) => o.targetText)
  );

  const progressGained =
    independent.length >= 2
      ? `Clear gains: ${independent.length} targets independent`
      : independent.length === 1
        ? `One independent win (${independent[0].targetText}); others still supported`
        : prompted.length > 0
          ? "Mostly prompted responses — foundation building"
          : "Targets not yet productive; keep receptive exposure high";

  const observationSummary = [
    independent.length
      ? `Independent: ${independent.map((o) => o.targetText).join(", ")}.`
      : null,
    prompted.length
      ? `With prompt: ${prompted.map((o) => o.targetText).join(", ")}.`
      : null,
    notYet.length
      ? `Not yet: ${notYet.map((o) => o.targetText).join(", ")}.`
      : null,
  ]
    .filter(Boolean)
    .join(" ");

  return {
    id: `lesson-${input.date}-clothes`,
    childId: input.childId,
    templateId: template.id,
    topic: template.topic,
    objective: template.objective,
    date: input.date,
    durationMin: 20,
    observationSummary:
      observationSummary || "Lesson completed with limited target markings.",
    progressGained,
    nextTarget: nextTargets[0],
    wentWell,
    improved,
    needsWork: needsWork.length ? needsWork : ["Continue color + clothing pairing"],
    nextTargets: nextTargets.slice(0, 3),
    parentSummary,
    homePractice: {
      title: "Dressing talk (2 minutes)",
      instructions:
        "During real dressing, ask one question at a time and wait. Praise any Russian attempt.",
      prompts: [
        "Какого цвета футболка?",
        "Что ты надеваешь?",
        "Где твои носки?",
      ],
    },
    observations,
  };
}

function buildParentSummary(
  name: string,
  independent: string[],
  prompted: string[],
  notYet: string[]
): string {
  const parts: string[] = [];
  parts.push(
    `${name} worked on clothes and colors in a 20-minute Russian lesson today.`
  );
  if (independent.length) {
    parts.push(
      `She managed on her own: ${independent.join(", ")}.`
    );
  }
  if (prompted.length) {
    parts.push(
      `With a little help she tried: ${prompted.join(", ")}.`
    );
  }
  if (notYet.length) {
    parts.push(
      `Still learning: ${notYet.join(", ")} — we’ll revisit these next time.`
    );
  }
  parts.push(
    "At home, ask during dressing: Какого цвета футболка? Что ты надеваешь? Где твои носки?"
  );
  return parts.join(" ");
}

export function applyLessonToProgress(
  snapshot: ProgressSnapshot,
  lesson: CompletedLesson
): ProgressSnapshot {
  const bySkill = new Map<SkillId, Observation[]>();
  for (const obs of lesson.observations) {
    const list = bySkill.get(obs.skill) ?? [];
    list.push(obs);
    bySkill.set(obs.skill, list);
  }

  const skills: LanguageSkill[] = snapshot.skills.map((skill) => {
    const obs = bySkill.get(skill.id);
    if (!obs || obs.length === 0) return skill;

    const independentCount = obs.filter((o) => o.result === "independent").length;
    const promptedCount = obs.filter((o) => o.result === "prompted").length;
    const notYetCount = obs.filter((o) => o.result === "not_yet").length;
    const avg =
      obs.reduce((sum, o) => sum + scoreResult(o.result), 0) / obs.length;

    let levelDelta = 0;
    if (avg >= 1.5 && independentCount > 0) levelDelta = 1;
    else if (avg < 0.5 && notYetCount > promptedCount) levelDelta = 0; // stay, mark attention

    const trend = trendFromScores(independentCount, promptedCount, notYetCount);
    const level = levelDelta > 0 ? bumpLevel(skill.level, levelDelta) : skill.level;

    const examples = [
      ...obs.filter((o) => o.result === "independent").map((o) => o.targetText),
      ...skill.examples,
    ]
      .filter((v, i, arr) => arr.indexOf(v) === i)
      .slice(0, 6);

    const weakness =
      notYetCount > 0
        ? `Still not producing: ${obs
            .filter((o) => o.result === "not_yet")
            .map((o) => o.targetText)
            .join(", ")}`
        : promptedCount > 0
          ? `Needs a model for: ${obs
              .filter((o) => o.result === "prompted")
              .map((o) => o.targetText)
              .join(", ")}`
          : skill.weakness;

    const nextTarget =
      notYetCount > 0
        ? obs.find((o) => o.result === "not_yet")!.targetText
        : promptedCount > 0
          ? `Move “${obs.find((o) => o.result === "prompted")!.targetText}” to independent`
          : skill.nextTarget;

    const evidenceBits = obs.map((o) => {
      const label =
        o.result === "independent"
          ? "independent"
          : o.result === "prompted"
            ? "with prompt"
            : "not yet";
      return `${o.targetText} (${label})`;
    });

    return {
      ...skill,
      level,
      trend,
      examples,
      weakness,
      nextTarget,
      evidence: `From today’s clothes lesson: ${evidenceBits.join("; ")}.`,
    };
  });

  const independentTexts = lesson.observations
    .filter((o) => o.result === "independent")
    .map((o) => o.targetText);
  const promptedTexts = lesson.observations
    .filter((o) => o.result === "prompted")
    .map((o) => o.targetText);
  const notYetTexts = lesson.observations
    .filter((o) => o.result === "not_yet")
    .map((o) => o.targetText);

  const monthly = {
    ...snapshot.monthly,
    improved: unique([
      ...independentTexts.map((t) => `Independent use of “${t}”`),
      ...snapshot.monthly.improved,
    ]).slice(0, 5),
    stable: unique([
      ...promptedTexts.map((t) => `“${t}” emerging with support`),
      ...snapshot.monthly.stable,
    ]).slice(0, 5),
    needsAttention: unique([
      ...notYetTexts.map((t) => `Needs teaching: “${t}”`),
      ...snapshot.monthly.needsAttention,
    ]).slice(0, 5),
    newWordsPhrases: unique([
      ...independentTexts,
      ...promptedTexts,
      ...snapshot.monthly.newWordsPhrases,
    ]).slice(0, 10),
    nextMonthFocus: unique([
      ...lesson.nextTargets,
      ...snapshot.monthly.nextMonthFocus,
    ]).slice(0, 4),
  };

  return {
    ...snapshot,
    skills,
    monthly,
  };
}

function unique(items: string[]): string[] {
  return items.filter((v, i, arr) => arr.indexOf(v) === i);
}

export function formatLevel(level: SkillLevel): string {
  switch (level) {
    case "emerging":
      return "Emerging";
    case "developing":
      return "Developing";
    case "consolidating":
      return "Consolidating";
    case "confident":
      return "Confident";
  }
}

export function formatTrend(trend: Trend): string {
  switch (trend) {
    case "improving":
      return "Improving";
    case "stable":
      return "Stable";
    case "needs_attention":
      return "Needs attention";
  }
}
