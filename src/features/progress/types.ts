import type { CEFRLevel } from "../../config/levels";
export { CEFR_LEVELS } from "../../config/levels";
export type { CEFRLevel } from "../../config/levels";

export type LevelProgress = {
  level: CEFRLevel;
  currentWordId: string | null;
  currentIndex: number;
  completedWordIds: string[];
  difficultWordIds: string[];
  favoriteWordIds: string[];
  totalAttempts: number;
  correctCount: number;
  wrongCount: number;
  currentStreak: number;
  bestStreak: number;
  sessionOrderWordIds: string[];
  repeatedWrongByWordId: Record<string, number>;
  updatedAt: string;
};

export type DailyGoalProgress = {
  date: string;
  targetWords: number;
  completedWords: number;
};

export type UserProgress = {
  profileId: string;
  lastSelectedLevel: CEFRLevel | null;
  levels: Record<CEFRLevel, LevelProgress>;
  dailyGoal: DailyGoalProgress;
  totalPracticeDays: number;
  currentDayStreak: number;
  bestDayStreak: number;
  lastPracticeDate: string | null;
  wordsIntroSeen: boolean;
};
