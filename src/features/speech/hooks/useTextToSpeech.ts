import { useCallback } from "react";
import { useVoiceSettings } from "../../settings/hooks/useVoiceSettings";
import { textToSpeechService } from "../services/textToSpeechService";

export function useTextToSpeech(profileId: string | null | undefined) {
  const { settings } = useVoiceSettings(profileId);

  const speak = useCallback(
    async (text: string) => {
      await textToSpeechService.speak(
        text,
        settings?.pronunciationSpeed ?? "normal",
        settings?.voiceAccent ?? "default",
      );
    },
    [settings],
  );

  return {
    speak,
    stop: textToSpeechService.stop,
  };
}
