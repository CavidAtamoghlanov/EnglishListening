import {
  CEFR_LEVELS,
  DEFAULT_CEFR_LEVEL,
  parseLevelParam,
  type CEFRLevel,
} from "../../../config/levels";
import {
  getPracticeModeConfig,
  getReviewWordIds,
  type PracticeMode,
  type ReviewPracticeMode,
} from "../../../config/reviewModes";
import type { LevelProgress, UserProgress } from "../../progress/types";
import {
  createEmptyLevelProgress,
  updateDailyGoal,
  updateDayStreak,
} from "../../progress/utils/progressUtils";
import type { PracticeScope, WordItem } from "../types";
import { isAnswerCorrect } from "../utils/answerUtils";
import { createStableSessionOrder } from "../utils/wordOrderUtils";
import { wordsDataService } from "./wordsDataService";

export type PracticeFeedback = {
  type: "correct" | "wrong" | null;
  message: string | null;
  scorePercent?: number;
  expectedAnswer?: string;
  missingWords?: string[];
  closeEnough?: boolean;
};

export type PreparedPracticeSession = {
  progress: UserProgress;
  words: WordItem[];
  currentIndex: number;
};

export type AnswerResult = {
  progress: UserProgress;
  correct: boolean;
  nextIndex: number;
  feedback: PracticeFeedback;
};

function unique(values: string[]): string[] {
  return Array.from(new Set(values));
}

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function resolvePracticeLevel(levelParam: string | string[] | undefined): CEFRLevel {
  return parseLevelParam(levelParam) ?? DEFAULT_CEFR_LEVEL;
}

export function resolvePracticeScope(
  levelParam: string | string[] | undefined,
  scopeParam: string | string[] | undefined,
): PracticeScope {
  return firstParam(scopeParam) === "all" ? "all" : resolvePracticeLevel(levelParam);
}

export function preparePracticeSession({
  profileId,
  progress,
  selectedLevel,
  mode,
  practiceScope,
}: {
  profileId: string;
  progress: UserProgress;
  selectedLevel: CEFRLevel;
  mode: PracticeMode;
  practiceScope: PracticeScope;
}): PreparedPracticeSession {
  if (mode === "full") {
    const levelWords = wordsDataService.getWordsByLevel(selectedLevel);
    const levelProgress =
      progress.levels[selectedLevel] ?? createEmptyLevelProgress(selectedLevel);
    const knownIds = new Set(levelProgress.sessionOrderWordIds);
    const newWordIds = levelWords
      .map((word) => word.id)
      .filter((wordId) => !knownIds.has(wordId));
    const sessionOrderWordIds =
      levelProgress.sessionOrderWordIds.length > 0
        ? [...levelProgress.sessionOrderWordIds, ...newWordIds]
        : createStableSessionOrder(levelWords, profileId, selectedLevel);
    const boundedIndex = Math.min(
      Math.max(levelProgress.currentIndex, 0),
      sessionOrderWordIds.length,
    );

    const updatedProgress: UserProgress = {
      ...progress,
      lastSelectedLevel: selectedLevel,
      levels: {
        ...progress.levels,
        [selectedLevel]: {
          ...levelProgress,
          sessionOrderWordIds,
          currentIndex: boundedIndex,
          currentWordId: sessionOrderWordIds[boundedIndex] ?? null,
          updatedAt: new Date().toISOString(),
        },
      },
    };

    return {
      progress: updatedProgress,
      words: wordsDataService.getWordsByIds(sessionOrderWordIds),
      currentIndex: boundedIndex,
    };
  }

  const modeConfig = getPracticeModeConfig(mode);
  if (!modeConfig.progressField) {
    return { progress, words: [], currentIndex: 0 };
  }

  const levels = practiceScope === "all" ? CEFR_LEVELS : [practiceScope];
  const reviewMode = mode as ReviewPracticeMode;
  const reviewIds = unique(
    levels.flatMap((level) => getReviewWordIds(progress.levels[level], reviewMode)),
  );

  return {
    progress,
    words: wordsDataService.getWordsByIds(reviewIds),
    currentIndex: 0,
  };
}

export function applyPracticeAnswer({
  progress,
  currentWord,
  answer,
  currentIndex,
  mode,
  selectedLevel,
  answerCorrectOverride,
  feedbackOverride,
}: {
  progress: UserProgress;
  currentWord: WordItem;
  answer: string;
  currentIndex: number;
  mode: PracticeMode;
  selectedLevel: CEFRLevel;
  answerCorrectOverride?: boolean;
  feedbackOverride?: PracticeFeedback;
}): AnswerResult {
  const correct = answerCorrectOverride ?? isAnswerCorrect(currentWord, answer);
  const wordLevel = currentWord.level;
  const levelProgress = progress.levels[wordLevel] ?? createEmptyLevelProgress(wordLevel);
  const nextRepeatedWrong = { ...levelProgress.repeatedWrongByWordId };
  const now = new Date().toISOString();
  let nextIndex = currentIndex;

  let updatedLevel: LevelProgress = {
    ...levelProgress,
    totalAttempts: levelProgress.totalAttempts + 1,
    updatedAt: now,
  };

  let updatedProgress: UserProgress = {
    ...progress,
    levels: {
      ...progress.levels,
    },
  };

  if (correct) {
    nextRepeatedWrong[currentWord.id] = Math.max((nextRepeatedWrong[currentWord.id] ?? 0) - 1, 0);
    if (nextRepeatedWrong[currentWord.id] === 0) {
      delete nextRepeatedWrong[currentWord.id];
    }

    const difficultWordIds =
      (levelProgress.repeatedWrongByWordId[currentWord.id] ?? 0) <= 1
        ? levelProgress.difficultWordIds.filter((wordId) => wordId !== currentWord.id)
        : levelProgress.difficultWordIds;

    nextIndex = currentIndex + 1;
    updatedLevel = {
      ...updatedLevel,
      correctCount: levelProgress.correctCount + 1,
      currentStreak: levelProgress.currentStreak + 1,
      bestStreak: Math.max(levelProgress.bestStreak, levelProgress.currentStreak + 1),
      completedWordIds: unique([...levelProgress.completedWordIds, currentWord.id]),
      difficultWordIds,
      repeatedWrongByWordId: nextRepeatedWrong,
    };

    if (mode === "full" && wordLevel === selectedLevel) {
      updatedLevel.currentIndex = nextIndex;
      updatedLevel.currentWordId = levelProgress.sessionOrderWordIds[nextIndex] ?? null;
    }

    updatedProgress.levels[wordLevel] = updatedLevel;
    updatedProgress = updateDayStreak(updateDailyGoal(updatedProgress, 1));

    return {
      progress: updatedProgress,
      correct,
      nextIndex,
      feedback: feedbackOverride ?? { type: "correct", message: "Good!" },
    };
  }

  const wrongForWord = (nextRepeatedWrong[currentWord.id] ?? 0) + 1;
  nextRepeatedWrong[currentWord.id] = wrongForWord;
  updatedLevel = {
    ...updatedLevel,
    wrongCount: levelProgress.wrongCount + 1,
    currentStreak: 0,
    difficultWordIds:
      wrongForWord >= 2
        ? unique([...levelProgress.difficultWordIds, currentWord.id])
        : levelProgress.difficultWordIds,
    repeatedWrongByWordId: nextRepeatedWrong,
  };
  updatedProgress.levels[wordLevel] = updatedLevel;

  return {
    progress: updatedProgress,
    correct,
    nextIndex,
    feedback: feedbackOverride ?? { type: "wrong", message: "Try again. You are close." },
  };
}

export function toggleFavoriteInProgress(
  progress: UserProgress,
  currentWord: WordItem,
): UserProgress {
  const levelProgress = progress.levels[currentWord.level];
  const isFavorite = levelProgress.favoriteWordIds.includes(currentWord.id);
  const updatedLevel = {
    ...levelProgress,
    favoriteWordIds: isFavorite
      ? levelProgress.favoriteWordIds.filter((wordId) => wordId !== currentWord.id)
      : [...levelProgress.favoriteWordIds, currentWord.id],
    updatedAt: new Date().toISOString(),
  };

  return {
    ...progress,
    levels: {
      ...progress.levels,
      [currentWord.level]: updatedLevel,
    },
  };
}
