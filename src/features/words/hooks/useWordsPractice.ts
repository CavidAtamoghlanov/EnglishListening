import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { progressStorageService } from "../../progress/services/progressStorageService";
import type { UserProgress } from "../../progress/types";
import { CORRECT_ANSWER_DELAY_MS } from "../constants";
import {
  applyPracticeAnswer,
  preparePracticeSession,
  resolvePracticeLevel,
  resolvePracticeScope,
  toggleFavoriteInProgress,
  type PracticeFeedback,
} from "../services/wordsPracticeService";
import type { PracticeMode, WordItem } from "../types";
import { getNextIndexAfterSkip, moveCurrentItemToEnd } from "../../practice/utils/queue";
import { wordsDataService } from "../services/wordsDataService";

export type SubmittedAnswerSource = "speech" | "manual";

function wordAtIndex(words: WordItem[], index: number): WordItem | null {
  if (index < 0 || index >= words.length) {
    return null;
  }
  return words[index] ?? null;
}

export function useWordsPractice(
  profileId: string | null | undefined,
  levelParam: string | string[] | undefined,
  mode: PracticeMode = "full",
  scopeParam?: string | string[],
) {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [practiceWords, setPracticeWords] = useState<WordItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [previousWord, setPreviousWord] = useState<WordItem | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(profileId));
  const [feedback, setFeedback] = useState<PracticeFeedback>({ type: null, message: null });
  const [submittedAnswer, setSubmittedAnswer] = useState<string | null>(null);
  const [submittedAnswerSource, setSubmittedAnswerSource] = useState<SubmittedAnswerSource | null>(
    null,
  );
  const [isAnswerLocked, setIsAnswerLocked] = useState(false);
  const transitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTransitionTimeout = useCallback(() => {
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => clearTransitionTimeout, [clearTransitionTimeout]);

  const selectedLevel = resolvePracticeLevel(levelParam);
  const practiceScope = resolvePracticeScope(levelParam, scopeParam);

  const preparePractice = useCallback(async () => {
    clearTransitionTimeout();
    setIsAnswerLocked(false);
    setSubmittedAnswer(null);
    setSubmittedAnswerSource(null);
    setFeedback({ type: null, message: null });

    if (!profileId) {
      setProgress(null);
      setPracticeWords([]);
      setPreviousWord(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const storedProgress = await progressStorageService.getProgress(profileId);
    const prepared = preparePracticeSession({
      profileId,
      progress: storedProgress,
      selectedLevel,
      mode,
      practiceScope,
    });

    await progressStorageService.saveProgress(profileId, prepared.progress);
    setPracticeWords(prepared.words);
    setCurrentIndex(prepared.currentIndex);
    setPreviousWord(wordAtIndex(prepared.words, prepared.currentIndex - 1));
    setProgress(prepared.progress);
    setIsLoading(false);
  }, [clearTransitionTimeout, profileId, mode, practiceScope, selectedLevel]);

  useEffect(() => {
    void preparePractice();
  }, [preparePractice]);

  const currentWord = practiceWords[currentIndex] ?? null;

  const submitAnswer = useCallback(
    async (answer: string, source: SubmittedAnswerSource) => {
      if (!profileId || !progress || !currentWord || isAnswerLocked) {
        return false;
      }

      const trimmed = answer.trim();
      if (!trimmed) {
        return false;
      }

      clearTransitionTimeout();

      const result = applyPracticeAnswer({
        progress,
        currentWord,
        answer: trimmed,
        currentIndex,
        mode,
        selectedLevel,
      });

      await progressStorageService.saveProgress(profileId, result.progress);
      setProgress(result.progress);
      setFeedback(result.feedback);
      setSubmittedAnswer(trimmed);
      setSubmittedAnswerSource(source);

      if (!result.correct) {
        return false;
      }

      const completedWord = currentWord;
      setIsAnswerLocked(true);

      transitionTimeoutRef.current = setTimeout(() => {
        transitionTimeoutRef.current = null;
        setPreviousWord(completedWord);
        setCurrentIndex(result.nextIndex);
        setFeedback({ type: null, message: null });
        setSubmittedAnswer(null);
        setSubmittedAnswerSource(null);
        setIsAnswerLocked(false);
      }, CORRECT_ANSWER_DELAY_MS);

      return true;
    },
    [
      clearTransitionTimeout,
      currentIndex,
      currentWord,
      isAnswerLocked,
      mode,
      profileId,
      progress,
      selectedLevel,
    ],
  );

  const toggleFavorite = useCallback(async () => {
    if (!profileId || !progress || !currentWord) {
      return;
    }

    const updatedProgress = toggleFavoriteInProgress(progress, currentWord);
    await progressStorageService.saveProgress(profileId, updatedProgress);
    setProgress(updatedProgress);
  }, [currentWord, profileId, progress]);

  const skipCurrentItem = useCallback(async () => {
    if (!profileId || !progress || !currentWord || isAnswerLocked || practiceWords.length === 0) {
      return false;
    }

    clearTransitionTimeout();

    const nextOrderIds = moveCurrentItemToEnd(
      practiceWords.map((word) => word.id),
      currentIndex,
    );
    const nextWords = wordsDataService.getWordsByIds(nextOrderIds);
    const nextIndex = getNextIndexAfterSkip(nextWords, currentIndex);
    const nextWord = nextWords[nextIndex] ?? null;

    if (mode === "full") {
      const levelProgress = progress.levels[currentWord.level];
      const updatedProgress: UserProgress = {
        ...progress,
        lastSelectedLevel: selectedLevel,
        levels: {
          ...progress.levels,
          [currentWord.level]: {
            ...levelProgress,
            sessionOrderWordIds: nextOrderIds,
            currentIndex: nextIndex,
            currentWordId: nextWord?.id ?? null,
            updatedAt: new Date().toISOString(),
          },
        },
      };

      await progressStorageService.saveProgress(profileId, updatedProgress);
      setProgress(updatedProgress);
    }

    setPracticeWords(nextWords);
    setPreviousWord(currentWord);
    setCurrentIndex(nextIndex);
    setFeedback({ type: null, message: null });
    setSubmittedAnswer(null);
    setSubmittedAnswerSource(null);
    setIsAnswerLocked(false);
    return true;
  }, [
    clearTransitionTimeout,
    currentIndex,
    currentWord,
    isAnswerLocked,
    mode,
    practiceWords,
    profileId,
    progress,
    selectedLevel,
  ]);

  const restartSelectedLevel = useCallback(async () => {
    if (!profileId || mode !== "full") {
      return;
    }

    clearTransitionTimeout();
    await progressStorageService.resetLevel(profileId, selectedLevel);
    await preparePractice();
  }, [clearTransitionTimeout, mode, preparePractice, profileId, selectedLevel]);

  const isFavorite = Boolean(
    currentWord && progress?.levels[currentWord.level].favoriteWordIds.includes(currentWord.id),
  );

  const stats = currentWord ? progress?.levels[currentWord.level] ?? null : null;

  return useMemo(
    () => ({
      progress,
      practiceWords,
      currentWord,
      currentIndex,
      previousWord,
      totalWords: practiceWords.length,
      isLoading,
      feedback,
      submittedAnswer,
      submittedAnswerSource,
      isAnswerLocked,
      selectedLevel,
      practiceScope,
      isFavorite,
      stats,
      reload: preparePractice,
      submitAnswer,
      skipCurrentItem,
      toggleFavorite,
      restartSelectedLevel,
    }),
    [
      currentIndex,
      currentWord,
      feedback,
      isAnswerLocked,
      isFavorite,
      isLoading,
      practiceScope,
      practiceWords,
      preparePractice,
      previousWord,
      progress,
      restartSelectedLevel,
      selectedLevel,
      skipCurrentItem,
      stats,
      submitAnswer,
      submittedAnswer,
      submittedAnswerSource,
      toggleFavorite,
    ],
  );
}
