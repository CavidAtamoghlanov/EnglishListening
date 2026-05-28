import { GRAMMAR_LEVEL_IDS } from "../config/levels";
import type {
  GrammarExerciseProgress,
  GrammarLevel,
  GrammarPracticeMode,
  UserGrammarProgress,
} from "../types";

export const GRAMMAR_PRACTICE_MODES: GrammarPracticeMode[] = ["translate-write", "fix-complete"];

export function createEmptyGrammarLevelProgress(
  mode: GrammarPracticeMode,
  level: GrammarLevel,
): GrammarExerciseProgress {
  return {
    level,
    mode,
    currentIndex: 0,
    currentExerciseId: null,
    completedExerciseIds: [],
    totalAttempts: 0,
    correctCount: 0,
    wrongCount: 0,
    currentStreak: 0,
    bestStreak: 0,
    sessionOrderExerciseIds: [],
    updatedAt: new Date().toISOString(),
  };
}

export function createEmptyGrammarProgress(profileId: string): UserGrammarProgress {
  const levels = {
    "translate-write": {} as Record<GrammarLevel, GrammarExerciseProgress>,
    "fix-complete": {} as Record<GrammarLevel, GrammarExerciseProgress>,
  };

  for (const mode of GRAMMAR_PRACTICE_MODES) {
    for (const level of GRAMMAR_LEVEL_IDS) {
      levels[mode][level] = createEmptyGrammarLevelProgress(mode, level);
    }
  }

  return {
    profileId,
    lastSelectedMode: null,
    lastSelectedLevel: null,
    levels,
  };
}

export function calculateGrammarProgressPercent(currentIndex: number, total: number): number {
  if (total <= 0) {
    return 0;
  }
  return Math.min(100, Math.round((currentIndex / total) * 100));
}

