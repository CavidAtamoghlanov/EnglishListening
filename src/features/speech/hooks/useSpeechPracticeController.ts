import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSpeechRecognition } from "./useSpeechRecognition";

type UseSpeechPracticeControllerOptions = {
  contextualStrings?: string[];
  canListen: boolean;
  hasActiveItem: boolean;
  itemKey: string | null;
  restartDelayMs?: number;
  onFinalResult: (transcript: string) => void;
  onTranscript?: (transcript: string, isFinal: boolean) => void;
};

export function useSpeechPracticeController({
  contextualStrings,
  canListen,
  hasActiveItem,
  itemKey,
  restartDelayMs = 500,
  onFinalResult,
  onTranscript,
}: UseSpeechPracticeControllerOptions) {
  const [isContinuousMode, setIsContinuousModeState] = useState(false);
  const continuousModeRef = useRef(false);
  const manuallyStoppedRef = useRef(false);
  const restartTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastFinalSpeechKeyRef = useRef<string | null>(null);

  const clearRestartTimeout = useCallback(() => {
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
  }, []);

  const handleResult = useCallback(
    (transcript: string, isFinal: boolean) => {
      onTranscript?.(transcript, isFinal);
      if (!isFinal || !transcript.trim() || !canListen || !hasActiveItem) {
        return;
      }

      const finalKey = `${itemKey ?? "none"}:${transcript.trim().toLowerCase()}`;
      if (lastFinalSpeechKeyRef.current === finalKey) {
        return;
      }

      lastFinalSpeechKeyRef.current = finalKey;
      onFinalResult(transcript);
    },
    [canListen, hasActiveItem, itemKey, onFinalResult, onTranscript],
  );

  const speech = useSpeechRecognition({
    contextualStrings,
    onResult: handleResult,
  });
  const {
    start,
    stop,
    resetTranscript: resetSpeechTranscript,
    isListening,
    transcript,
    interimTranscript,
    error,
    errorCode,
    permissionDenied,
    manualFallbackRecommended,
  } = speech;

  const setContinuousMode = useCallback((enabled: boolean) => {
    continuousModeRef.current = enabled;
    setIsContinuousModeState(enabled);
  }, []);

  const startListening = useCallback(async () => {
    if (!canListen || !hasActiveItem || manualFallbackRecommended) {
      return;
    }

    manuallyStoppedRef.current = false;
    setContinuousMode(true);
    if (!isListening) {
      await start();
    }
  }, [canListen, hasActiveItem, isListening, manualFallbackRecommended, setContinuousMode, start]);

  const stopListening = useCallback(() => {
    manuallyStoppedRef.current = true;
    clearRestartTimeout();
    setContinuousMode(false);
    stop();
  }, [clearRestartTimeout, setContinuousMode, stop]);

  const toggleListening = useCallback(() => {
    if (continuousModeRef.current || isListening) {
      stopListening();
      return;
    }

    void startListening();
  }, [isListening, startListening, stopListening]);

  const resetTranscript = useCallback(() => {
    lastFinalSpeechKeyRef.current = null;
    resetSpeechTranscript();
  }, [resetSpeechTranscript]);

  useEffect(() => {
    lastFinalSpeechKeyRef.current = null;
    resetSpeechTranscript();
  }, [itemKey, resetSpeechTranscript]);

  useEffect(() => {
    clearRestartTimeout();

    if (
      !isContinuousMode ||
      manuallyStoppedRef.current ||
      !canListen ||
      !hasActiveItem ||
      isListening ||
      manualFallbackRecommended
    ) {
      return;
    }

    restartTimeoutRef.current = setTimeout(() => {
      restartTimeoutRef.current = null;
      if (
        continuousModeRef.current &&
        !manuallyStoppedRef.current &&
        canListen &&
        hasActiveItem &&
        !manualFallbackRecommended &&
        !isListening
      ) {
        void start();
      }
    }, restartDelayMs);

    return clearRestartTimeout;
  }, [
    canListen,
    clearRestartTimeout,
    hasActiveItem,
    isListening,
    isContinuousMode,
    manualFallbackRecommended,
    restartDelayMs,
    start,
  ]);

  useEffect(() => {
    if (!hasActiveItem && isContinuousMode) {
      stopListening();
    }
  }, [hasActiveItem, isContinuousMode, stopListening]);

  useEffect(
    () => () => {
      clearRestartTimeout();
      stop();
    },
    [clearRestartTimeout, stop],
  );

  return useMemo(
    () => ({
      isListening,
      isContinuousMode,
      isMicActive: isContinuousMode || isListening,
      transcript,
      interimTranscript,
      lastError: error,
      errorCode,
      permissionDenied,
      manualFallbackRecommended,
      startListening,
      stopListening,
      toggleListening,
      setContinuousMode,
      resetTranscript,
    }),
    [
      error,
      errorCode,
      interimTranscript,
      isContinuousMode,
      isListening,
      manualFallbackRecommended,
      permissionDenied,
      resetTranscript,
      setContinuousMode,
      startListening,
      stopListening,
      toggleListening,
      transcript,
    ],
  );
}
