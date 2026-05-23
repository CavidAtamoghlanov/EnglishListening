import * as Speech from "expo-speech";
import type { PronunciationSpeed, VoiceAccentPreference } from "../../settings/types";

function rateForSpeed(speed: PronunciationSpeed): number {
  if (speed === "slow") {
    return 0.72;
  }
  if (speed === "fast") {
    return 1.16;
  }
  return 0.95;
}

function languageForAccent(accent: VoiceAccentPreference): string {
  if (accent === "uk") {
    return "en-GB";
  }
  if (accent === "us") {
    return "en-US";
  }
  return "en";
}

export const textToSpeechService = {
  async speak(
    text: string,
    speed: PronunciationSpeed = "normal",
    accent: VoiceAccentPreference = "default",
  ): Promise<void> {
    const language = languageForAccent(accent);
    let voice: string | undefined;

    try {
      const voices = await Speech.getAvailableVoicesAsync();
      voice = voices.find((item) => item.language?.startsWith(language))?.identifier;
    } catch {
      voice = undefined;
    }

    Speech.stop();
    Speech.speak(text, {
      language: language === "en" ? "en-US" : language,
      voice,
      rate: rateForSpeed(speed),
      pitch: 1,
    });
  },

  stop(): void {
    Speech.stop();
  },
};
