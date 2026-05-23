import { useCallback, useMemo, useRef, useState } from "react";
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
  const [state, setState] = useState<SpeechRecognitionState>({
    isAvailable: speechRecognitionService.isNativeRecognitionAvailable(),
    isListening: false,
    transcript: "",
    error: null,
    permissionDenied: false,
  });

  useSpeechRecognitionEvent("start", () => {
    if (Platform.OS !== "web") {
      setState((current) => ({ ...current, isListening: true, error: null }));
    }
  });

  useSpeechRecognitionEvent("end", () => {
    if (Platform.OS !== "web") {
      setState((current) => ({ ...current, isListening: false }));
    }
  });

  useSpeechRecognitionEvent("result", (event) => {
    if (Platform.OS !== "web") {
      const transcript = event.results[0]?.transcript ?? "";
      setState((current) => ({ ...current, transcript }));
      options.onResult?.(transcript, event.isFinal);
    }
  });

  useSpeechRecognitionEvent("error", (event) => {
    if (Platform.OS !== "web") {
      setState((current) => ({
        ...current,
        isListening: false,
        error: event.message,
        permissionDenied: event.error === "not-allowed",
      }));
    }
  });

  const start = useCallback(async () => {
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
        setState((current) => ({ ...current, isListening: true, error: null }));
      };
      recognition.onend = () => {
        setState((current) => ({ ...current, isListening: false }));
      };
      recognition.onerror = (event: BrowserSpeechRecognitionErrorEvent) => {
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
        options.onResult?.(transcript, result?.isFinal ?? false);
      };

      recognitionRef.current = recognition;
      recognition.start();
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

    speechRecognitionService.startNativeRecognition(options.contextualStrings ?? []);
  }, [options]);

  const stop = useCallback(() => {
    if (Platform.OS === "web") {
      recognitionRef.current?.stop();
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
