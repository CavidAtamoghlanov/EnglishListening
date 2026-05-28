import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getNextIndexAfterSkip, moveCurrentItemToEnd } from "../../practice/utils/queue";
import { writingDataService } from "../services/writingDataService";
import { writingProgressStorageService } from "../services/writingProgressStorageService";
import {
  applyWritingAnswer,
  CORRECT_WRITING_DELAY_MS,
  prepareWritingSession,
  type WritingPracticeFeedback,
} from "../services/writingPracticeService";
import type { UserWritingProgress, WritingItem, WritingLevel, WritingPracticeMode } from "../types";
import { isWritingAnswerCorrect } from "../utils/writingAnswer";
import { learningRecorderService } from "../../learning/services/learningRecorderService";

function itemAtIndex(items: WritingItem[], index: number): WritingItem | null {
  if (index < 0 || index >= items.length) {
    return null;
  }
  return items[index] ?? null;
}

function getWritingPrompt(item: WritingItem, mode: WritingPracticeMode): string {
  if (mode === "listen-write") {
    return "Listen and write";
  }
  if (mode === "fix-english") {
    return item.wrongEnglish ?? item.prompt;
  }
  return item.prompt;
}

export function useWritingPractice(
  profileId: string | null | undefined,
  mode: WritingPracticeMode,
  level: WritingLevel,
) {
  const [progress, setProgress] = useState<UserWritingProgress | null>(null);
  const [practiceItems, setPracticeItems] = useState<WritingItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [previousItem, setPreviousItem] = useState<WritingItem | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(profileId));
  const [feedback, setFeedback] = useState<WritingPracticeFeedback>({ type: null, message: null });
  const [submittedAnswer, setSubmittedAnswer] = useState<string | null>(null);
  const [isAnswerLocked, setIsAnswerLocked] = useState(false);
  const transitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const submissionInFlightRef = useRef(false);

  const clearTransitionTimeout = useCallback(() => {
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => clearTransitionTimeout, [clearTransitionTimeout]);

  const preparePractice = useCallback(async () => {
    clearTransitionTimeout();
    setIsAnswerLocked(false);
    setSubmittedAnswer(null);
    setFeedback({ type: null, message: null });

    if (!profileId) {
      setProgress(null);
      setPracticeItems([]);
      setPreviousItem(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const storedProgress = await writingProgressStorageService.getProgress(profileId);
    const prepared = prepareWritingSession({
      profileId,
      progress: storedProgress,
      mode,
      level,
    });

    await writingProgressStorageService.saveProgress(profileId, prepared.progress);
    setPracticeItems(prepared.items);
    setCurrentIndex(prepared.currentIndex);
    setPreviousItem(itemAtIndex(prepared.items, prepared.currentIndex - 1));
    setProgress(prepared.progress);
    setIsLoading(false);
  }, [clearTransitionTimeout, level, mode, profileId]);

  useEffect(() => {
    void preparePractice();
  }, [preparePractice]);

  const currentItem = practiceItems[currentIndex] ?? null;

  const submitAnswer = useCallback(
    async (answer: string) => {
      if (!profileId || !progress || !currentItem || isAnswerLocked || submissionInFlightRef.current) {
        return false;
      }

      const trimmed = answer.trim();
      if (!trimmed) {
        return false;
      }

      submissionInFlightRef.current = true;
      clearTransitionTimeout();

      try {
        const levelProgress = progress.levels[mode][level];
        const alreadyCompleted = levelProgress.completedItemIds.includes(currentItem.id);

        if (alreadyCompleted) {
          const correct = isWritingAnswerCorrect(currentItem, trimmed);
          setFeedback({
            type: correct ? "correct" : "wrong",
            message: correct ? "Good!" : "Try again. Review the hint.",
          });
          setSubmittedAnswer(trimmed);
          await learningRecorderService.recordPracticeResult({
            profileId,
            module: "writing",
            activityType: "write",
            level: currentItem.level,
            itemId: currentItem.id,
            prompt: getWritingPrompt(currentItem, mode),
            correctAnswer: currentItem.correctAnswer,
            userAnswer: trimmed,
            result: correct ? "correct" : "wrong",
            explanationAz: currentItem.explanationAz,
            awardXp: false,
          });

          if (!correct) {
            return false;
          }

          const nextIndex = currentIndex + 1;
          const updatedProgress: UserWritingProgress = {
            ...progress,
            lastSelectedMode: mode,
            lastSelectedLevel: level,
            levels: {
              ...progress.levels,
              [mode]: {
                ...progress.levels[mode],
                [level]: {
                  ...levelProgress,
                  currentIndex: nextIndex,
                  currentItemId: levelProgress.sessionOrderItemIds[nextIndex] ?? null,
                  updatedAt: new Date().toISOString(),
                },
              },
            },
          };

          await writingProgressStorageService.saveProgress(profileId, updatedProgress);
          setProgress(updatedProgress);
          const completedItem = currentItem;
          setIsAnswerLocked(true);

          transitionTimeoutRef.current = setTimeout(() => {
            transitionTimeoutRef.current = null;
            setPreviousItem(completedItem);
            setCurrentIndex(nextIndex);
            setFeedback({ type: null, message: null });
            setSubmittedAnswer(null);
            setIsAnswerLocked(false);
          }, CORRECT_WRITING_DELAY_MS);

          return true;
        }

        const result = applyWritingAnswer({
          progress,
          currentItem,
          answer: trimmed,
          currentIndex,
          mode,
          level,
        });

        await writingProgressStorageService.saveProgress(profileId, result.progress);
        setProgress(result.progress);
        setFeedback(result.feedback);
        setSubmittedAnswer(trimmed);
        await learningRecorderService.recordPracticeResult({
          profileId,
          module: "writing",
          activityType: "write",
          level: currentItem.level,
          itemId: currentItem.id,
          prompt: getWritingPrompt(currentItem, mode),
          correctAnswer: currentItem.correctAnswer,
          userAnswer: trimmed,
          result: result.correct ? "correct" : "wrong",
          explanationAz: currentItem.explanationAz,
          awardXp: result.correct,
          streakCount: result.progress.levels[mode][level].currentStreak,
        });

        if (!result.correct) {
          return false;
        }

        const completedItem = currentItem;
        setIsAnswerLocked(true);

        transitionTimeoutRef.current = setTimeout(() => {
          transitionTimeoutRef.current = null;
          setPreviousItem(completedItem);
          setCurrentIndex(result.nextIndex);
          setFeedback({ type: null, message: null });
          setSubmittedAnswer(null);
          setIsAnswerLocked(false);
        }, CORRECT_WRITING_DELAY_MS);

        return true;
      } finally {
        submissionInFlightRef.current = false;
      }
    },
    [clearTransitionTimeout, currentIndex, currentItem, isAnswerLocked, level, mode, profileId, progress],
  );

  const goToPreviousItem = useCallback(async () => {
    if (!profileId || !progress || currentIndex <= 0 || isAnswerLocked || practiceItems.length === 0) {
      return false;
    }

    clearTransitionTimeout();

    const nextIndex = currentIndex - 1;
    const nextItem = practiceItems[nextIndex] ?? null;
    if (!nextItem) {
      return false;
    }

    const levelProgress = progress.levels[mode][level];
    const updatedProgress: UserWritingProgress = {
      ...progress,
      lastSelectedMode: mode,
      lastSelectedLevel: level,
      levels: {
        ...progress.levels,
        [mode]: {
          ...progress.levels[mode],
          [level]: {
            ...levelProgress,
            currentIndex: nextIndex,
            currentItemId: nextItem.id,
            updatedAt: new Date().toISOString(),
          },
        },
      },
    };

    await writingProgressStorageService.saveProgress(profileId, updatedProgress);
    setProgress(updatedProgress);
    setPreviousItem(itemAtIndex(practiceItems, nextIndex - 1));
    setCurrentIndex(nextIndex);
    setFeedback({ type: null, message: null });
    setSubmittedAnswer(null);
    setIsAnswerLocked(false);
    return true;
  }, [
    clearTransitionTimeout,
    currentIndex,
    isAnswerLocked,
    level,
    mode,
    practiceItems,
    profileId,
    progress,
  ]);

  const skipCurrentItem = useCallback(async () => {
    if (!profileId || !progress || !currentItem || isAnswerLocked || practiceItems.length === 0) {
      return false;
    }

    clearTransitionTimeout();
    const skippedItem = currentItem;

    const nextOrderIds = moveCurrentItemToEnd(
      practiceItems.map((item) => item.id),
      currentIndex,
    );
    const nextItems = writingDataService.getItemsByIds(nextOrderIds);
    const nextIndex = getNextIndexAfterSkip(nextItems, currentIndex);
    const nextItem = nextItems[nextIndex] ?? null;
    const levelProgress = progress.levels[mode][level];
    const updatedProgress: UserWritingProgress = {
      ...progress,
      lastSelectedMode: mode,
      lastSelectedLevel: level,
      levels: {
        ...progress.levels,
        [mode]: {
          ...progress.levels[mode],
          [level]: {
            ...levelProgress,
            sessionOrderItemIds: nextOrderIds,
            currentIndex: nextIndex,
            currentItemId: nextItem?.id ?? null,
            updatedAt: new Date().toISOString(),
          },
        },
      },
    };

    await writingProgressStorageService.saveProgress(profileId, updatedProgress);
    setProgress(updatedProgress);
    setPracticeItems(nextItems);
    setPreviousItem(skippedItem);
    setCurrentIndex(nextIndex);
    setFeedback({ type: null, message: null });
    setSubmittedAnswer(null);
    setIsAnswerLocked(false);
    await learningRecorderService.recordPracticeResult({
      profileId,
      module: "writing",
      activityType: "write",
      level: skippedItem.level,
      itemId: skippedItem.id,
      prompt: getWritingPrompt(skippedItem, mode),
      correctAnswer: skippedItem.correctAnswer,
      result: "skipped",
      explanationAz: skippedItem.explanationAz,
      awardXp: false,
    });
    return true;
  }, [
    clearTransitionTimeout,
    currentIndex,
    currentItem,
    isAnswerLocked,
    level,
    mode,
    practiceItems,
    profileId,
    progress,
  ]);

  const restartLevel = useCallback(async () => {
    if (!profileId) {
      return;
    }
    clearTransitionTimeout();
    await writingProgressStorageService.resetLevel(profileId, mode, level);
    await preparePractice();
  }, [clearTransitionTimeout, level, mode, preparePractice, profileId]);

  const stats = progress?.levels[mode][level] ?? null;

  return useMemo(
    () => ({
      progress,
      practiceItems,
      currentItem,
      currentIndex,
      previousItem,
      totalItems: practiceItems.length,
      isLoading,
      feedback,
      submittedAnswer,
      isAnswerLocked,
      stats,
      reload: preparePractice,
      submitAnswer,
      skipCurrentItem,
      goToPreviousItem,
      canGoPrevious: currentIndex > 0 && !isAnswerLocked,
      restartLevel,
    }),
    [
      currentIndex,
      currentItem,
      feedback,
      goToPreviousItem,
      isAnswerLocked,
      isLoading,
      practiceItems,
      preparePractice,
      previousItem,
      progress,
      restartLevel,
      skipCurrentItem,
      stats,
      submitAnswer,
      submittedAnswer,
    ],
  );
}
