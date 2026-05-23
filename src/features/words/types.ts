import type { CEFRLevel } from "../progress/types";
export type { PracticeMode } from "../../config/reviewModes";

export type WordItem = {
  id: string;
  level: CEFRLevel;
  english: string;
  azeri: string;
  acceptedAnswers: string[];
  synonyms: string[];
  category: string;
  icon: string;
  imageKey?: string;
  exampleEn: string;
  exampleAz: string;
  hint?: string;
};

export type PracticeScope = CEFRLevel | "all";
