import { Platform } from "react-native";
import { ExpoSpeechRecognitionModule } from "expo-speech-recognition";

export type BrowserSpeechRecognitionResult = {
  isFinal?: boolean;
  0?: { transcript?: string; confidence?: number };
};

export type BrowserSpeechRecognitionResultEvent = {
  results: {
    length: number;
    [index: number]: BrowserSpeechRecognitionResult | undefined;
  };
};

export type BrowserSpeechRecognitionErrorEvent = {
  error: string;
  message?: string;
};

export type BrowserSpeechRecognition = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: BrowserSpeechRecognitionErrorEvent) => void) | null;
  onresult: ((event: BrowserSpeechRecognitionResultEvent) => void) | null;
  start: () => void;
  stop: () => void;
};

type WebSpeechRecognitionConstructor = new () => BrowserSpeechRecognition;

type WebSpeechWindow = Window & {
  SpeechRecognition?: WebSpeechRecognitionConstructor;
  webkitSpeechRecognition?: WebSpeechRecognitionConstructor;
};

export type SpeechErrorCode =
  | "not-allowed"
  | "permission-denied"
  | "aborted"
  | "no-speech"
  | "audio-capture"
  | "network"
  | "service-not-allowed"
  | "language-not-supported"
  | "dismissed"
  | "unsupported"
  | "start-failed"
  | "unknown";

export type NormalizedSpeechError = {
  code: SpeechErrorCode;
  message: string;
  isPermissionDenied: boolean;
  isRecoverable: boolean;
  shouldRecommendManualFallback: boolean;
};

function normalizeErrorCode(value: string | null | undefined): SpeechErrorCode {
  const normalized = (value ?? "").toLowerCase().trim();
  if (!normalized) {
    return "unknown";
  }

  if (normalized.includes("unsupported")) {
    return "unsupported";
  }
  if (normalized.includes("start-failed") || normalized.includes("could not start")) {
    return "start-failed";
  }
  if (normalized.includes("dismiss")) {
    return "dismissed";
  }
  if (normalized.includes("permission") && normalized.includes("denied")) {
    return "permission-denied";
  }
  if (normalized.includes("service-not-allowed")) {
    return "service-not-allowed";
  }
  if (normalized.includes("not-allowed")) {
    return "not-allowed";
  }
  if (normalized.includes("no-speech")) {
    return "no-speech";
  }
  if (normalized.includes("audio-capture")) {
    return "audio-capture";
  }
  if (normalized.includes("language")) {
    return "language-not-supported";
  }
  if (normalized.includes("network")) {
    return "network";
  }
  if (normalized.includes("abort")) {
    return "aborted";
  }

  return "unknown";
}

export function normalizeSpeechError(
  error: string | null | undefined,
  options: { manualStop?: boolean } = {},
): NormalizedSpeechError {
  const code = normalizeErrorCode(error);
  const manuallyStopped = Boolean(options.manualStop);
  const isPermissionDenied =
    code === "not-allowed" ||
    code === "permission-denied" ||
    code === "service-not-allowed" ||
    code === "dismissed";
  const isRecoverable =
    code === "no-speech" ||
    code === "aborted" ||
    code === "network" ||
    code === "unknown";
  const shouldRecommendManualFallback =
    isPermissionDenied ||
    code === "audio-capture" ||
    code === "language-not-supported" ||
    code === "unsupported";

  if (manuallyStopped && code === "aborted") {
    return {
      code,
      message: "",
      isPermissionDenied: false,
      isRecoverable: true,
      shouldRecommendManualFallback: false,
    };
  }

  const messageByCode: Record<SpeechErrorCode, string> = {
    "not-allowed": "Microphone permission was not granted. You can still type your answer.",
    "permission-denied": "Microphone permission was denied. You can still type your answer.",
    aborted: "Listening stopped. Tap the microphone again or type your answer.",
    "no-speech": "No speech was detected. Try again or type your answer.",
    "audio-capture": "No microphone was found. Type your answer instead.",
    network: "Speech recognition had a network issue. Try again or type your answer.",
    "service-not-allowed": "Speech recognition is not allowed here. Type your answer instead.",
    "language-not-supported": "English speech recognition is not supported here. Type your answer instead.",
    dismissed: "Microphone permission was dismissed. You can still type your answer.",
    unsupported: "Speech recognition is not supported here. Type your answer instead.",
    "start-failed": "Could not start speech recognition. Try again or type your answer.",
    unknown: "Speech recognition stopped. Try again or type your answer.",
  };

  return {
    code,
    message: messageByCode[code],
    isPermissionDenied,
    isRecoverable,
    shouldRecommendManualFallback,
  };
}

export const speechRecognitionService = {
  getWebSpeechRecognition(): WebSpeechRecognitionConstructor | null {
    if (Platform.OS !== "web" || typeof window === "undefined") {
      return null;
    }

    const speechWindow = window as WebSpeechWindow;
    return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition ?? null;
  },

  isWebSpeechAvailable(): boolean {
    return Boolean(this.getWebSpeechRecognition());
  },

  isNativeRecognitionAvailable(): boolean {
    if (Platform.OS === "web") {
      return this.isWebSpeechAvailable();
    }

    try {
      return ExpoSpeechRecognitionModule.isRecognitionAvailable();
    } catch {
      return false;
    }
  },

  async requestNativePermissions(): Promise<boolean> {
    const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    return result.granted;
  },

  startNativeRecognition(contextualStrings: string[] = [], lang = "en-US"): void {
    ExpoSpeechRecognitionModule.start({
      lang,
      interimResults: true,
      continuous: false,
      contextualStrings,
    });
  },

  stopNativeRecognition(): void {
    ExpoSpeechRecognitionModule.stop();
  },
};
