import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CORRECT_SENTENCE_DELAY_MS } from "../constants";
import {
  applySentenceAnswer,
  prepareSentenceSession,
  type SentencePracticeFeedback,
} from "../services/sentencePracticeService";
import { sentenceProgressStorageService } from "../services/sentenceProgressStorageService";
import type { SentenceItem, SentenceLevel, SentencePracticeMode } from "../types";

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
      if (!profileId || !progress || !currentSentence || isAnswerLocked) {
        return false;
      }

      const trimmed = answer.trim();
      if (!trimmed) {
        return false;
      }

      clearTransitionTimeout();

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

  const restartLevel = useCallback(async () => {
    if (!profileId) {
      return;
    }
    clearTransitionTimeout();
    await sentenceProgressStorageService.resetLevel(profileId, mode, level);
    await preparePractice();
  }, [clearTransitionTimeout, level, mode, preparePractice, profileId]);

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
      stats,
      submitAnswer,
      submittedAnswer,
      submittedAnswerSource,
    ],
  );
}
