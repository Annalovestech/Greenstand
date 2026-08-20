export type ObservationResult = "independent" | "prompted" | "not_yet";

export type SkillId =
  | "receptive_vocabulary"
  | "active_vocabulary"
  | "sentence_complexity"
  | "grammar"
  | "pronunciation"
  | "spontaneous_speech"
  | "engagement";

export type Trend = "improving" | "stable" | "needs_attention";

export type SkillLevel =
  | "emerging"
  | "developing"
  | "consolidating"
  | "confident";

export interface Child {
  id: string;
  name: string;
  age: number;
  dominantLanguage: string;
  bilingualEnvironment: string;
  russianLevel: string;
  lessonFrequency: string;
  currentGoal: string;
  avatarColor: string;
  strengths: string[];
  attentionAreas: string[];
  progressHighlights: string[];
  isDemoFocus?: boolean;
}

export interface LanguageSkill {
  id: SkillId;
  label: string;
  shortLabel: string;
  level: SkillLevel;
  trend: Trend;
  evidence: string;
  examples: string[];
  weakness: string;
  nextTarget: string;
}

export interface LessonTarget {
  id: string;
  text: string;
  type: "word" | "phrase";
  skill: SkillId;
  prompts: string[];
}

export interface LessonActivity {
  id: string;
  name: string;
  durationMin: number;
  instructions: string;
  observe: string;
  prompts: string[];
  targetIds: string[];
}

export interface LessonTemplate {
  id: string;
  topic: string;
  objective: string;
  theme: string;
  targets: LessonTarget[];
  activities: LessonActivity[];
}

export interface Observation {
  id: string;
  childId: string;
  lessonId: string;
  skill: SkillId;
  targetId: string;
  targetText: string;
  result: ObservationResult;
  note?: string;
  date: string;
}

export interface CompletedLesson {
  id: string;
  childId: string;
  templateId: string;
  topic: string;
  objective: string;
  date: string;
  durationMin: number;
  observationSummary: string;
  progressGained: string;
  nextTarget: string;
  wentWell: string[];
  improved: string[];
  needsWork: string[];
  nextTargets: string[];
  parentSummary: string;
  homePractice: {
    title: string;
    instructions: string;
    prompts: string[];
  };
  observations: Observation[];
}

export interface MonthlySummary {
  improved: string[];
  stable: string[];
  needsAttention: string[];
  newWordsPhrases: string[];
  nextMonthFocus: string[];
}

export interface ProgressSnapshot {
  childId: string;
  monthLabel: string;
  skills: LanguageSkill[];
  monthly: MonthlySummary;
}

export interface AppState {
  children: Child[];
  lessonsByChild: Record<string, CompletedLesson[]>;
  progressByChild: Record<string, ProgressSnapshot>;
  activeLesson?: {
    childId: string;
    templateId: string;
    startedAt: string;
    currentActivityIndex: number;
    results: Record<string, ObservationResult>;
  };
  lastCompletedLessonId?: string;
}
