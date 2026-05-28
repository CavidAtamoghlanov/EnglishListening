import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getNextIndexAfterSkip, moveCurrentItemToEnd } from "../../practice/utils/queue";
import { grammarDataService } from "../services/grammarDataService";
import { grammarProgressStorageService } from "../services/grammarProgressStorageService";
import {
  applyGrammarAnswer,
  CORRECT_GRAMMAR_DELAY_MS,
  prepareGrammarSession,
  type GrammarPracticeFeedback,
} from "../services/grammarPracticeService";
import type { GrammarExercise, GrammarLevel, GrammarPracticeMode, UserGrammarProgress } from "../types";
import { isGrammarAnswerCorrect } from "../utils/grammarAnswer";
import { learningRecorderService } from "../../learning/services/learningRecorderService";

function exerciseAtIndex(exercises: GrammarExercise[], index: number): GrammarExercise | null {
  if (index < 0 || index >= exercises.length) {
    return null;
  }
  return exercises[index] ?? null;
}

export function useGrammarPractice(
  profileId: string | null | undefined,
  mode: GrammarPracticeMode,
  level: GrammarLevel,
) {
  const [progress, setProgress] = useState<UserGrammarProgress | null>(null);
  const [practiceExercises, setPracticeExercises] = useState<GrammarExercise[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [previousExercise, setPreviousExercise] = useState<GrammarExercise | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(profileId));
  const [feedback, setFeedback] = useState<GrammarPracticeFeedback>({ type: null, message: null });
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
      setPracticeExercises([]);
      setPreviousExercise(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const storedProgress = await grammarProgressStorageService.getProgress(profileId);
    const prepared = prepareGrammarSession({
      profileId,
      progress: storedProgress,
      mode,
      level,
    });

    await grammarProgressStorageService.saveProgress(profileId, prepared.progress);
    setPracticeExercises(prepared.exercises);
    setCurrentIndex(prepared.currentIndex);
    setPreviousExercise(exerciseAtIndex(prepared.exercises, prepared.currentIndex - 1));
    setProgress(prepared.progress);
    setIsLoading(false);
  }, [clearTransitionTimeout, level, mode, profileId]);

  useEffect(() => {
    void preparePractice();
  }, [preparePractice]);

  const currentExercise = practiceExercises[currentIndex] ?? null;

  const submitAnswer = useCallback(
    async (answer: string) => {
      if (!profileId || !progress || !currentExercise || isAnswerLocked || submissionInFlightRef.current) {
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
        const alreadyCompleted = levelProgress.completedExerciseIds.includes(currentExercise.id);

        if (alreadyCompleted) {
          const correct = isGrammarAnswerCorrect(currentExercise, trimmed);
          setFeedback({
            type: correct ? "correct" : "wrong",
            message: correct ? "Good!" : "Try again. Review the grammar note.",
          });
          setSubmittedAnswer(trimmed);
          await learningRecorderService.recordPracticeResult({
            profileId,
            module: "grammar",
            activityType: "grammar",
            level: currentExercise.level,
            itemId: currentExercise.id,
            prompt: currentExercise.prompt,
            correctAnswer: currentExercise.correctAnswer,
            userAnswer: trimmed,
            result: correct ? "correct" : "wrong",
            explanationAz: currentExercise.explanationAz,
            awardXp: false,
          });

          if (!correct) {
            return false;
          }

          const nextIndex = currentIndex + 1;
          const updatedProgress: UserGrammarProgress = {
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
                  currentExerciseId: levelProgress.sessionOrderExerciseIds[nextIndex] ?? null,
                  updatedAt: new Date().toISOString(),
                },
              },
            },
          };

          await grammarProgressStorageService.saveProgress(profileId, updatedProgress);
          setProgress(updatedProgress);
          const completedExercise = currentExercise;
          setIsAnswerLocked(true);

          transitionTimeoutRef.current = setTimeout(() => {
            transitionTimeoutRef.current = null;
            setPreviousExercise(completedExercise);
            setCurrentIndex(nextIndex);
            setFeedback({ type: null, message: null });
            setSubmittedAnswer(null);
            setIsAnswerLocked(false);
          }, CORRECT_GRAMMAR_DELAY_MS);

          return true;
        }

        const result = applyGrammarAnswer({
          progress,
          currentExercise,
          answer: trimmed,
          currentIndex,
          mode,
          level,
        });

        await grammarProgressStorageService.saveProgress(profileId, result.progress);
        setProgress(result.progress);
        setFeedback(result.feedback);
        setSubmittedAnswer(trimmed);
        await learningRecorderService.recordPracticeResult({
          profileId,
          module: "grammar",
          activityType: "grammar",
          level: currentExercise.level,
          itemId: currentExercise.id,
          prompt: currentExercise.prompt,
          correctAnswer: currentExercise.correctAnswer,
          userAnswer: trimmed,
          result: result.correct ? "correct" : "wrong",
          explanationAz: currentExercise.explanationAz,
          awardXp: result.correct,
          streakCount: result.progress.levels[mode][level].currentStreak,
        });

        if (!result.correct) {
          return false;
        }

        const completedExercise = currentExercise;
        setIsAnswerLocked(true);

        transitionTimeoutRef.current = setTimeout(() => {
          transitionTimeoutRef.current = null;
          setPreviousExercise(completedExercise);
          setCurrentIndex(result.nextIndex);
          setFeedback({ type: null, message: null });
          setSubmittedAnswer(null);
          setIsAnswerLocked(false);
        }, CORRECT_GRAMMAR_DELAY_MS);

        return true;
      } finally {
        submissionInFlightRef.current = false;
      }
    },
    [clearTransitionTimeout, currentExercise, currentIndex, isAnswerLocked, level, mode, profileId, progress],
  );

  const goToPreviousExercise = useCallback(async () => {
    if (!profileId || !progress || currentIndex <= 0 || isAnswerLocked || practiceExercises.length === 0) {
      return false;
    }

    clearTransitionTimeout();

    const nextIndex = currentIndex - 1;
    const nextExercise = practiceExercises[nextIndex] ?? null;
    if (!nextExercise) {
      return false;
    }

    const levelProgress = progress.levels[mode][level];
    const updatedProgress: UserGrammarProgress = {
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
            currentExerciseId: nextExercise.id,
            updatedAt: new Date().toISOString(),
          },
        },
      },
    };

    await grammarProgressStorageService.saveProgress(profileId, updatedProgress);
    setProgress(updatedProgress);
    setPreviousExercise(exerciseAtIndex(practiceExercises, nextIndex - 1));
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
    practiceExercises,
    profileId,
    progress,
  ]);

  const skipCurrentExercise = useCallback(async () => {
    if (!profileId || !progress || !currentExercise || isAnswerLocked || practiceExercises.length === 0) {
      return false;
    }

    clearTransitionTimeout();
    const skippedExercise = currentExercise;

    const nextOrderIds = moveCurrentItemToEnd(
      practiceExercises.map((exercise) => exercise.id),
      currentIndex,
    );
    const nextExercises = grammarDataService.getExercisesByIds(nextOrderIds);
    const nextIndex = getNextIndexAfterSkip(nextExercises, currentIndex);
    const nextExercise = nextExercises[nextIndex] ?? null;
    const levelProgress = progress.levels[mode][level];
    const updatedProgress: UserGrammarProgress = {
      ...progress,
      lastSelectedMode: mode,
      lastSelectedLevel: level,
      levels: {
        ...progress.levels,
        [mode]: {
          ...progress.levels[mode],
          [level]: {
            ...levelProgress,
            sessionOrderExerciseIds: nextOrderIds,
            currentIndex: nextIndex,
            currentExerciseId: nextExercise?.id ?? null,
            updatedAt: new Date().toISOString(),
          },
        },
      },
    };

    await grammarProgressStorageService.saveProgress(profileId, updatedProgress);
    setProgress(updatedProgress);
    setPracticeExercises(nextExercises);
    setPreviousExercise(skippedExercise);
    setCurrentIndex(nextIndex);
    setFeedback({ type: null, message: null });
    setSubmittedAnswer(null);
    setIsAnswerLocked(false);
    await learningRecorderService.recordPracticeResult({
      profileId,
      module: "grammar",
      activityType: "grammar",
      level: skippedExercise.level,
      itemId: skippedExercise.id,
      prompt: skippedExercise.prompt,
      correctAnswer: skippedExercise.correctAnswer,
      result: "skipped",
      explanationAz: skippedExercise.explanationAz,
      awardXp: false,
    });
    return true;
  }, [
    clearTransitionTimeout,
    currentExercise,
    currentIndex,
    isAnswerLocked,
    level,
    mode,
    practiceExercises,
    profileId,
    progress,
  ]);

  const restartLevel = useCallback(async () => {
    if (!profileId) {
      return;
    }
    clearTransitionTimeout();
    await grammarProgressStorageService.resetLevel(profileId, mode, level);
    await preparePractice();
  }, [clearTransitionTimeout, level, mode, preparePractice, profileId]);

  const stats = progress?.levels[mode][level] ?? null;

  return useMemo(
    () => ({
      progress,
      practiceExercises,
      currentExercise,
      currentIndex,
      previousExercise,
      totalExercises: practiceExercises.length,
      isLoading,
      feedback,
      submittedAnswer,
      isAnswerLocked,
      stats,
      reload: preparePractice,
      submitAnswer,
      skipCurrentExercise,
      goToPreviousExercise,
      canGoPrevious: currentIndex > 0 && !isAnswerLocked,
      restartLevel,
    }),
    [
      currentExercise,
      currentIndex,
      feedback,
      goToPreviousExercise,
      isAnswerLocked,
      isLoading,
      practiceExercises,
      preparePractice,
      previousExercise,
      progress,
      restartLevel,
      skipCurrentExercise,
      stats,
      submitAnswer,
      submittedAnswer,
    ],
  );
}
