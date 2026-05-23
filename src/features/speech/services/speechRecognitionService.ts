import { Platform } from "react-native";
import { ExpoSpeechRecognitionModule } from "expo-speech-recognition";

export type BrowserSpeechRecognitionResult = {
  isFinal?: boolean;
  0?: { transcript?: string };
};

export type BrowserSpeechRecognitionResultEvent = {
  results: {
    length: number;
    [index: number]: BrowserSpeechRecognitionResult | undefined;
  };
};

export type BrowserSpeechRecognitionErrorEvent = {
  error: string;
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
