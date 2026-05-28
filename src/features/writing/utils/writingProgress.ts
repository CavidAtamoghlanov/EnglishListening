import { WRITING_LEVEL_IDS } from "../config/levels";
import type {
  UserWritingProgress,
  WritingLevel,
  WritingLevelProgress,
  WritingPracticeMode,
} from "../types";

export const WRITING_PRACTICE_MODES: WritingPracticeMode[] = [
  "az-to-en",
  "fix-english",
  "listen-write",
];

export function createEmptyWritingLevelProgress(
  mode: WritingPracticeMode,
  level: WritingLevel,
): WritingLevelProgress {
  return {
    level,
    mode,
    currentIndex: 0,
    currentItemId: null,
    completedItemIds: [],
    totalAttempts: 0,
    correctCount: 0,
    wrongCount: 0,
    currentStreak: 0,
    bestStreak: 0,
    sessionOrderItemIds: [],
    updatedAt: new Date().toISOString(),
  };
}

export function createEmptyWritingProgress(profileId: string): UserWritingProgress {
  const levels = {
    "az-to-en": {} as Record<WritingLevel, WritingLevelProgress>,
    "fix-english": {} as Record<WritingLevel, WritingLevelProgress>,
    "listen-write": {} as Record<WritingLevel, WritingLevelProgress>,
  };

  for (const mode of WRITING_PRACTICE_MODES) {
    for (const level of WRITING_LEVEL_IDS) {
      levels[mode][level] = createEmptyWritingLevelProgress(mode, level);
    }
  }

  return {
    profileId,
    lastSelectedMode: null,
    lastSelectedLevel: null,
    levels,
  };
}

export function calculateWritingProgressPercent(currentIndex: number, total: number): number {
  if (total <= 0) {
    return 0;
  }
  return Math.min(100, Math.round((currentIndex / total) * 100));
}
