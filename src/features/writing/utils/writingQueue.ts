import type { WritingItem, WritingLevel, WritingPracticeMode } from "../types";

function hashString(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createStableWritingOrder(
  items: WritingItem[],
  profileId: string,
  mode: WritingPracticeMode,
  level: WritingLevel,
): string[] {
  const random = mulberry32(hashString(`${profileId}:${mode}:${level}:writing`));
  const ids = items.map((item) => item.id);
  for (let index = ids.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    const current = ids[index];
    const swap = ids[swapIndex];
    if (typeof current === "undefined" || typeof swap === "undefined") {
      continue;
    }
    ids[index] = swap;
    ids[swapIndex] = current;
  }
  return ids;
}
