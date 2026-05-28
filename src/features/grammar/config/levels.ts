import type { GrammarLevel } from "../types";

export const GRAMMAR_LEVELS = [
  {
    id: "A1",
    title: "A1 Grammar",
    description: "Very simple grammar for first daily sentences.",
    exerciseCount: 10,
  },
  {
    id: "A2",
    title: "A2 Grammar",
    description: "Practical grammar for routines, travel, and simple work.",
    exerciseCount: 10,
  },
  {
    id: "B1",
    title: "B1 Grammar",
    description: "Grammar for work, opinions, planning, and software basics.",
    exerciseCount: 10,
  },
  {
    id: "B2",
    title: "B2 Grammar",
    description: "Professional grammar for meetings, APIs, deployment, and fluent communication.",
    exerciseCount: 10,
  },
] satisfies ReadonlyArray<{
  id: GrammarLevel;
  title: string;
  description: string;
  exerciseCount: number;
}>;

export type GrammarLevelConfig = (typeof GRAMMAR_LEVELS)[number];

export const GRAMMAR_LEVEL_IDS: GrammarLevel[] = GRAMMAR_LEVELS.map((level) => level.id);

export function getGrammarLevelConfig(level: GrammarLevel) {
  return GRAMMAR_LEVELS.find((item) => item.id === level) ?? GRAMMAR_LEVELS[0]!;
}

export function isGrammarLevel(value: unknown): value is GrammarLevel {
  return typeof value === "string" && GRAMMAR_LEVEL_IDS.includes(value as GrammarLevel);
}
