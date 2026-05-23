import type { CEFRLevel } from "../../src/features/words/config/levels";
import type { WordItem } from "../../src/features/words/types";

export type WordSeed = {
  english: string;
  azeri: string;
  category: string;
  icon: string;
  synonyms?: string[];
  acceptedAnswers?: string[];
  exampleEn?: string;
  exampleAz?: string;
  hint?: string;
};

export type { CEFRLevel, WordItem };
