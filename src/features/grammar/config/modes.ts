import { ClipboardCheck, Languages } from "lucide-react-native";
import type { LucideProps } from "lucide-react-native";
import type { ComponentType } from "react";
import { colors } from "../../../theme/colors";
import type { GrammarPracticeMode } from "../types";

export type GrammarModeConfig = {
  id: GrammarPracticeMode;
  title: string;
  subtitle: string;
  description: string;
  icon: ComponentType<LucideProps>;
  iconColor: string;
};

export const GRAMMAR_MODES: GrammarModeConfig[] = [
  {
    id: "translate-write",
    title: "Translate & Write",
    subtitle: "See Azerbaijani and write English.",
    description: "Build full English sentences from practical Azerbaijani prompts.",
    icon: Languages,
    iconColor: colors.secondary,
  },
  {
    id: "fix-complete",
    title: "Fix & Complete",
    subtitle: "Complete, reorder, or correct English sentences.",
    description: "Practice forms, word order, articles, prepositions, and tenses.",
    icon: ClipboardCheck,
    iconColor: colors.progress,
  },
];

export function getGrammarModeConfig(mode: GrammarPracticeMode) {
  return GRAMMAR_MODES.find((item) => item.id === mode) ?? GRAMMAR_MODES[0]!;
}

export function isGrammarPracticeMode(value: unknown): value is GrammarPracticeMode {
  return value === "translate-write" || value === "fix-complete";
}

export function parseGrammarModeParam(
  value: string | string[] | undefined,
): GrammarPracticeMode | null {
  const raw = Array.isArray(value) ? value[0] : value;
  return isGrammarPracticeMode(raw) ? raw : null;
}

