import { daysBetween, toLocalDateKey } from "../../../utils/date";
import { CEFR_LEVELS } from "../../../config/levels";
import type { CEFRLevel, LevelProgress, UserProgress } from "../types";

export function createEmptyLevelProgress(level: CEFRLevel): LevelProgress {
  return {
    level,
    currentWordId: null,
    currentIndex: 0,
    completedWordIds: [],
    difficultWordIds: [],
    favoriteWordIds: [],
    totalAttempts: 0,
    correctCount: 0,
    wrongCount: 0,
    currentStreak: 0,
    bestStreak: 0,
    sessionOrderWordIds: [],
    repeatedWrongByWordId: {},
    updatedAt: new Date().toISOString(),
  };
}

export function createEmptyProgress(profileId: string): UserProgress {
  const today = toLocalDateKey();

  return {
    profileId,
    lastSelectedLevel: null,
    levels: CEFR_LEVELS.reduce(
      (levels, level) => ({
        ...levels,
        [level]: createEmptyLevelProgress(level),
      }),
      {} as UserProgress["levels"],
    ),
    dailyGoal: {
      date: today,
      targetWords: 20,
      completedWords: 0,
    },
    totalPracticeDays: 0,
    currentDayStreak: 0,
    bestDayStreak: 0,
    lastPracticeDate: null,
    wordsIntroSeen: false,
  };
}

export function ensureDailyGoalForToday(progress: UserProgress): UserProgress {
  const today = toLocalDateKey();
  if (progress.dailyGoal.date === today) {
    return progress;
  }

  return {
    ...progress,
    dailyGoal: {
      ...progress.dailyGoal,
      date: today,
      completedWords: 0,
    },
  };
}

export function updateDailyGoal(progress: UserProgress, completedWords = 1): UserProgress {
  const current = ensureDailyGoalForToday(progress);

  return {
    ...current,
    dailyGoal: {
      ...current.dailyGoal,
      completedWords: current.dailyGoal.completedWords + completedWords,
    },
  };
}

export function updateDayStreak(progress: UserProgress): UserProgress {
  const today = toLocalDateKey();
  if (progress.lastPracticeDate === today) {
    return progress;
  }

  const gap = progress.lastPracticeDate ? daysBetween(progress.lastPracticeDate, today) : null;
  const currentDayStreak = gap === 1 ? progress.currentDayStreak + 1 : 1;

  return {
    ...progress,
    totalPracticeDays: progress.totalPracticeDays + 1,
    currentDayStreak,
    bestDayStreak: Math.max(progress.bestDayStreak, currentDayStreak),
    lastPracticeDate: today,
  };
}

export function calculateProgressPercent(currentIndex: number, total: number): number {
  if (total <= 0) {
    return 0;
  }

  return Math.min(100, Math.round((currentIndex / total) * 100));
}
