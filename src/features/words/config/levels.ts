export const WORD_LEVELS = [
  {
    id: "A1",
    fileKey: "a1",
    title: "A1 Vocabulary",
    description: "Everyday basics for first conversations.",
    targetWordCount: 5000,
  },
  {
    id: "A2",
    fileKey: "a2",
    title: "A2 Vocabulary",
    description: "Practical words for routines, travel, and simple work.",
    targetWordCount: 5000,
  },
  {
    id: "B1",
    fileKey: "b1",
    title: "B1 Vocabulary",
    description:
      "Stronger vocabulary for travel, work, opinions, and software basics.",
    targetWordCount: 5000,
  },
  {
    id: "B2",
    fileKey: "b2",
    title: "B2 Vocabulary",
    description:
      "Professional English for backend development, .NET, meetings, and fluent travel.",
    targetWordCount: 5000,
  },
] as const;

export type CEFRLevel = (typeof WORD_LEVELS)[number]["id"];

export const CEFR_LEVELS: CEFRLevel[] = WORD_LEVELS.map((level) => level.id);

export const DEFAULT_CEFR_LEVEL: CEFRLevel = WORD_LEVELS[0].id;

/** @deprecated Use WORD_LEVELS — kept for screens that already import LEVEL_CONFIG */
export const LEVEL_CONFIG = WORD_LEVELS.map((level) => ({
  id: level.id,
  title: level.title,
  description: level.description,
  wordIdPrefix: level.fileKey,
  fileKey: level.fileKey,
  targetWordCount: level.targetWordCount,
}));

export function isCEFRLevel(value: unknown): value is CEFRLevel {
  return typeof value === "string" && CEFR_LEVELS.includes(value as CEFRLevel);
}

export function parseLevelParam(value: string | string[] | undefined): CEFRLevel | null {
  const raw = Array.isArray(value) ? value[0] : value;
  return isCEFRLevel(raw) ? raw : null;
}

export function getLevelConfig(level: CEFRLevel) {
  return WORD_LEVELS.find((item) => item.id === level) ?? WORD_LEVELS[0];
}

export function getLevelFileKey(level: CEFRLevel): string {
  return getLevelConfig(level).fileKey;
}

export function getTargetWordCount(level: CEFRLevel): number {
  return getLevelConfig(level).targetWordCount;
}
