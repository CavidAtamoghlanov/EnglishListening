import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Platform } from "react-native";
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from "expo-speech-recognition";
import {
  type BrowserSpeechRecognition,
  type BrowserSpeechRecognitionErrorEvent,
  type BrowserSpeechRecognitionResultEvent,
  normalizeSpeechError,
  speechRecognitionService,
} from "../services/speechRecognitionService";
import { speechDiagnosticsService } from "../services/speechDiagnosticsService";
import type { SpeechRecognitionState } from "../types";

type UseSpeechRecognitionOptions = {
  contextualStrings?: string[];
  onResult?: (transcript: string, isFinal: boolean) => void;
};

export function useSpeechRecognition(options: UseSpeechRecognitionOptions = {}) {
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const optionsRef = useRef(options);
  const isListeningRef = useRef(false);
  const manuallyStoppedRef = useRef(false);
  const [state, setState] = useState<SpeechRecognitionState>({
    isAvailable: speechRecognitionService.isNativeRecognitionAvailable(),
    isListening: false,
    transcript: "",
    interimTranscript: "",
    error: null,
    errorCode: null,
    lastConfidence: null,
    permissionDenied: false,
    isRecoverableError: false,
    shouldRecommendManualFallback: false,
  });

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const updateListening = useCallback((isListening: boolean) => {
    isListeningRef.current = isListening;
    setState((current) => ({ ...current, isListening }));
  }, []);

  const applySpeechError = useCallback((rawError: string | null | undefined) => {
    const normalized = normalizeSpeechError(rawError, {
      manualStop: manuallyStoppedRef.current,
    });

    if (!normalized.message) {
      speechDiagnosticsService.clearLastError();
      setState((current) => ({
        ...current,
        isListening: false,
        error: null,
        errorCode: null,
        permissionDenied: false,
        isRecoverableError: true,
        shouldRecommendManualFallback: false,
      }));
      return;
    }

    speechDiagnosticsService.recordError(normalized.message, normalized.code);
    setState((current) => ({
      ...current,
      isListening: false,
      error: normalized.message,
      errorCode: normalized.code,
      permissionDenied: normalized.isPermissionDenied,
      isRecoverableError: normalized.isRecoverable,
      shouldRecommendManualFallback: normalized.shouldRecommendManualFallback,
    }));
  }, []);

  useSpeechRecognitionEvent("start", () => {
    if (Platform.OS !== "web") {
      manuallyStoppedRef.current = false;
      isListeningRef.current = true;
      setState((current) => ({
        ...current,
        isListening: true,
        error: null,
        errorCode: null,
        permissionDenied: false,
        isRecoverableError: false,
        shouldRecommendManualFallback: false,
      }));
    }
  });

  useSpeechRecognitionEvent("end", () => {
    if (Platform.OS !== "web") {
      updateListening(false);
    }
  });

  useSpeechRecognitionEvent("result", (event) => {
    if (Platform.OS !== "web") {
      const result = event.results[0] as { transcript?: string; confidence?: number } | undefined;
      const transcript = result?.transcript ?? "";
      const confidence = typeof result?.confidence === "number" ? result.confidence : null;
      speechDiagnosticsService.recordTranscript(transcript, confidence);
      setState((current) => ({
        ...current,
        transcript: event.isFinal ? transcript : current.transcript,
        interimTranscript: event.isFinal ? "" : transcript,
        lastConfidence: confidence,
      }));
      optionsRef.current.onResult?.(transcript, event.isFinal);
    }
  });

  useSpeechRecognitionEvent("error", (event) => {
    if (Platform.OS !== "web") {
      isListeningRef.current = false;
      applySpeechError(event.message || event.error);
    }
  });

  const start = useCallback(async () => {
    if (isListeningRef.current) {
      return;
    }

    manuallyStoppedRef.current = false;
    speechDiagnosticsService.clearLastError();
    setState((current) => ({
      ...current,
      transcript: "",
      interimTranscript: "",
      error: null,
      errorCode: null,
      lastConfidence: null,
      permissionDenied: false,
      isRecoverableError: false,
      shouldRecommendManualFallback: false,
    }));

    if (Platform.OS === "web") {
      const WebSpeechRecognition = speechRecognitionService.getWebSpeechRecognition();
      if (!WebSpeechRecognition) {
        const normalized = normalizeSpeechError("unsupported");
        speechDiagnosticsService.recordError(normalized.message, normalized.code);
        setState((current) => ({
          ...current,
          isAvailable: false,
          error: normalized.message,
          errorCode: normalized.code,
          shouldRecommendManualFallback: true,
        }));
        return;
      }

      const recognition = new WebSpeechRecognition();
      recognition.lang = "en-US";
      recognition.interimResults = true;
      recognition.continuous = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        manuallyStoppedRef.current = false;
        isListeningRef.current = true;
        setState((current) => ({
          ...current,
          isListening: true,
          error: null,
          errorCode: null,
          permissionDenied: false,
          isRecoverableError: false,
          shouldRecommendManualFallback: false,
        }));
      };
      recognition.onend = () => {
        updateListening(false);
      };
      recognition.onerror = (event: BrowserSpeechRecognitionErrorEvent) => {
        isListeningRef.current = false;
        applySpeechError(event.message ?? event.error);
      };
      recognition.onresult = (event: BrowserSpeechRecognitionResultEvent) => {
        const result = event.results[event.results.length - 1];
        const transcript = result?.[0]?.transcript ?? "";
        const confidence =
          typeof result?.[0]?.confidence === "number" ? result[0].confidence : null;
        const isFinal = result?.isFinal ?? false;
        speechDiagnosticsService.recordTranscript(transcript, confidence);
        setState((current) => ({
          ...current,
          transcript: isFinal ? transcript : current.transcript,
          interimTranscript: isFinal ? "" : transcript,
          lastConfidence: confidence,
        }));
        optionsRef.current.onResult?.(transcript, isFinal);
      };

      recognitionRef.current = recognition;
      try {
        recognition.start();
      } catch (error) {
        isListeningRef.current = false;
        const normalized = normalizeSpeechError(
          error instanceof Error ? error.message : "start-failed",
        );
        speechDiagnosticsService.recordError(normalized.message, normalized.code);
        setState((current) => ({
          ...current,
          isListening: false,
          error: normalized.message,
          errorCode: normalized.code,
          permissionDenied: normalized.isPermissionDenied,
          isRecoverableError: normalized.isRecoverable,
          shouldRecommendManualFallback: normalized.shouldRecommendManualFallback,
        }));
      }
      return;
    }

    if (!speechRecognitionService.isNativeRecognitionAvailable()) {
      const normalized = normalizeSpeechError("unsupported");
      speechDiagnosticsService.recordError(normalized.message, normalized.code);
      setState((current) => ({
        ...current,
        isAvailable: false,
        error: normalized.message,
        errorCode: normalized.code,
        shouldRecommendManualFallback: true,
      }));
      return;
    }

    let granted = false;
    try {
      granted = await speechRecognitionService.requestNativePermissions();
    } catch (error) {
      const normalized = normalizeSpeechError(
        error instanceof Error ? error.message : "permission-denied",
      );
      speechDiagnosticsService.recordError(normalized.message, normalized.code);
      setState((current) => ({
        ...current,
        permissionDenied: normalized.isPermissionDenied,
        error: normalized.message,
        errorCode: normalized.code,
        shouldRecommendManualFallback: normalized.shouldRecommendManualFallback,
      }));
      return;
    }

    if (!granted) {
      const normalized = normalizeSpeechError("permission-denied");
      speechDiagnosticsService.recordError(normalized.message, normalized.code);
      setState((current) => ({
        ...current,
        permissionDenied: true,
        error: normalized.message,
        errorCode: normalized.code,
        shouldRecommendManualFallback: true,
      }));
      return;
    }

    try {
      speechRecognitionService.startNativeRecognition(optionsRef.current.contextualStrings ?? []);
    } catch (error) {
      const normalized = normalizeSpeechError(
        error instanceof Error ? error.message : "start-failed",
      );
      speechDiagnosticsService.recordError(normalized.message, normalized.code);
      setState((current) => ({
        ...current,
        isListening: false,
        error: normalized.message,
        errorCode: normalized.code,
        permissionDenied: normalized.isPermissionDenied,
        isRecoverableError: normalized.isRecoverable,
        shouldRecommendManualFallback: normalized.shouldRecommendManualFallback,
      }));
    }
  }, [applySpeechError, updateListening]);

  const stop = useCallback(() => {
    manuallyStoppedRef.current = true;
    isListeningRef.current = false;
    if (Platform.OS === "web") {
      recognitionRef.current?.stop();
      setState((current) => ({ ...current, isListening: false }));
      return;
    }
    ExpoSpeechRecognitionModule.stop();
  }, []);

  const resetTranscript = useCallback(() => {
    setState((current) => ({ ...current, transcript: "", interimTranscript: "" }));
  }, []);

  return useMemo(
    () => ({
      ...state,
      start,
      stop,
      resetTranscript,
      manualFallbackRecommended:
        !state.isAvailable || state.permissionDenied || state.shouldRecommendManualFallback,
    }),
    [state, start, stop, resetTranscript],
  );
}
