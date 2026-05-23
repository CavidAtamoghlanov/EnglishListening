import type { CEFRLevel } from "../../progress/types";
import type { WordItem } from "../types";

function hashSeed(seed: string): number {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function seededRandom(seed: number): () => number {
  let value = seed || 1;
  return () => {
    value = Math.imul(48271, value) % 0x7fffffff;
    return (value & 0x7fffffff) / 0x7fffffff;
  };
}

export function shuffleWords(words: WordItem[], seedText = String(Date.now())): WordItem[] {
  const shuffled = [...words];
  const random = seededRandom(hashSeed(seedText));

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    const current = shuffled[index]!;
    const next = shuffled[swapIndex]!;
    shuffled[index] = next;
    shuffled[swapIndex] = current;
  }

  return shuffled;
}

export function createStableSessionOrder(
  words: WordItem[],
  profileId: string,
  level: CEFRLevel,
): string[] {
  return shuffleWords(words, `${profileId}:${level}`).map((word) => word.id);
}

export function getNextWord<T extends { id: string }>(
  words: T[],
  currentIndex: number,
): T | null {
  return words[currentIndex + 1] ?? null;
}
