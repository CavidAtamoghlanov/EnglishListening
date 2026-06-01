import type {
  SentenceItem,
  SentenceLevel,
  SentenceLevelProgress,
  SentencePracticeMode,
  UserSentenceProgress,
} from "../types";
import { isSentenceAnswerCorrect } from "../utils/sentenceAnswer";
import { createStableSentenceOrder } from "../utils/sentenceShuffle";
import {
  createEmptySentenceLevelProgress,
  createEmptySentenceProgress,
} from "../utils/sentenceProgressUtils";
import { sentenceDataService } from "./sentenceDataService";

export type SentencePracticeFeedback = {
  type: "correct" | "wrong" | null;
  message: string | null;
  scorePercent?: number;
  expectedAnswer?: string;
  missingWords?: string[];
  closeEnough?: boolean;
};

export type PreparedSentenceSession = {
  progress: UserSentenceProgress;
  sentences: SentenceItem[];
  currentIndex: number;
};

export type SentenceAnswerResult = {
  progress: UserSentenceProgress;
  correct: boolean;
  nextIndex: number;
  feedback: SentencePracticeFeedback;
};

function unique(values: string[]): string[] {
  return Array.from(new Set(values));
}

export function prepareSentenceSession({
  profileId,
  progress,
  mode,
  level,
}: {
  profileId: string;
  progress: UserSentenceProgress;
  mode: SentencePracticeMode;
  level: SentenceLevel;
}): PreparedSentenceSession {
  const levelSentences = sentenceDataService.getSentencesByModeAndLevel(mode, level);
  const levelProgress =
    progress.levels[mode][level] ?? createEmptySentenceLevelProgress(mode, level);
  const validIds = new Set(levelSentences.map((sentence) => sentence.id));
  const existingOrder = levelProgress.sessionOrderSentenceIds.filter((id) => validIds.has(id));
  const knownIds = new Set(existingOrder);
  const newIds = levelSentences
    .map((sentence) => sentence.id)
    .filter((id) => !knownIds.has(id));
  const sessionOrderSentenceIds =
    existingOrder.length > 0
      ? [...existingOrder, ...newIds]
      : createStableSentenceOrder(levelSentences, profileId, mode, level);
  const boundedIndex = Math.min(Math.max(levelProgress.currentIndex, 0), sessionOrderSentenceIds.length);

  const updatedProgress: UserSentenceProgress = {
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
          sessionOrderSentenceIds,
          currentIndex: boundedIndex,
          currentSentenceId: sessionOrderSentenceIds[boundedIndex] ?? null,
          updatedAt: new Date().toISOString(),
        },
      },
    },
  };

  return {
    progress: updatedProgress,
    sentences: sentenceDataService.getSentencesByIds(sessionOrderSentenceIds),
    currentIndex: boundedIndex,
  };
}

export function applySentenceAnswer({
  progress,
  currentSentence,
  answer,
  currentIndex,
  mode,
  level,
  answerCorrectOverride,
  feedbackOverride,
}: {
  progress: UserSentenceProgress;
  currentSentence: SentenceItem;
  answer: string;
  currentIndex: number;
  mode: SentencePracticeMode;
  level: SentenceLevel;
  answerCorrectOverride?: boolean;
  feedbackOverride?: SentencePracticeFeedback;
}): SentenceAnswerResult {
  const correct = answerCorrectOverride ?? isSentenceAnswerCorrect(currentSentence, answer);
  const levelProgress =
    progress.levels[mode][level] ?? createEmptySentenceLevelProgress(mode, level);
  const now = new Date().toISOString();
  let nextIndex = currentIndex;

  let updatedLevel: SentenceLevelProgress = {
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
      completedSentenceIds: unique([...levelProgress.completedSentenceIds, currentSentence.id]),
      currentIndex: nextIndex,
      currentSentenceId: levelProgress.sessionOrderSentenceIds[nextIndex] ?? null,
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
      feedback: feedbackOverride ?? { type: "correct", message: "Great!" },
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
    feedback: feedbackOverride ?? { type: "wrong", message: "Try again. Say the full sentence clearly." },
  };
}

export function mergeSentenceProgress(
  profileId: string,
  stored: UserSentenceProgress | null,
): UserSentenceProgress {
  const empty = createEmptySentenceProgress(profileId);
  if (!stored) {
    return empty;
  }

  const levels = { ...empty.levels };
  for (const mode of ["repeat", "translate"] as const) {
    levels[mode] = { ...empty.levels[mode] };
    for (const level of Object.keys(empty.levels[mode]) as SentenceLevel[]) {
      levels[mode][level] = {
        ...empty.levels[mode][level],
        ...stored.levels?.[mode]?.[level],
        mode,
        level,
      };
    }
  }

  return {
    ...empty,
    ...stored,
    profileId,
    levels,
  };
}
