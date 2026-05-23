import type { SentenceItem, SentenceLevel, SentencePracticeMode } from "../types";

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

export function shuffleSentences(
  sentences: SentenceItem[],
  seedText: string,
): SentenceItem[] {
  const shuffled = [...sentences];
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

export function createStableSentenceOrder(
  sentences: SentenceItem[],
  profileId: string,
  mode: SentencePracticeMode,
  level: SentenceLevel,
): string[] {
  return shuffleSentences(sentences, `${profileId}:${mode}:${level}`).map(
    (sentence) => sentence.id,
  );
}
