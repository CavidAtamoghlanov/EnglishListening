import type { CEFRLevel } from "../../src/features/words/config/levels";
import { getLevelConfig } from "../../src/features/words/config/levels";
import type { WordItem } from "../../src/features/words/types";
import type { WordSeed } from "./types";

function unique(values: string[]): string[] {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

export function seedToWordItem(level: CEFRLevel, index: number, seed: WordSeed): WordItem {
  const prefix = getLevelConfig(level).fileKey;
  const acceptedAnswers = unique([seed.english, ...(seed.acceptedAnswers ?? [])]);

  return {
    id: `${prefix}_${String(index + 1).padStart(4, "0")}`,
    level,
    english: seed.english,
    azeri: seed.azeri,
    acceptedAnswers,
    synonyms: seed.synonyms ?? [],
    category: seed.category,
    icon: seed.icon,
    exampleEn: seed.exampleEn ?? `Use "${seed.english}" in a clear English sentence.`,
    exampleAz: seed.exampleAz ?? `"${seed.azeri}" ifadəsini ingiliscə təcrübə edin.`,
    hint: seed.hint,
  };
}

export function mergeSeeds(level: CEFRLevel, existing: WordItem[], seeds: WordSeed[]): WordItem[] {
  const byEnglish = new Map<string, WordSeed>();

  for (const word of existing) {
    byEnglish.set(word.english.trim().toLowerCase(), {
      english: word.english,
      azeri: word.azeri,
      category: word.category,
      icon: word.icon,
      synonyms: word.synonyms,
      acceptedAnswers: word.acceptedAnswers.filter(
        (answer) => answer.trim().toLowerCase() !== word.english.trim().toLowerCase(),
      ),
      exampleEn: word.exampleEn,
      exampleAz: word.exampleAz,
      hint: word.hint,
    });
  }

  for (const seed of seeds) {
    const key = seed.english.trim().toLowerCase();
    if (!byEnglish.has(key)) {
      byEnglish.set(key, seed);
    }
  }

  return [...byEnglish.values()].map((seed, index) => seedToWordItem(level, index, seed));
}
