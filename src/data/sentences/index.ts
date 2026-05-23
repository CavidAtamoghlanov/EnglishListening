import type { SentenceLevel, SentencePracticeMode, SentenceItem } from "../../features/sentences/types";
import repeatA1 from "./repeat/a1.json";
import repeatA2 from "./repeat/a2.json";
import repeatB1 from "./repeat/b1.json";
import repeatB2 from "./repeat/b2.json";
import translateA1 from "./translate/a1.json";
import translateA2 from "./translate/a2.json";
import translateB1 from "./translate/b1.json";
import translateB2 from "./translate/b2.json";

const REPEAT_BY_LEVEL: Record<SentenceLevel, SentenceItem[]> = {
  A1: repeatA1 as SentenceItem[],
  A2: repeatA2 as SentenceItem[],
  B1: repeatB1 as SentenceItem[],
  B2: repeatB2 as SentenceItem[],
};

const TRANSLATE_BY_LEVEL: Record<SentenceLevel, SentenceItem[]> = {
  A1: translateA1 as SentenceItem[],
  A2: translateA2 as SentenceItem[],
  B1: translateB1 as SentenceItem[],
  B2: translateB2 as SentenceItem[],
};

export const SENTENCE_DATA_BY_MODE: Record<
  SentencePracticeMode,
  Record<SentenceLevel, SentenceItem[]>
> = {
  repeat: REPEAT_BY_LEVEL,
  translate: TRANSLATE_BY_LEVEL,
};
