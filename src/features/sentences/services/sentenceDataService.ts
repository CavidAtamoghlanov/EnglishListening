import { SENTENCE_DATA_BY_MODE } from "../../../data/sentences";
import { SENTENCE_LEVEL_IDS } from "../config/levels";
import type { SentenceItem, SentenceLevel, SentencePracticeMode } from "../types";

const sentenceById = new Map<string, SentenceItem>();

for (const mode of ["repeat", "translate"] as const) {
  for (const level of SENTENCE_LEVEL_IDS) {
    SENTENCE_DATA_BY_MODE[mode][level].forEach((sentence) => {
      sentenceById.set(sentence.id, sentence);
    });
  }
}

export const sentenceDataService = {
  getSentencesByModeAndLevel(mode: SentencePracticeMode, level: SentenceLevel): SentenceItem[] {
    return SENTENCE_DATA_BY_MODE[mode][level] ?? [];
  },

  getSentenceCount(mode: SentencePracticeMode, level: SentenceLevel): number {
    return this.getSentencesByModeAndLevel(mode, level).length;
  },

  getSentencesByIds(ids: string[]): SentenceItem[] {
    return ids
      .map((id) => sentenceById.get(id))
      .filter((sentence): sentence is SentenceItem => Boolean(sentence));
  },

  getSentenceById(id: string): SentenceItem | null {
    return sentenceById.get(id) ?? null;
  },
};
