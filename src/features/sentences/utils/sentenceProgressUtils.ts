import { SENTENCE_LEVEL_IDS } from "../config/levels";
import type {
  SentenceLevel,
  SentenceLevelProgress,
  SentencePracticeMode,
  UserSentenceProgress,
} from "../types";

export function createEmptySentenceLevelProgress(
  mode: SentencePracticeMode,
  level: SentenceLevel,
): SentenceLevelProgress {
  return {
    level,
    mode,
    currentIndex: 0,
    currentSentenceId: null,
    completedSentenceIds: [],
    totalAttempts: 0,
    correctCount: 0,
    wrongCount: 0,
    currentStreak: 0,
    bestStreak: 0,
    sessionOrderSentenceIds: [],
    updatedAt: new Date().toISOString(),
  };
}

export function createEmptySentenceProgress(profileId: string): UserSentenceProgress {
  const levels = {
    repeat: {} as Record<SentenceLevel, SentenceLevelProgress>,
    translate: {} as Record<SentenceLevel, SentenceLevelProgress>,
  };

  for (const mode of ["repeat", "translate"] as const) {
    for (const level of SENTENCE_LEVEL_IDS) {
      levels[mode][level] = createEmptySentenceLevelProgress(mode, level);
    }
  }

  return {
    profileId,
    lastSelectedMode: null,
    lastSelectedLevel: null,
    levels,
  };
}

export function calculateSentenceProgressPercent(currentIndex: number, total: number): number {
  if (total <= 0) {
    return 0;
  }
  return Math.min(100, Math.round((currentIndex / total) * 100));
}
