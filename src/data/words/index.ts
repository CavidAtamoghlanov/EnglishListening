import type { CEFRLevel } from "../../features/words/config/levels";
import type { WordItem } from "../../features/words/types";
import a1Words from "./a1.json";
import a2Words from "./a2.json";
import b1Words from "./b1.json";
import b2Words from "./b2.json";

export const WORD_DATA_BY_LEVEL = {
  A1: a1Words as WordItem[],
  A2: a2Words as WordItem[],
  B1: b1Words as WordItem[],
  B2: b2Words as WordItem[],
} satisfies Record<CEFRLevel, WordItem[]>;
