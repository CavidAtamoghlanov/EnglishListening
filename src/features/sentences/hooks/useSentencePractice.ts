import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CORRECT_SENTENCE_DELAY_MS } from "../constants";
import {
  applySentenceAnswer,
  prepareSentenceSession,
  type SentencePracticeFeedback,
} from "../services/sentencePracticeService";
import { getNextIndexAfterSkip, moveCurrentItemToEnd } from "../../practice/utils/queue";
import { sentenceDataService } from "../services/sentenceDataService";
import { sentenceProgressStorageService } from "../services/sentenceProgressStorageService";
import type { SentenceItem, SentenceLevel, SentencePracticeMode } from "../types";
import { isSentenceAnswerCorrect } from "../utils/sentenceAnswer";
import { learningRecorderService } from "../../learning/services/learningRecorderService";

export type SubmittedSentenceSource = "speech" | "manual";

function sentenceAtIndex(sentences: SentenceItem[], index: number): SentenceItem | null {
  if (index < 0 || index >= sentences.length) {
    return null;
  }
  return sentences[index] ?? null;
}

export function useSentencePractice(
  profileId: string | null | undefined,
  mode: SentencePracticeMode,
  level: SentenceLevel,
) {
  const [progress, setProgress] = useState<Awaited<
    ReturnType<typeof sentenceProgressStorageService.getProgress>
  > | null>(null);
  const [practiceSentences, setPracticeSentences] = useState<SentenceItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [previousSentence, setPreviousSentence] = useState<SentenceItem | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(profileId));
  const [feedback, setFeedback] = useState<SentencePracticeFeedback>({ type: null, message: null });
  const [submittedAnswer, setSubmittedAnswer] = useState<string | null>(null);
  const [submittedAnswerSource, setSubmittedAnswerSource] = useState<SubmittedSentenceSource | null>(
    null,
  );
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
    setSubmittedAnswerSource(null);
    setFeedback({ type: null, message: null });

    if (!profileId) {
      setProgress(null);
      setPracticeSentences([]);
      setPreviousSentence(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const storedProgress = await sentenceProgressStorageService.getProgress(profileId);
    const prepared = prepareSentenceSession({
      profileId,
      progress: storedProgress,
      mode,
      level,
    });

    await sentenceProgressStorageService.saveProgress(profileId, prepared.progress);
    setPracticeSentences(prepared.sentences);
    setCurrentIndex(prepared.currentIndex);
    setPreviousSentence(sentenceAtIndex(prepared.sentences, prepared.currentIndex - 1));
    setProgress(prepared.progress);
    setIsLoading(false);
  }, [clearTransitionTimeout, level, mode, profileId]);

  useEffect(() => {
    void preparePractice();
  }, [preparePractice]);

  const currentSentence = practiceSentences[currentIndex] ?? null;

  const submitAnswer = useCallback(
    async (answer: string, source: SubmittedSentenceSource) => {
      if (!profileId || !progress || !currentSentence || isAnswerLocked || submissionInFlightRef.current) {
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
        const alreadyCompleted = levelProgress.completedSentenceIds.includes(currentSentence.id);

        if (alreadyCompleted) {
          const correct = isSentenceAnswerCorrect(currentSentence, trimmed);
          setFeedback({
            type: correct ? "correct" : "wrong",
            message: correct ? "Great!" : "Try again. Say the full sentence clearly.",
          });
          setSubmittedAnswer(trimmed);
          setSubmittedAnswerSource(source);
          await learningRecorderService.recordPracticeResult({
            profileId,
            module: "sentences",
            activityType: "speak",
            level: currentSentence.level,
            itemId: currentSentence.id,
            prompt: mode === "translate" ? currentSentence.azeri : currentSentence.english,
            correctAnswer: currentSentence.english,
            userAnswer: trimmed,
            result: correct ? "correct" : "wrong",
            explanationAz: currentSentence.azeri,
            awardXp: false,
          });

          if (!correct) {
            return false;
          }

          const nextIndex = currentIndex + 1;
          const updatedProgress = {
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
                  currentSentenceId: levelProgress.sessionOrderSentenceIds[nextIndex] ?? null,
                  updatedAt: new Date().toISOString(),
                },
              },
            },
          };

          await sentenceProgressStorageService.saveProgress(profileId, updatedProgress);
          setProgress(updatedProgress);

          const completedSentence = currentSentence;
          setIsAnswerLocked(true);

          transitionTimeoutRef.current = setTimeout(() => {
            transitionTimeoutRef.current = null;
            setPreviousSentence(completedSentence);
            setCurrentIndex(nextIndex);
            setFeedback({ type: null, message: null });
            setSubmittedAnswer(null);
            setSubmittedAnswerSource(null);
            setIsAnswerLocked(false);
          }, CORRECT_SENTENCE_DELAY_MS);

          return true;
        }

        const result = applySentenceAnswer({
          progress,
          currentSentence,
          answer: trimmed,
          currentIndex,
          mode,
          level,
        });

        await sentenceProgressStorageService.saveProgress(profileId, result.progress);
        setProgress(result.progress);
        setFeedback(result.feedback);
        setSubmittedAnswer(trimmed);
        setSubmittedAnswerSource(source);
        await learningRecorderService.recordPracticeResult({
          profileId,
          module: "sentences",
          activityType: "speak",
          level: currentSentence.level,
          itemId: currentSentence.id,
          prompt: mode === "translate" ? currentSentence.azeri : currentSentence.english,
          correctAnswer: currentSentence.english,
          userAnswer: trimmed,
          result: result.correct ? "correct" : "wrong",
          explanationAz: currentSentence.azeri,
          awardXp: result.correct,
          streakCount: result.progress.levels[mode][level].currentStreak,
        });

        if (!result.correct) {
          return false;
        }

        const completedSentence = currentSentence;
        setIsAnswerLocked(true);

        transitionTimeoutRef.current = setTimeout(() => {
          transitionTimeoutRef.current = null;
          setPreviousSentence(completedSentence);
          setCurrentIndex(result.nextIndex);
          setFeedback({ type: null, message: null });
          setSubmittedAnswer(null);
          setSubmittedAnswerSource(null);
          setIsAnswerLocked(false);
        }, CORRECT_SENTENCE_DELAY_MS);

        return true;
      } finally {
        submissionInFlightRef.current = false;
      }
    },
    [
      clearTransitionTimeout,
      currentIndex,
      currentSentence,
      isAnswerLocked,
      level,
      mode,
      profileId,
      progress,
    ],
  );

  const goToPreviousSentence = useCallback(async () => {
    if (!profileId || !progress || currentIndex <= 0 || isAnswerLocked || practiceSentences.length === 0) {
      return false;
    }

    clearTransitionTimeout();

    const nextIndex = currentIndex - 1;
    const nextSentence = practiceSentences[nextIndex] ?? null;
    if (!nextSentence) {
      return false;
    }

    const levelProgress = progress.levels[mode][level];
    const updatedProgress = {
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
            currentSentenceId: nextSentence.id,
            updatedAt: new Date().toISOString(),
          },
        },
      },
    };

    await sentenceProgressStorageService.saveProgress(profileId, updatedProgress);
    setProgress(updatedProgress);
    setPreviousSentence(sentenceAtIndex(practiceSentences, nextIndex - 1));
    setCurrentIndex(nextIndex);
    setFeedback({ type: null, message: null });
    setSubmittedAnswer(null);
    setSubmittedAnswerSource(null);
    setIsAnswerLocked(false);
    return true;
  }, [
    clearTransitionTimeout,
    currentIndex,
    isAnswerLocked,
    level,
    mode,
    practiceSentences,
    profileId,
    progress,
  ]);

  const restartLevel = useCallback(async () => {
    if (!profileId) {
      return;
    }
    clearTransitionTimeout();
    await sentenceProgressStorageService.resetLevel(profileId, mode, level);
    await preparePractice();
  }, [clearTransitionTimeout, level, mode, preparePractice, profileId]);

  const skipCurrentSentence = useCallback(async () => {
    if (
      !profileId ||
      !progress ||
      !currentSentence ||
      isAnswerLocked ||
      practiceSentences.length === 0
    ) {
      return false;
    }

    clearTransitionTimeout();
    const skippedSentence = currentSentence;

    const nextOrderIds = moveCurrentItemToEnd(
      practiceSentences.map((sentence) => sentence.id),
      currentIndex,
    );
    const nextSentences = sentenceDataService.getSentencesByIds(nextOrderIds);
    const nextIndex = getNextIndexAfterSkip(nextSentences, currentIndex);
    const nextSentence = nextSentences[nextIndex] ?? null;
    const levelProgress = progress.levels[mode][level];
    const updatedProgress = {
      ...progress,
      lastSelectedMode: mode,
      lastSelectedLevel: level,
      levels: {
        ...progress.levels,
        [mode]: {
          ...progress.levels[mode],
          [level]: {
            ...levelProgress,
            sessionOrderSentenceIds: nextOrderIds,
            currentIndex: nextIndex,
            currentSentenceId: nextSentence?.id ?? null,
            updatedAt: new Date().toISOString(),
          },
        },
      },
    };

    await sentenceProgressStorageService.saveProgress(profileId, updatedProgress);
    setProgress(updatedProgress);
    setPracticeSentences(nextSentences);
    setPreviousSentence(skippedSentence);
    setCurrentIndex(nextIndex);
    setFeedback({ type: null, message: null });
    setSubmittedAnswer(null);
    setSubmittedAnswerSource(null);
    setIsAnswerLocked(false);
    await learningRecorderService.recordPracticeResult({
      profileId,
      module: "sentences",
      activityType: "speak",
      level: skippedSentence.level,
      itemId: skippedSentence.id,
      prompt: mode === "translate" ? skippedSentence.azeri : skippedSentence.english,
      correctAnswer: skippedSentence.english,
      result: "skipped",
      explanationAz: skippedSentence.azeri,
      awardXp: false,
    });
    return true;
  }, [
    clearTransitionTimeout,
    currentIndex,
    currentSentence,
    isAnswerLocked,
    level,
    mode,
    practiceSentences,
    profileId,
    progress,
  ]);

  const stats = progress?.levels[mode][level] ?? null;

  return useMemo(
    () => ({
      progress,
      practiceSentences,
      currentSentence,
      currentIndex,
      previousSentence,
      totalSentences: practiceSentences.length,
      isLoading,
      feedback,
      submittedAnswer,
      submittedAnswerSource,
      isAnswerLocked,
      stats,
      reload: preparePractice,
      submitAnswer,
      skipCurrentSentence,
      goToPreviousSentence,
      canGoPrevious: currentIndex > 0 && !isAnswerLocked,
      restartLevel,
    }),
    [
      currentIndex,
      currentSentence,
      feedback,
      isAnswerLocked,
      isLoading,
      practiceSentences,
      preparePractice,
      previousSentence,
      progress,
      restartLevel,
      goToPreviousSentence,
      skipCurrentSentence,
      stats,
      submitAnswer,
      submittedAnswer,
      submittedAnswerSource,
    ],
  );
}
