import type {
  AppState,
  Child,
  CompletedLesson,
  LanguageSkill,
  LessonPackage,
  LessonTemplate,
  ProgressSnapshot,
  ScheduledLesson,
  Teacher,
} from "./types";

export const SKILL_ORDER = [
  "receptive_vocabulary",
  "active_vocabulary",
  "sentence_complexity",
  "grammar",
  "pronunciation",
  "spontaneous_speech",
  "engagement",
] as const;

export const DEMO_TEACHER_ID = "teacher-anna";
export const LEARNER_TZ = "America/New_York";
export const TEACHER_TZ = "Europe/Moscow";

export const teachers: Teacher[] = [
  {
    id: DEMO_TEACHER_ID,
    name: "Anna",
    timezone: TEACHER_TZ,
    ratePerLesson: 15,
    earningsStatus: "pending",
  },
];

export const children: Child[] = [
  {
    id: "lana",
    name: "Lana",
    age: 3,
    dominantLanguage: "English",
    bilingualEnvironment: "Russian at home / English-dominant daycare & community",
    russianLevel: "Emerging speaker",
    lessonFrequency: "Tue & Thu · 4:00 PM ET · 20 min",
    currentGoal: "Name clothes + colors and use “Я надеваю…”",
    avatarColor: "#3D8B7A",
    strengths: [
      "Eager engagement in movement games",
      "Strong receptive understanding of familiar routines",
      "Clear imitation of short Russian phrases",
    ],
    attentionAreas: [
      "Active color + clothing vocabulary under pressure",
      "Gender agreement (красный / красная)",
      "Spontaneous full phrases without English mixing",
    ],
    progressHighlights: [
      "Now recognizes 8+ clothing words receptively",
      "Uses “Где…?” with support in play",
      "Stays focused for full 20-minute lesson",
    ],
    teacherId: DEMO_TEACHER_ID,
    timezone: LEARNER_TZ,
    isDemoFocus: true,
  },
  {
    id: "misha",
    name: "Misha",
    age: 5,
    dominantLanguage: "Russian–English balanced",
    bilingualEnvironment: "Russian with grandparents / English school",
    russianLevel: "Developing conversational",
    lessonFrequency: "Wed · 5:00 PM ET · 20 min",
    currentGoal: "Tell a short 3-sentence story about a past event",
    avatarColor: "#4A6FA5",
    strengths: [
      "Wide receptive vocabulary",
      "Confident pronunciation of multi-syllable words",
      "Enjoys story retell tasks",
    ],
    attentionAreas: [
      "Past-tense verb forms",
      "Keeping Russian when excited",
    ],
    progressHighlights: [
      "Retells familiar stories with 2 connected sentences",
      "Self-corrects gender on common adjectives",
    ],
    teacherId: DEMO_TEACHER_ID,
    timezone: LEARNER_TZ,
  },
  {
    id: "sofia",
    name: "Sofia",
    age: 4,
    dominantLanguage: "English",
    bilingualEnvironment: "One Russian-speaking parent / English at preschool",
    russianLevel: "Early producing",
    lessonFrequency: "Tue & Thu · 6:30 PM ET · 20 min",
    currentGoal: "Ask and answer “Что это?” with full noun phrases",
    avatarColor: "#C47A5A",
    strengths: [
      "High engagement with songs and puppets",
      "Fast mapping of new nouns",
    ],
    attentionAreas: [
      "Sentence starters beyond single words",
      "Soft Russian consonants (ль, нь)",
    ],
    progressHighlights: [
      "Produces animal names independently",
      "Joins choral responses without prompting",
    ],
    teacherId: DEMO_TEACHER_ID,
    timezone: LEARNER_TZ,
  },
];

const ZOOM_LANA = {
  url: "https://zoom.us/j/81234567890",
  meetingId: "812 3456 7890",
  passcode: "lado",
};

const ZOOM_MISHA = {
  url: "https://zoom.us/j/81234567891",
  meetingId: "812 3456 7891",
};

const ZOOM_SOFIA = {
  url: "https://zoom.us/j/81234567892",
  meetingId: "812 3456 7892",
};

/** Build UTC ISO from ET wall-clock (demo seed; EDT = UTC-4 in August). */
function et(date: string, hour: number, minute = 0) {
  const h = String(hour + 4).padStart(2, "0");
  const m = String(minute).padStart(2, "0");
  return `${date}T${h}:${m}:00.000Z`;
}

export const packages: LessonPackage[] = [
  {
    id: "pkg-lana",
    childId: "lana",
    purchasedAt: "2026-07-01",
    priceUsd: 160,
    lessonsPurchased: 8,
    lessonsCompleted: 3,
    lessonsCancelled: 0,
    lessonsNoShow: 0,
    lessonsRescheduled: 1,
    paymentStatus: "paid",
    nextPaymentDue: "2026-09-01",
  },
  {
    id: "pkg-misha",
    childId: "misha",
    purchasedAt: "2026-07-15",
    priceUsd: 160,
    lessonsPurchased: 8,
    lessonsCompleted: 1,
    lessonsCancelled: 0,
    lessonsNoShow: 0,
    lessonsRescheduled: 0,
    paymentStatus: "paid",
  },
  {
    id: "pkg-sofia",
    childId: "sofia",
    purchasedAt: "2026-08-01",
    priceUsd: 160,
    lessonsPurchased: 8,
    lessonsCompleted: 1,
    lessonsCancelled: 0,
    lessonsNoShow: 0,
    lessonsRescheduled: 0,
    paymentStatus: "due",
    nextPaymentDue: "2026-08-25",
  },
];

export function buildSchedule(): ScheduledLesson[] {
  return [
    // Today Fri Aug 21, 2026 — teacher Today view
    {
      id: "sch-lana-0821",
      childId: "lana",
      teacherId: DEMO_TEACHER_ID,
      startsAt: et("2026-08-21", 16, 0),
      durationMin: 20,
      status: "upcoming",
      topic: "Clothes and colors",
      zoom: ZOOM_LANA,
      seriesId: "series-lana-tt",
      eligible: true,
    },
    {
      id: "sch-misha-0821",
      childId: "misha",
      teacherId: DEMO_TEACHER_ID,
      startsAt: et("2026-08-21", 17, 0),
      durationMin: 20,
      status: "upcoming",
      topic: "Weekend story",
      zoom: ZOOM_MISHA,
      eligible: true,
    },
    {
      id: "sch-sofia-0821",
      childId: "sofia",
      teacherId: DEMO_TEACHER_ID,
      startsAt: et("2026-08-21", 18, 30),
      durationMin: 20,
      status: "upcoming",
      topic: "Что это?",
      zoom: ZOOM_SOFIA,
      seriesId: "series-sofia-tt",
      eligible: true,
    },
    // Rest of week
    {
      id: "sch-lana-0825",
      childId: "lana",
      teacherId: DEMO_TEACHER_ID,
      startsAt: et("2026-08-25", 16, 0),
      durationMin: 20,
      status: "upcoming",
      topic: "Clothes and colors",
      zoom: ZOOM_LANA,
      seriesId: "series-lana-tt",
      eligible: true,
    },
    {
      id: "sch-sofia-0825",
      childId: "sofia",
      teacherId: DEMO_TEACHER_ID,
      startsAt: et("2026-08-25", 18, 30),
      durationMin: 20,
      status: "upcoming",
      topic: "Animals",
      zoom: ZOOM_SOFIA,
      seriesId: "series-sofia-tt",
      eligible: true,
    },
    {
      id: "sch-misha-0826",
      childId: "misha",
      teacherId: DEMO_TEACHER_ID,
      startsAt: et("2026-08-26", 17, 0),
      durationMin: 20,
      status: "upcoming",
      topic: "Past tense play",
      zoom: ZOOM_MISHA,
      eligible: true,
    },
    {
      id: "sch-lana-0827",
      childId: "lana",
      teacherId: DEMO_TEACHER_ID,
      startsAt: et("2026-08-27", 16, 0),
      durationMin: 20,
      status: "upcoming",
      topic: "Clothes review",
      zoom: ZOOM_LANA,
      seriesId: "series-lana-tt",
      eligible: true,
    },
    // Past completed sample
    {
      id: "sch-lana-0819",
      childId: "lana",
      teacherId: DEMO_TEACHER_ID,
      startsAt: et("2026-08-19", 16, 0),
      durationMin: 20,
      status: "completed",
      topic: "Animals at home",
      zoom: ZOOM_LANA,
      seriesId: "series-lana-tt",
      eligible: true,
    },
  ];
}

export const clothesLesson: LessonTemplate = {
  id: "lesson-clothes-colors",
  topic: "Clothes and colors",
  theme: "Одежда и цвета",
  objective:
    "Lana names clothing items with colors and attempts “Я надеваю…” / “Где мои…?”",
  targets: [
    {
      id: "t-red-shirt",
      text: "красная футболка",
      type: "phrase",
      skill: "active_vocabulary",
      prompts: ["Какого цвета футболка?", "Это красная футболка?"],
    },
    {
      id: "t-blue-socks",
      text: "синие носки",
      type: "phrase",
      skill: "active_vocabulary",
      prompts: ["Где синие носки?", "Какого цвета носки?"],
    },
    {
      id: "t-yellow-hat",
      text: "жёлтая шапка",
      type: "phrase",
      skill: "active_vocabulary",
      prompts: ["Покажи жёлтую шапку", "Какого цвета шапка?"],
    },
    {
      id: "t-i-put-on",
      text: "Я надеваю…",
      type: "phrase",
      skill: "sentence_complexity",
      prompts: ["Что ты надеваешь?", "Скажи: Я надеваю…"],
    },
    {
      id: "t-where-socks",
      text: "Где мои носки?",
      type: "phrase",
      skill: "spontaneous_speech",
      prompts: ["Спроси меня: Где мои носки?", "Потерялись носки — что скажем?"],
    },
    {
      id: "t-what-color",
      text: "Какого цвета…?",
      type: "phrase",
      skill: "grammar",
      prompts: ["Спроси: Какого цвета футболка?", "Какого цвета шапка?"],
    },
  ],
  activities: [
    {
      id: "a-warmup",
      name: "Warm-up",
      durationMin: 3,
      kind: "warmup",
      instructions:
        "Greet in Russian. Point to your own clothes and model: “У меня синяя кофта.” Invite Lana to point and echo colors she knows.",
      observe: "Does she respond to Russian greetings and color words receptively?",
      prompts: ["Привет!", "Как дела?", "Какого цвета твоя кофта?"],
      targetIds: ["t-what-color"],
    },
    {
      id: "a-vocab",
      name: "Vocabulary",
      durationMin: 4,
      kind: "vocab",
      instructions:
        "Present flashcards or real clothes: футболка, носки, шапка. Pair each with a color. Model full phrases slowly.",
      observe: "Independent naming vs. imitation; gender agreement on adjectives.",
      prompts: [
        "Это красная футболка.",
        "Повтори: синие носки.",
        "Где жёлтая шапка?",
      ],
      targetIds: ["t-red-shirt", "t-blue-socks", "t-yellow-hat"],
    },
    {
      id: "a-movement",
      name: "Movement activity",
      durationMin: 3,
      kind: "movement",
      instructions:
        "“Одевайся!” game: place clothes around the room. Call out an item+color; Lana runs, finds it, and brings it back.",
      observe: "Receptive speed and whether she labels the item when returning.",
      prompts: ["Найди синие носки!", "Принеси жёлтую шапку!", "Бегом!"],
      targetIds: ["t-blue-socks", "t-yellow-hat"],
    },
    {
      id: "a-speaking",
      name: "Speaking task",
      durationMin: 4,
      kind: "speaking",
      instructions:
        "Dress a soft toy together. Teacher models “Я надеваю…” then fades support so Lana tries the frame with each item.",
      observe: "Can she keep the frame “Я надеваю…” or only name the noun?",
      prompts: ["Я надеваю красную футболку.", "Что ты надеваешь?", "Скажи полностью."],
      targetIds: ["t-i-put-on", "t-red-shirt"],
    },
    {
      id: "a-game",
      name: "Interactive game",
      durationMin: 3,
      kind: "game",
      instructions:
        "Hide-and-seek with socks. Lana asks “Где мои носки?” to get a clue. Swap roles once.",
      observe: "Initiation of the question without English; clarity of pronunciation.",
      prompts: ["Где мои носки?", "Спроси громко!", "Они под стулом?"],
      targetIds: ["t-where-socks"],
    },
    {
      id: "a-story",
      name: "Story / review",
      durationMin: 3,
      kind: "review",
      instructions:
        "Quick picture walk: morning routine. Review all targets; celebrate 1–2 independent wins; preview home practice.",
      observe: "Which phrases stick without prompt at the end of the lesson?",
      prompts: [
        "Какого цвета футболка?",
        "Что ты надеваешь?",
        "Где твои носки?",
      ],
      targetIds: [
        "t-red-shirt",
        "t-blue-socks",
        "t-yellow-hat",
        "t-i-put-on",
        "t-where-socks",
        "t-what-color",
      ],
    },
  ],
};

function lanaSkills(): LanguageSkill[] {
  return [
    {
      id: "receptive_vocabulary",
      label: "Receptive vocabulary",
      shortLabel: "Receptive",
      level: "consolidating",
      trend: "improving",
      evidence:
        "In the last 3 lessons she reliably points to clothing items and colors when asked in Russian.",
      examples: ["футболка", "носки", "шапка", "красный", "синий", "жёлтый"],
      weakness: "Less familiar household nouns still need a gesture cue.",
      nextTarget: "Follow 2-step dressing instructions without English support.",
    },
    {
      id: "active_vocabulary",
      label: "Active vocabulary",
      shortLabel: "Active vocab",
      level: "developing",
      trend: "improving",
      evidence:
        "She names 4–5 clothing words with a prompt; “красная футболка” appeared independently once last week.",
      examples: ["футболка", "шапка", "красная футболка"],
      weakness: "Color + noun combinations often drop the color.",
      nextTarget: "Produce color + clothing pairs (красная футболка, синие носки).",
    },
    {
      id: "sentence_complexity",
      label: "Sentence complexity",
      shortLabel: "Sentences",
      level: "emerging",
      trend: "stable",
      evidence:
        "Most responses are single words or 2-word mixes; “Я надеваю…” needs modeling.",
      examples: ["Это шапка", "Синие носки"],
      weakness: "Subject + verb frames collapse to the noun alone.",
      nextTarget: "Use “Я надеваю…” with one clothing item.",
    },
    {
      id: "grammar",
      label: "Grammar",
      shortLabel: "Grammar",
      level: "emerging",
      trend: "needs_attention",
      evidence:
        "Gender agreement is inconsistent: often “красный шапка” after English interference.",
      examples: ["красная…", "синие носки (imitated)"],
      weakness: "Adjective endings for feminine nouns.",
      nextTarget: "Stable “Какого цвета…?” and matching feminine endings in set phrases.",
    },
    {
      id: "pronunciation",
      label: "Pronunciation",
      shortLabel: "Pronunciation",
      level: "developing",
      trend: "stable",
      evidence:
        "Vowels are clear; soft consonants in “жёлтая” and “надеваю” are approximate but intelligible.",
      examples: ["шапка", "носки", "футболка"],
      weakness: "ж / ш contrast and soft ль in longer phrases.",
      nextTarget: "Clearer “жёлтая” in isolation, then in phrase.",
    },
    {
      id: "spontaneous_speech",
      label: "Spontaneous speech",
      shortLabel: "Spontaneous",
      level: "emerging",
      trend: "needs_attention",
      evidence:
        "Rarely initiates Russian; switches to English when excited during games.",
      examples: ["Где…? (with prompt)", "Дай шапку"],
      weakness: "Initiating questions without teacher modeling.",
      nextTarget: "Ask “Где мои носки?” in a hide-and-seek game.",
    },
    {
      id: "engagement",
      label: "Engagement",
      shortLabel: "Engagement",
      level: "confident",
      trend: "improving",
      evidence:
        "Completes full 20-minute sessions; movement blocks sustain attention best.",
      examples: ["Runs to find items", "Joins choral repeat", "Smiles during puppet play"],
      weakness: "Quiet table work after minute 15 needs a movement reset.",
      nextTarget: "Sustain seated speaking task for a full 4-minute block.",
    },
  ];
}

function mishaSkills(): LanguageSkill[] {
  return [
    {
      id: "receptive_vocabulary",
      label: "Receptive vocabulary",
      shortLabel: "Receptive",
      level: "confident",
      trend: "stable",
      evidence: "Follows multi-step story instructions in Russian.",
      examples: ["вчера", "парк", "друзья"],
      weakness: "Rare idioms still need context.",
      nextTarget: "Understand time phrases (утром, вечером) in stories.",
    },
    {
      id: "active_vocabulary",
      label: "Active vocabulary",
      shortLabel: "Active vocab",
      level: "consolidating",
      trend: "improving",
      evidence: "Retrieves school and hobby words with little support.",
      examples: ["футбол", "учитель", "рисунок"],
      weakness: "Emotion vocabulary is thinner.",
      nextTarget: "Name 4 feeling words in context.",
    },
    {
      id: "sentence_complexity",
      label: "Sentence complexity",
      shortLabel: "Sentences",
      level: "developing",
      trend: "improving",
      evidence: "Connects 2 clauses with “и / потом”.",
      examples: ["Мы играли, потом пошли домой"],
      weakness: "Past narrative still short.",
      nextTarget: "Produce a 3-sentence past event retell.",
    },
    {
      id: "grammar",
      label: "Grammar",
      shortLabel: "Grammar",
      level: "developing",
      trend: "needs_attention",
      evidence: "Past tense verbs are mixed with present under pressure.",
      examples: ["я играл", "мы ходили"],
      weakness: "Consistent past-tense marking.",
      nextTarget: "Stabilize -л / -ла forms in personal stories.",
    },
    {
      id: "pronunciation",
      label: "Pronunciation",
      shortLabel: "Pronunciation",
      level: "confident",
      trend: "stable",
      evidence: "Clear articulation even in longer sentences.",
      examples: ["рассказал", "библиотека"],
      weakness: "Occasional English rhythm on long phrases.",
      nextTarget: "Maintain Russian stress patterns in storytelling.",
    },
    {
      id: "spontaneous_speech",
      label: "Spontaneous speech",
      shortLabel: "Spontaneous",
      level: "consolidating",
      trend: "improving",
      evidence: "Initiates comments about drawings and games.",
      examples: ["Смотри, что я сделал!"],
      weakness: "Falls to English when peers are present.",
      nextTarget: "Keep Russian for a full peer role-play.",
    },
    {
      id: "engagement",
      label: "Engagement",
      shortLabel: "Engagement",
      level: "confident",
      trend: "stable",
      evidence: "Self-starts tasks; enjoys challenge.",
      examples: ["Asks for harder stories"],
      weakness: "Can rush endings.",
      nextTarget: "Slow down for self-check on verb endings.",
    },
  ];
}

function sofiaSkills(): LanguageSkill[] {
  return [
    {
      id: "receptive_vocabulary",
      label: "Receptive vocabulary",
      shortLabel: "Receptive",
      level: "consolidating",
      trend: "improving",
      evidence: "Understands animal and food sets in songs.",
      examples: ["мишка", "яблоко", "молоко"],
      weakness: "New verbs need extra demonstrations.",
      nextTarget: "Map 6 new action verbs receptively.",
    },
    {
      id: "active_vocabulary",
      label: "Active vocabulary",
      shortLabel: "Active vocab",
      level: "developing",
      trend: "improving",
      evidence: "Names animals independently after songs.",
      examples: ["кошка", "собака", "птичка"],
      weakness: "Noun phrases without “это”.",
      nextTarget: "Answer “Что это?” with full noun phrases.",
    },
    {
      id: "sentence_complexity",
      label: "Sentence complexity",
      shortLabel: "Sentences",
      level: "emerging",
      trend: "stable",
      evidence: "Mostly single nouns; growing two-word combos.",
      examples: ["Это мишка"],
      weakness: "Limited verb use.",
      nextTarget: "Add “вижу / хочу” + noun.",
    },
    {
      id: "grammar",
      label: "Grammar",
      shortLabel: "Grammar",
      level: "emerging",
      trend: "stable",
      evidence: "Uses set phrases accurately when sung.",
      examples: ["Что это?"],
      weakness: "Plural forms.",
      nextTarget: "Contrast one vs. many with toys.",
    },
    {
      id: "pronunciation",
      label: "Pronunciation",
      shortLabel: "Pronunciation",
      level: "developing",
      trend: "needs_attention",
      evidence: "Soft consonants are still hard; “ль” approximates “l”.",
      examples: ["мишка", "яблоко"],
      weakness: "Soft ль / нь.",
      nextTarget: "Practice soft ль in “люблю / олень”.",
    },
    {
      id: "spontaneous_speech",
      label: "Spontaneous speech",
      shortLabel: "Spontaneous",
      level: "emerging",
      trend: "improving",
      evidence: "Starts to call puppet names in Russian mid-play.",
      examples: ["Мишка!"],
      weakness: "Requests still in English.",
      nextTarget: "Request toys with “Дай …” in Russian.",
    },
    {
      id: "engagement",
      label: "Engagement",
      shortLabel: "Engagement",
      level: "confident",
      trend: "improving",
      evidence: "High energy with puppets and music.",
      examples: ["Joins every chorus"],
      weakness: "Transitions between activities need songs.",
      nextTarget: "Move between blocks with a 10-second routine.",
    },
  ];
}

const lanaHistory: CompletedLesson[] = [
  {
    id: "lana-l1",
    childId: "lana",
    templateId: "lesson-animals",
    topic: "Animals at home",
    objective: "Name 4 animals and answer “Кто это?”",
    date: "2026-08-06",
    durationMin: 20,
    observationSummary:
      "Strong receptive animal set; produced “мишка” and “кошка” independently; “Кто это?” needed a model.",
    progressGained: "Active animal nouns +1 independent pair",
    nextTarget: "Use “Это + animal” without prompt",
    wentWell: ["High engagement with puppets", "Clear “мишка”"],
    improved: ["Active vocabulary for animals"],
    needsWork: ["Full “Это…” frame"],
    nextTargets: ["Это кошка", "Это собака"],
    parentSummary:
      "Lana enjoyed animal puppets and can name bear and cat in Russian. Practice “Это …” at home with toys.",
    homePractice: {
      title: "Toy parade",
      instructions: "Line up 3 toys. Ask and wait.",
      prompts: ["Кто это?", "Это мишка?", "Скажи: Это кошка."],
    },
    observations: [
      {
        id: "o1",
        childId: "lana",
        lessonId: "lana-l1",
        skill: "active_vocabulary",
        targetId: "animal-bear",
        targetText: "мишка",
        result: "independent",
        date: "2026-08-06",
      },
      {
        id: "o2",
        childId: "lana",
        lessonId: "lana-l1",
        skill: "sentence_complexity",
        targetId: "animal-frame",
        targetText: "Это кошка",
        result: "prompted",
        date: "2026-08-06",
      },
    ],
  },
  {
    id: "lana-l2",
    childId: "lana",
    templateId: "lesson-body",
    topic: "Body parts & washing",
    objective: "Point and name face parts; try “Мою руки”",
    date: "2026-08-09",
    durationMin: 20,
    observationSummary:
      "Receptive face parts solid. “Нос / глаза” independent. “Мою руки” only with full prompt.",
    progressGained: "Receptive body vocabulary consolidating",
    nextTarget: "Produce “Мою руки” in routine play",
    wentWell: ["Loved the washing song", "Independent “нос”"],
    improved: ["Receptive vocabulary", "Engagement"],
    needsWork: ["Routine verb phrases"],
    nextTargets: ["Мою руки", "Где глаза?"],
    parentSummary:
      "Lana points to nose and eyes when asked in Russian. Try the hand-washing phrase during real routines.",
    homePractice: {
      title: "Wash time Russian",
      instructions: "At the sink, model once, then wait.",
      prompts: ["Где руки?", "Мою руки", "Где нос?"],
    },
    observations: [
      {
        id: "o3",
        childId: "lana",
        lessonId: "lana-l2",
        skill: "receptive_vocabulary",
        targetId: "nose",
        targetText: "нос",
        result: "independent",
        date: "2026-08-09",
      },
      {
        id: "o4",
        childId: "lana",
        lessonId: "lana-l2",
        skill: "sentence_complexity",
        targetId: "wash-hands",
        targetText: "Мою руки",
        result: "prompted",
        date: "2026-08-09",
      },
    ],
  },
  {
    id: "lana-l3",
    childId: "lana",
    templateId: "lesson-colors",
    topic: "Colors in play",
    objective: "Sort toys by color; name красный / синий / жёлтый",
    date: "2026-08-13",
    durationMin: 20,
    observationSummary:
      "Color sorting accurate. Named “красный” and “синий” with light prompt; “жёлтый” still shaky.",
    progressGained: "Color labels moving from receptive to active",
    nextTarget: "Pair colors with clothing nouns",
    wentWell: ["Sorting game focus", "“синий” nearly independent"],
    improved: ["Active vocabulary — colors"],
    needsWork: ["жёлтый", "Color + noun phrases"],
    nextTargets: ["красная футболка", "синие носки"],
    parentSummary:
      "Lana sorts by color well and is starting to say red and blue in Russian. Next we connect colors to clothes.",
    homePractice: {
      title: "Color hunt",
      instructions: "Find 3 objects around the room.",
      prompts: ["Где красный?", "Какого цвета?", "Это синий?"],
    },
    observations: [
      {
        id: "o5",
        childId: "lana",
        lessonId: "lana-l3",
        skill: "active_vocabulary",
        targetId: "red",
        targetText: "красный",
        result: "prompted",
        date: "2026-08-13",
      },
      {
        id: "o6",
        childId: "lana",
        lessonId: "lana-l3",
        skill: "active_vocabulary",
        targetId: "blue",
        targetText: "синий",
        result: "independent",
        date: "2026-08-13",
      },
      {
        id: "o7",
        childId: "lana",
        lessonId: "lana-l3",
        skill: "grammar",
        targetId: "what-color",
        targetText: "Какого цвета?",
        result: "not_yet",
        date: "2026-08-13",
      },
    ],
  },
  {
    id: "lana-l4",
    childId: "lana",
    templateId: "lesson-clothes-intro",
    topic: "Clothes intro",
    objective: "Receptively identify футболка / носки / шапка",
    date: "2026-08-16",
    durationMin: 20,
    observationSummary:
      "Receptive clothing set strong. Produced “шапка” independently; “футболка” prompted; spontaneous questions not yet.",
    progressGained: "Clothing receptive set ready for production focus",
    nextTarget: "Color + clothing production + “Я надеваю…”",
    wentWell: ["Movement find-it game", "Independent “шапка”"],
    improved: ["Receptive vocabulary — clothes"],
    needsWork: ["Spontaneous “Где…?”", "Gender agreement"],
    nextTargets: ["красная футболка", "Я надеваю…", "Где мои носки?"],
    parentSummary:
      "Lana understands shirt, socks, and hat in Russian. Today’s follow-up lesson will add colors and dressing phrases.",
    homePractice: {
      title: "Dressing names",
      instructions: "While getting dressed, pause and point.",
      prompts: ["Где футболка?", "Это шапка?", "Где носки?"],
    },
    observations: [
      {
        id: "o8",
        childId: "lana",
        lessonId: "lana-l4",
        skill: "receptive_vocabulary",
        targetId: "shirt",
        targetText: "футболка",
        result: "independent",
        date: "2026-08-16",
      },
      {
        id: "o9",
        childId: "lana",
        lessonId: "lana-l4",
        skill: "active_vocabulary",
        targetId: "hat",
        targetText: "шапка",
        result: "independent",
        date: "2026-08-16",
      },
      {
        id: "o10",
        childId: "lana",
        lessonId: "lana-l4",
        skill: "spontaneous_speech",
        targetId: "where",
        targetText: "Где…?",
        result: "not_yet",
        date: "2026-08-16",
      },
    ],
  },
];

const mishaHistory: CompletedLesson[] = [
  {
    id: "misha-l1",
    childId: "misha",
    templateId: "lesson-weekend",
    topic: "Weekend story",
    objective: "Retell a weekend event in 2–3 sentences",
    date: "2026-08-12",
    durationMin: 20,
    observationSummary:
      "Produced two connected past sentences; verb endings still slip mid-story.",
    progressGained: "Sentence complexity improving in narratives",
    nextTarget: "Stabilize past-tense verbs in a 3-sentence retell",
    wentWell: ["Eager storytelling", "Good sequencing with “потом”"],
    improved: ["Sentence complexity"],
    needsWork: ["Past-tense consistency"],
    nextTargets: ["я играл", "мы ходили в парк"],
    parentSummary:
      "Misha told a short weekend story in Russian. Ask him to retell one thing from today using “потом”.",
    homePractice: {
      title: "One memory",
      instructions: "After dinner, ask for one event from the day.",
      prompts: ["Что было сегодня?", "А потом?", "Кто с тобой был?"],
    },
    observations: [],
  },
];

const sofiaHistory: CompletedLesson[] = [
  {
    id: "sofia-l1",
    childId: "sofia",
    templateId: "lesson-animals-s",
    topic: "Farm animals song",
    objective: "Answer “Что это?” with animal names",
    date: "2026-08-14",
    durationMin: 20,
    observationSummary:
      "Named cat and dog independently in song; “Что это?” responses often noun-only.",
    progressGained: "Active animal nouns strengthening",
    nextTarget: "Full “Это + noun” answers",
    wentWell: ["Song engagement", "Independent “кошка”"],
    improved: ["Active vocabulary"],
    needsWork: ["Full phrase answers"],
    nextTargets: ["Это собака", "Это птичка"],
    parentSummary:
      "Sofia loves the animal song and can say cat and dog. Practice “Что это?” with picture books.",
    homePractice: {
      title: "Picture book point",
      instructions: "Point to 3 animals in a book.",
      prompts: ["Что это?", "Это кошка?", "Скажи: Это собака."],
    },
    observations: [],
  },
];

export function buildInitialProgress(): Record<string, ProgressSnapshot> {
  return {
    lana: {
      childId: "lana",
      monthLabel: "August 2026",
      skills: lanaSkills(),
      monthly: {
        improved: [
          "Receptive clothing and color understanding",
          "Engagement across full 20-minute lessons",
          "Active naming of a few high-frequency nouns (шапка, синий)",
        ],
        stable: [
          "Pronunciation intelligibility",
          "Short two-word combinations",
          "Willingness to imitate models",
        ],
        needsAttention: [
          "Spontaneous question asking in Russian",
          "Gender agreement on color + noun",
          "Keeping sentence frames like “Я надеваю…”",
        ],
        newWordsPhrases: [
          "футболка",
          "носки",
          "шапка",
          "синий",
          "красный",
          "Где…?",
        ],
        nextMonthFocus: [
          "Color + clothing phrases",
          "Dressing sentence frame “Я надеваю…”",
          "Initiating “Где мои…?” in play",
        ],
      },
    },
    misha: {
      childId: "misha",
      monthLabel: "August 2026",
      skills: mishaSkills(),
      monthly: {
        improved: ["Narrative sentence linking", "Spontaneous comments"],
        stable: ["Pronunciation", "Receptive vocabulary"],
        needsAttention: ["Past-tense verb accuracy"],
        newWordsPhrases: ["потом", "вчера", "мы ходили"],
        nextMonthFocus: ["3-sentence past retells", "Self-check verb endings"],
      },
    },
    sofia: {
      childId: "sofia",
      monthLabel: "August 2026",
      skills: sofiaSkills(),
      monthly: {
        improved: ["Animal active vocabulary", "Song engagement"],
        stable: ["Receptive food/animal sets"],
        needsAttention: ["Soft consonant clarity", "Full phrase answers"],
        newWordsPhrases: ["кошка", "собака", "Что это?"],
        nextMonthFocus: ["Это + noun", "Request phrase “Дай …”"],
      },
    },
  };
}

export function createInitialState(): AppState {
  return {
    role: "teacher",
    teachers,
    children,
    lessonsByChild: {
      lana: lanaHistory,
      misha: mishaHistory,
      sofia: sofiaHistory,
    },
    progressByChild: buildInitialProgress(),
    schedule: buildSchedule(),
    packages,
  };
}

export const DEMO_LESSON = clothesLesson;
