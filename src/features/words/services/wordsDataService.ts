import { CEFR_LEVELS, type CEFRLevel } from "../../../config/levels";
import type { WordItem } from "../types";
import { WORD_DATA_BY_LEVEL } from "../../../data/words";

const wordsByLevel: Record<CEFRLevel, WordItem[]> = WORD_DATA_BY_LEVEL;

const wordById = new Map<string, WordItem>();

CEFR_LEVELS.forEach((level) => {
  wordsByLevel[level].forEach((word) => {
    wordById.set(word.id, word);
  });
});

export const wordsDataService = {
  getLevels(): CEFRLevel[] {
    return [...CEFR_LEVELS];
  },

  getWordsByLevel(level: CEFRLevel): WordItem[] {
    return wordsByLevel[level] ?? [];
  },

  getAllWords(): WordItem[] {
    return CEFR_LEVELS.flatMap((level) => wordsByLevel[level]);
  },

  getWordById(wordId: string): WordItem | null {
    return wordById.get(wordId) ?? null;
  },

  getWordsByIds(wordIds: string[]): WordItem[] {
    return wordIds
      .map((wordId) => this.getWordById(wordId))
      .filter((word): word is WordItem => Boolean(word));
  },

  getWordCount(level: CEFRLevel): number {
    return wordsByLevel[level]?.length ?? 0;
  },
};
