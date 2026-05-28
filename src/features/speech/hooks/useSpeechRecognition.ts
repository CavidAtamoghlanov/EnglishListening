import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Platform } from "react-native";
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from "expo-speech-recognition";
import {
  type BrowserSpeechRecognition,
  type BrowserSpeechRecognitionErrorEvent,
  type BrowserSpeechRecognitionResultEvent,
  speechRecognitionService,
} from "../services/speechRecognitionService";
import type { SpeechRecognitionState } from "../types";

type UseSpeechRecognitionOptions = {
  contextualStrings?: string[];
  onResult?: (transcript: string, isFinal: boolean) => void;
};

export function useSpeechRecognition(options: UseSpeechRecognitionOptions = {}) {
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const optionsRef = useRef(options);
  const isListeningRef = useRef(false);
  const [state, setState] = useState<SpeechRecognitionState>({
    isAvailable: speechRecognitionService.isNativeRecognitionAvailable(),
    isListening: false,
    transcript: "",
    error: null,
    permissionDenied: false,
  });

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const updateListening = useCallback((isListening: boolean) => {
    isListeningRef.current = isListening;
    setState((current) => ({ ...current, isListening }));
  }, []);

  useSpeechRecognitionEvent("start", () => {
    if (Platform.OS !== "web") {
      isListeningRef.current = true;
      setState((current) => ({ ...current, isListening: true, error: null }));
    }
  });

  useSpeechRecognitionEvent("end", () => {
    if (Platform.OS !== "web") {
      updateListening(false);
    }
  });

  useSpeechRecognitionEvent("result", (event) => {
    if (Platform.OS !== "web") {
      const transcript = event.results[0]?.transcript ?? "";
      setState((current) => ({ ...current, transcript }));
      optionsRef.current.onResult?.(transcript, event.isFinal);
    }
  });

  useSpeechRecognitionEvent("error", (event) => {
    if (Platform.OS !== "web") {
      isListeningRef.current = false;
      setState((current) => ({
        ...current,
        isListening: false,
        error: event.message,
        permissionDenied: event.error === "not-allowed",
      }));
    }
  });

  const start = useCallback(async () => {
    if (isListeningRef.current) {
      return;
    }

    setState((current) => ({ ...current, transcript: "", error: null }));

    if (Platform.OS === "web") {
      const WebSpeechRecognition = speechRecognitionService.getWebSpeechRecognition();
      if (!WebSpeechRecognition) {
        setState((current) => ({
          ...current,
          isAvailable: false,
          error: "Speech recognition is not available in this browser.",
        }));
        return;
      }

      const recognition = new WebSpeechRecognition();
      recognition.lang = "en-US";
      recognition.interimResults = true;
      recognition.continuous = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        isListeningRef.current = true;
        setState((current) => ({ ...current, isListening: true, error: null }));
      };
      recognition.onend = () => {
        updateListening(false);
      };
      recognition.onerror = (event: BrowserSpeechRecognitionErrorEvent) => {
        isListeningRef.current = false;
        setState((current) => ({
          ...current,
          isListening: false,
          error: event.error === "not-allowed" ? "Microphone permission was denied." : event.error,
          permissionDenied: event.error === "not-allowed",
        }));
      };
      recognition.onresult = (event: BrowserSpeechRecognitionResultEvent) => {
        const result = event.results[event.results.length - 1];
        const transcript = result?.[0]?.transcript ?? "";
        setState((current) => ({ ...current, transcript }));
        optionsRef.current.onResult?.(transcript, result?.isFinal ?? false);
      };

      recognitionRef.current = recognition;
      try {
        recognition.start();
      } catch (error) {
        isListeningRef.current = false;
        setState((current) => ({
          ...current,
          isListening: false,
          error: error instanceof Error ? error.message : "Could not start speech recognition.",
        }));
      }
      return;
    }

    if (!speechRecognitionService.isNativeRecognitionAvailable()) {
      setState((current) => ({
        ...current,
        isAvailable: false,
        error: "Speech recognition is not available on this device.",
      }));
      return;
    }

    const granted = await speechRecognitionService.requestNativePermissions();
    if (!granted) {
      setState((current) => ({
        ...current,
        permissionDenied: true,
        error: "Microphone or speech recognition permission was denied.",
      }));
      return;
    }

    speechRecognitionService.startNativeRecognition(optionsRef.current.contextualStrings ?? []);
  }, [updateListening]);

  const stop = useCallback(() => {
    isListeningRef.current = false;
    if (Platform.OS === "web") {
      recognitionRef.current?.stop();
      setState((current) => ({ ...current, isListening: false }));
      return;
    }
    ExpoSpeechRecognitionModule.stop();
  }, []);

  return useMemo(
    () => ({
      ...state,
      start,
      stop,
      manualFallbackRecommended:
        !state.isAvailable || Boolean(state.error) || state.permissionDenied,
    }),
    [state, start, stop],
  );
}
