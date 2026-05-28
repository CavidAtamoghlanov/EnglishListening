import { useCallback, useEffect, useRef, useState } from "react";

type SpeechControls = {
  isListening: boolean;
  manualFallbackRecommended: boolean;
  start: () => Promise<void> | void;
  stop: () => void;
};

type ContinuousListeningOptions = {
  speech: SpeechControls;
  canListen: boolean;
  hasActiveItem: boolean;
  restartDelayMs?: number;
};

export function useContinuousListening({
  speech,
  canListen,
  hasActiveItem,
  restartDelayMs = 450,
}: ContinuousListeningOptions) {
  const { isListening, manualFallbackRecommended, start, stop } = speech;
  const [isContinuousListening, setIsContinuousListening] = useState(false);
  const continuousRef = useRef(false);
  const restartTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stopOnUnmountRef = useRef<() => void>(() => undefined);

  const clearRestartTimeout = useCallback(() => {
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
  }, []);

  const stopContinuousListening = useCallback(() => {
    clearRestartTimeout();
    continuousRef.current = false;
    setIsContinuousListening(false);
    stop();
  }, [clearRestartTimeout, stop]);

  const startContinuousListening = useCallback(() => {
    if (!canListen || !hasActiveItem || manualFallbackRecommended) {
      return;
    }

    continuousRef.current = true;
    setIsContinuousListening(true);
    if (!isListening) {
      void start();
    }
  }, [canListen, hasActiveItem, isListening, manualFallbackRecommended, start]);

  const toggleContinuousListening = useCallback(() => {
    if (continuousRef.current || isListening) {
      stopContinuousListening();
      return;
    }

    startContinuousListening();
  }, [isListening, startContinuousListening, stopContinuousListening]);

  useEffect(() => {
    clearRestartTimeout();

    if (
      !isContinuousListening ||
      !canListen ||
      !hasActiveItem ||
      isListening ||
      manualFallbackRecommended
    ) {
      return;
    }

    restartTimeoutRef.current = setTimeout(() => {
      restartTimeoutRef.current = null;
      if (continuousRef.current && canListen && hasActiveItem && !manualFallbackRecommended) {
        void start();
      }
    }, restartDelayMs);

    return clearRestartTimeout;
  }, [
    canListen,
    clearRestartTimeout,
    hasActiveItem,
    isListening,
    isContinuousListening,
    manualFallbackRecommended,
    restartDelayMs,
    start,
  ]);

  useEffect(() => {
    if (!hasActiveItem && isContinuousListening) {
      stopContinuousListening();
    }
  }, [hasActiveItem, isContinuousListening, stopContinuousListening]);

  useEffect(() => {
    if (manualFallbackRecommended && isContinuousListening) {
      stopContinuousListening();
    }
  }, [isContinuousListening, manualFallbackRecommended, stopContinuousListening]);

  useEffect(() => {
    stopOnUnmountRef.current = stopContinuousListening;
  }, [stopContinuousListening]);

  useEffect(
    () => () => {
      stopOnUnmountRef.current();
    },
    [],
  );

  return {
    isContinuousListening,
    isMicActive: isContinuousListening || isListening,
    startContinuousListening,
    stopContinuousListening,
    toggleContinuousListening,
  };
}
