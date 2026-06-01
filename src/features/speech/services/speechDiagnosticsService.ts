import { Platform } from "react-native";
import { speechRecognitionService, type SpeechErrorCode } from "./speechRecognitionService";

export type MicrophonePermissionState =
  | "granted"
  | "denied"
  | "prompt"
  | "unsupported"
  | "unknown";

export type SpeechDiagnosticSnapshot = {
  platform: "web" | "ios" | "android" | "unknown";
  userAgent: string | null;
  hasWebSpeechRecognition: boolean;
  hasMicrophonePermissionApi: boolean;
  microphonePermissionState: MicrophonePermissionState;
  isHttps: boolean | null;
  isSupported: boolean;
  lastError: string | null;
  lastErrorCode: SpeechErrorCode | null;
  lastTranscript: string | null;
  lastConfidence: number | null;
};

let lastError: string | null = null;
let lastErrorCode: SpeechErrorCode | null = null;
let lastTranscript: string | null = null;
let lastConfidence: number | null = null;

async function getMicrophonePermissionState(): Promise<MicrophonePermissionState> {
  if (Platform.OS !== "web" || typeof navigator === "undefined") {
    return "unknown";
  }

  if (!navigator.permissions?.query) {
    return "unsupported";
  }

  try {
    const status = await navigator.permissions.query({ name: "microphone" as PermissionName });
    if (status.state === "granted" || status.state === "denied" || status.state === "prompt") {
      return status.state;
    }
    return "unknown";
  } catch {
    return "unsupported";
  }
}

export const speechDiagnosticsService = {
  recordError(error: string | null, code: SpeechErrorCode | null = null): void {
    lastError = error;
    lastErrorCode = code;
  },

  recordTranscript(transcript: string, confidence: number | null = null): void {
    lastTranscript = transcript;
    lastConfidence = confidence;
  },

  clearLastError(): void {
    lastError = null;
    lastErrorCode = null;
  },

  async getSnapshot(): Promise<SpeechDiagnosticSnapshot> {
    const platform =
      Platform.OS === "web" || Platform.OS === "ios" || Platform.OS === "android"
        ? Platform.OS
        : "unknown";
    const hasWebSpeechRecognition = speechRecognitionService.isWebSpeechAvailable();
    const microphonePermissionState = await getMicrophonePermissionState();
    const userAgent =
      Platform.OS === "web" && typeof navigator !== "undefined" ? navigator.userAgent : null;
    const isHttps =
      Platform.OS === "web" && typeof window !== "undefined"
        ? window.location.protocol === "https:" || window.location.hostname === "localhost"
        : null;

    return {
      platform,
      userAgent,
      hasWebSpeechRecognition,
      hasMicrophonePermissionApi:
        Platform.OS === "web" && typeof navigator !== "undefined" && Boolean(navigator.permissions?.query),
      microphonePermissionState,
      isHttps,
      isSupported: speechRecognitionService.isNativeRecognitionAvailable(),
      lastError,
      lastErrorCode,
      lastTranscript,
      lastConfidence,
    };
  },
};
