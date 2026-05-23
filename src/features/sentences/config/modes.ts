import { Languages, Mic } from "lucide-react-native";
import type { LucideProps } from "lucide-react-native";
import type { ComponentType } from "react";
import type { SentencePracticeMode } from "../types";
import { colors } from "../../../theme/colors";

export type SentenceModeConfig = {
  id: SentencePracticeMode;
  title: string;
  subtitle: string;
  description: string;
  icon: ComponentType<LucideProps>;
  iconColor: string;
};

export const SENTENCE_MODES: SentenceModeConfig[] = [
  {
    id: "repeat",
    title: "Repeat English Sentences",
    subtitle: "See an English sentence and say it aloud.",
    description: "Read the English sentence and speak it clearly.",
    icon: Mic,
    iconColor: colors.primary,
  },
  {
    id: "translate",
    title: "Translate & Speak",
    subtitle: "See an Azerbaijani sentence and say it in English.",
    description: "Translate in your head, then speak the English version.",
    icon: Languages,
    iconColor: colors.teal,
  },
];

export function getSentenceModeConfig(mode: SentencePracticeMode) {
  return SENTENCE_MODES.find((item) => item.id === mode) ?? SENTENCE_MODES[0];
}

export function isSentencePracticeMode(value: unknown): value is SentencePracticeMode {
  return value === "repeat" || value === "translate";
}

export function parseSentenceModeParam(
  value: string | string[] | undefined,
): SentencePracticeMode | null {
  const raw = Array.isArray(value) ? value[0] : value;
  return isSentencePracticeMode(raw) ? raw : null;
}
