import type { LearningModuleConfig } from "../types";

export const LEARNING_MODULES: LearningModuleConfig[] = [
  {
    id: "words",
    title: "Words Practice",
    shortTitle: "Words",
    description: "See Azerbaijani words and say them in English.",
    route: "/words/levels",
    activityType: "speak",
    isAvailable: true,
  },
  {
    id: "sentences",
    title: "Sentence Practice",
    shortTitle: "Sentences",
    description: "Repeat and translate useful English sentences.",
    route: "/sentences",
    activityType: "speak",
    isAvailable: true,
  },
  {
    id: "grammar",
    title: "Grammar Practice",
    shortTitle: "Grammar",
    description: "Write and fix practical English grammar.",
    route: "/grammar",
    activityType: "grammar",
    isAvailable: true,
  },
  {
    id: "writing",
    title: "Writing Practice",
    shortTitle: "Writing",
    description: "Practice writing English words and sentences.",
    route: "/writing",
    activityType: "write",
    isAvailable: true,
  },
  {
    id: "review",
    title: "Mistake Review",
    shortTitle: "Review",
    description: "Review due mistakes with spaced repetition.",
    route: "/review",
    activityType: "review",
    isAvailable: true,
  },
  {
    id: "developer-english",
    title: "Developer English",
    shortTitle: "Developer",
    description: "Practice standups, code reviews, APIs, and debugging English.",
    route: "/developer-english",
    activityType: "write",
    isAvailable: false,
  },
  {
    id: "dialogues",
    title: "Mini Dialogues",
    shortTitle: "Dialogues",
    description: "Practice real work, travel, and social conversations.",
    route: "/dialogues",
    activityType: "dialogue",
    isAvailable: false,
  },
  {
    id: "listening-stories",
    title: "Listening Stories",
    shortTitle: "Stories",
    description: "Listen to short stories and answer comprehension questions.",
    route: "/listening-stories",
    activityType: "listen",
    isAvailable: false,
  },
  {
    id: "journal",
    title: "Writing Journal",
    shortTitle: "Journal",
    description: "Write short daily English entries with local checks.",
    route: "/journal",
    activityType: "journal",
    isAvailable: false,
  },
];

export function getLearningModuleConfig(id: LearningModuleConfig["id"]) {
  return LEARNING_MODULES.find((module) => module.id === id) ?? LEARNING_MODULES[0]!;
}

export const AVAILABLE_LEARNING_MODULES = LEARNING_MODULES.filter((module) => module.isAvailable);
