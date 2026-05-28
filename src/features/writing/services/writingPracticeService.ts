import type {
  UserWritingProgress,
  WritingItem,
  WritingLevel,
  WritingLevelProgress,
  WritingPracticeMode,
} from "../types";
import { isWritingAnswerCorrect } from "../utils/writingAnswer";
import { createStableWritingOrder } from "../utils/writingQueue";
import { createEmptyWritingLevelProgress } from "../utils/writingProgress";
import { writingDataService } from "./writingDataService";

export const CORRECT_WRITING_DELAY_MS = 1800;

export type WritingPracticeFeedback = {
  type: "correct" | "wrong" | null;
  message: string | null;
};

export type PreparedWritingSession = {
  progress: UserWritingProgress;
  items: WritingItem[];
  currentIndex: number;
};

export type WritingAnswerResult = {
  progress: UserWritingProgress;
  correct: boolean;
  nextIndex: number;
  feedback: WritingPracticeFeedback;
};

function unique(values: string[]): string[] {
  return Array.from(new Set(values));
}

export function prepareWritingSession({
  profileId,
  progress,
  mode,
  level,
}: {
  profileId: string;
  progress: UserWritingProgress;
  mode: WritingPracticeMode;
  level: WritingLevel;
}): PreparedWritingSession {
  const levelItems = writingDataService.getItemsByModeAndLevel(mode, level);
  const levelProgress =
    progress.levels[mode][level] ?? createEmptyWritingLevelProgress(mode, level);
  const validIds = new Set(levelItems.map((item) => item.id));
  const existingOrder = levelProgress.sessionOrderItemIds.filter((id) => validIds.has(id));
  const knownIds = new Set(existingOrder);
  const newIds = levelItems.map((item) => item.id).filter((id) => !knownIds.has(id));
  const sessionOrderItemIds =
    existingOrder.length > 0
      ? [...existingOrder, ...newIds]
      : createStableWritingOrder(levelItems, profileId, mode, level);
  const boundedIndex = Math.min(Math.max(levelProgress.currentIndex, 0), sessionOrderItemIds.length);

  const updatedProgress: UserWritingProgress = {
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
          sessionOrderItemIds,
          currentIndex: boundedIndex,
          currentItemId: sessionOrderItemIds[boundedIndex] ?? null,
          updatedAt: new Date().toISOString(),
        },
      },
    },
  };

  return {
    progress: updatedProgress,
    items: writingDataService.getItemsByIds(sessionOrderItemIds),
    currentIndex: boundedIndex,
  };
}

export function applyWritingAnswer({
  progress,
  currentItem,
  answer,
  currentIndex,
  mode,
  level,
}: {
  progress: UserWritingProgress;
  currentItem: WritingItem;
  answer: string;
  currentIndex: number;
  mode: WritingPracticeMode;
  level: WritingLevel;
}): WritingAnswerResult {
  const correct = isWritingAnswerCorrect(currentItem, answer);
  const levelProgress =
    progress.levels[mode][level] ?? createEmptyWritingLevelProgress(mode, level);
  const now = new Date().toISOString();
  let nextIndex = currentIndex;

  let updatedLevel: WritingLevelProgress = {
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
      completedItemIds: unique([...levelProgress.completedItemIds, currentItem.id]),
      currentIndex: nextIndex,
      currentItemId: levelProgress.sessionOrderItemIds[nextIndex] ?? null,
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
    feedback: { type: "wrong", message: "Try again. Check the hint and write the full answer." },
  };
}
