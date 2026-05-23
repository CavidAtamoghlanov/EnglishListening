export type PronunciationSpeed = "slow" | "normal" | "fast";
export type VoiceAccentPreference = "default" | "us" | "uk";

export type ProfileSettings = {
  profileId: string;
  pronunciationSpeed: PronunciationSpeed;
  voiceAccent: VoiceAccentPreference;
  updatedAt: string;
};
