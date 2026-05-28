import type {
  GrammarExercise,
  GrammarExerciseProgress,
  GrammarLevel,
  GrammarPracticeMode,
  UserGrammarProgress,
} from "../types";
import { isGrammarAnswerCorrect } from "../utils/grammarAnswer";
import { createStableGrammarOrder } from "../utils/grammarOrder";
import {
  createEmptyGrammarLevelProgress,
} from "../utils/grammarProgress";
import { grammarDataService } from "./grammarDataService";

export const CORRECT_GRAMMAR_DELAY_MS = 1800;

export type GrammarPracticeFeedback = {
  type: "correct" | "wrong" | null;
  message: string | null;
};

export type PreparedGrammarSession = {
  progress: UserGrammarProgress;
  exercises: GrammarExercise[];
  currentIndex: number;
};

export type GrammarAnswerResult = {
  progress: UserGrammarProgress;
  correct: boolean;
  nextIndex: number;
  feedback: GrammarPracticeFeedback;
};

function unique(values: string[]): string[] {
  return Array.from(new Set(values));
}

export function prepareGrammarSession({
  profileId,
  progress,
  mode,
  level,
}: {
  profileId: string;
  progress: UserGrammarProgress;
  mode: GrammarPracticeMode;
  level: GrammarLevel;
}): PreparedGrammarSession {
  const levelExercises = grammarDataService.getExercisesByModeAndLevel(mode, level);
  const levelProgress =
    progress.levels[mode][level] ?? createEmptyGrammarLevelProgress(mode, level);
  const validIds = new Set(levelExercises.map((exercise) => exercise.id));
  const existingOrder = levelProgress.sessionOrderExerciseIds.filter((id) => validIds.has(id));
  const knownIds = new Set(existingOrder);
  const newIds = levelExercises
    .map((exercise) => exercise.id)
    .filter((id) => !knownIds.has(id));
  const sessionOrderExerciseIds =
    existingOrder.length > 0
      ? [...existingOrder, ...newIds]
      : createStableGrammarOrder(levelExercises, profileId, mode, level);
  const boundedIndex = Math.min(Math.max(levelProgress.currentIndex, 0), sessionOrderExerciseIds.length);

  const updatedProgress: UserGrammarProgress = {
    ...progress,
    profileId,
    lastSelectedMode: mode,
    lastSelectedLevel: level,
    levels: {
      ...progress.levels,
      [mode]: {
        ...progress.levels[mode],
        [level]: {
          ...levelProgress,
          sessionOrderExerciseIds,
          currentIndex: boundedIndex,
          currentExerciseId: sessionOrderExerciseIds[boundedIndex] ?? null,
          updatedAt: new Date().toISOString(),
        },
      },
    },
  };

  return {
    progress: updatedProgress,
    exercises: grammarDataService.getExercisesByIds(sessionOrderExerciseIds),
    currentIndex: boundedIndex,
  };
}

export function applyGrammarAnswer({
  progress,
  currentExercise,
  answer,
  currentIndex,
  mode,
  level,
}: {
  progress: UserGrammarProgress;
  currentExercise: GrammarExercise;
  answer: string;
  currentIndex: number;
  mode: GrammarPracticeMode;
  level: GrammarLevel;
}): GrammarAnswerResult {
  const correct = isGrammarAnswerCorrect(currentExercise, answer);
  const levelProgress =
    progress.levels[mode][level] ?? createEmptyGrammarLevelProgress(mode, level);
  const now = new Date().toISOString();
  let nextIndex = currentIndex;

  let updatedLevel: GrammarExerciseProgress = {
    ...levelProgress,
    totalAttempts: levelProgress.totalAttempts + 1,
    updatedAt: now,
  };

  if (correct) {
    nextIndex = currentIndex + 1;
    updatedLevel = {
      ...updatedLevel,
      correctCount: levelProgress.correctCount + 1,
      currentStreak: levelProgress.currentStreak + 1,
      bestStreak: Math.max(levelProgress.bestStreak, levelProgress.currentStreak + 1),
      completedExerciseIds: unique([...levelProgress.completedExerciseIds, currentExercise.id]),
      currentIndex: nextIndex,
      currentExerciseId: levelProgress.sessionOrderExerciseIds[nextIndex] ?? null,
    };

    return {
      progress: {
        ...progress,
        levels: {
          ...progress.levels,
          [mode]: {
            ...progress.levels[mode],
            [level]: updatedLevel,
          },
        },
      },
      correct,
      nextIndex,
      feedback: { type: "correct", message: "Good!" },
    };
  }

  updatedLevel = {
    ...updatedLevel,
    wrongCount: levelProgress.wrongCount + 1,
    currentStreak: 0,
  };

  return {
    progress: {
      ...progress,
      levels: {
        ...progress.levels,
        [mode]: {
          ...progress.levels[mode],
          [level]: updatedLevel,
        },
      },
    },
    correct,
    nextIndex,
    feedback: { type: "wrong", message: "Try again. Check the grammar and write the full sentence." },
  };
}
