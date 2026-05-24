import type { SentenceLevel } from "../types";
import { SENTENCES_PER_LEVEL } from "../constants";

export const SENTENCE_LEVELS = [
  {
    id: "A1" as const,
    title: "A1 Sentences",
    description:
      "Short and very simple sentences, usually 2-4 words. Family, daily life, simple needs, basic travel.",
    sentencesPerLevel: SENTENCES_PER_LEVEL,
  },
  {
    id: "A2" as const,
    title: "A2 Sentences",
    description:
      "Simple practical sentences, usually 3-5 words. Travel, routine, shopping, basic work, simple technology.",
    sentencesPerLevel: SENTENCES_PER_LEVEL,
  },
  {
    id: "B1" as const,
    title: "B1 Sentences",
    description:
      "Intermediate practical sentences, usually 4-6 words. Work, meetings, opinions, travel problems, software basics.",
    sentencesPerLevel: SENTENCES_PER_LEVEL,
  },
  {
    id: "B2" as const,
    title: "B2 Sentences",
    description:
      "Professional fluent sentences, usually 5-8 words. Backend, .NET, API, database, debugging, meetings, travel.",
    sentencesPerLevel: SENTENCES_PER_LEVEL,
  },
] satisfies ReadonlyArray<{
  id: SentenceLevel;
  title: string;
  description: string;
  sentencesPerLevel: number;
}>;

export const SENTENCE_LEVEL_IDS: SentenceLevel[] = SENTENCE_LEVELS.map((level) => level.id);

export function getSentenceLevelConfig(level: SentenceLevel) {
  return SENTENCE_LEVELS.find((item) => item.id === level) ?? SENTENCE_LEVELS[0];
}

export function isSentenceLevel(value: unknown): value is SentenceLevel {
  return typeof value === "string" && SENTENCE_LEVEL_IDS.includes(value as SentenceLevel);
}
