import { FilePenLine, Languages, Volume2 } from "lucide-react-native";
import type { LucideProps } from "lucide-react-native";
import type { ComponentType } from "react";
import { colors } from "../../../theme/colors";
import type { WritingPracticeMode } from "../types";

export type WritingModeConfig = {
  id: WritingPracticeMode;
  title: string;
  subtitle: string;
  description: string;
  icon: ComponentType<LucideProps>;
  iconColor: string;
};

export const WRITING_MODES: WritingModeConfig[] = [
  {
    id: "az-to-en",
    title: "Azerbaijani → English",
    subtitle: "See Azerbaijani and write English.",
    description: "Write practical English words, phrases, and sentences from Azerbaijani prompts.",
    icon: Languages,
    iconColor: colors.secondary,
  },
  {
    id: "fix-english",
    title: "Fix the English",
    subtitle: "Correct wrong English words and sentences.",
    description: "Practice word order, articles, verb forms, and professional sentence fixes.",
    icon: FilePenLine,
    iconColor: colors.progress,
  },
  {
    id: "listen-write",
    title: "Listen & Write",
    subtitle: "Listen and type what you hear.",
    description: "Use audio replay, then write the exact English word, phrase, or sentence.",
    icon: Volume2,
    iconColor: colors.primary,
  },
];

export function getWritingModeConfig(mode: WritingPracticeMode) {
  return WRITING_MODES.find((item) => item.id === mode) ?? WRITING_MODES[0]!;
}

export function isWritingPracticeMode(value: unknown): value is WritingPracticeMode {
  return value === "az-to-en" || value === "fix-english" || value === "listen-write";
}

export function parseWritingModeParam(
  value: string | string[] | undefined,
): WritingPracticeMode | null {
  const raw = Array.isArray(value) ? value[0] : value;
  return isWritingPracticeMode(raw) ? raw : null;
}
