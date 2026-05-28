import type { WritingLevel } from "../types";

export const WRITING_LEVELS = [
  {
    id: "A1",
    title: "A1 Writing",
    description: "Very simple words and first daily sentences.",
    itemCount: 10,
  },
  {
    id: "A2",
    title: "A2 Writing",
    description: "Practical writing for routines, travel, and simple work.",
    itemCount: 10,
  },
  {
    id: "B1",
    title: "B1 Writing",
    description: "Clear writing for work, travel problems, and software basics.",
    itemCount: 10,
  },
  {
    id: "B2",
    title: "B2 Writing",
    description: "Professional writing for backend work, meetings, and fluent travel.",
    itemCount: 10,
  },
] satisfies ReadonlyArray<{
  id: WritingLevel;
  title: string;
  description: string;
  itemCount: number;
}>;

export type WritingLevelConfig = (typeof WRITING_LEVELS)[number];

export const WRITING_LEVEL_IDS: WritingLevel[] = WRITING_LEVELS.map((level) => level.id);

export function getWritingLevelConfig(level: WritingLevel) {
  return WRITING_LEVELS.find((item) => item.id === level) ?? WRITING_LEVELS[0]!;
}

export function isWritingLevel(value: unknown): value is WritingLevel {
  return typeof value === "string" && WRITING_LEVEL_IDS.includes(value as WritingLevel);
}
