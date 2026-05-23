import { Heart, ListChecks, type LucideProps } from "lucide-react-native";
import type { ComponentType } from "react";
import type { LevelProgress } from "../features/progress/types";
import { colors } from "../theme/colors";

export type ReviewProgressField = "difficultWordIds" | "favoriteWordIds";

export const REVIEW_MODE_CONFIG = {
  full: {
    id: "full",
    title: "Words Practice",
    emptyIcon: "!",
    emptyTitle: "No words found",
    emptyMessage: "There are no words for this level yet.",
    progressField: null,
    tone: "green",
    icon: ListChecks,
    iconColor: colors.success,
  },
  difficult: {
    id: "difficult",
    title: "Difficult Words",
    emptyIcon: "OK",
    emptyTitle: "No difficult words",
    emptyMessage: "Words will appear here after repeated wrong attempts.",
    progressField: "difficultWordIds",
    tone: "yellow",
    icon: ListChecks,
    iconColor: colors.warning,
  },
  favorites: {
    id: "favorites",
    title: "Favorite Words",
    emptyIcon: "*",
    emptyTitle: "No favorites yet",
    emptyMessage: "Tap the star during practice to save words here.",
    progressField: "favoriteWordIds",
    tone: "coral",
    icon: Heart,
    iconColor: colors.coral,
  },
} as const satisfies Record<
  string,
  {
    id: string;
    title: string;
    emptyIcon: string;
    emptyTitle: string;
    emptyMessage: string;
    progressField: ReviewProgressField | null;
    tone: "default" | "blue" | "green" | "yellow" | "violet" | "coral";
    icon: ComponentType<LucideProps>;
    iconColor: string;
  }
>;

export type PracticeMode = keyof typeof REVIEW_MODE_CONFIG;
export type ReviewPracticeMode = Exclude<PracticeMode, "full">;

export function isPracticeMode(value: unknown): value is PracticeMode {
  return typeof value === "string" && value in REVIEW_MODE_CONFIG;
}

export function parsePracticeMode(value: string | string[] | undefined): PracticeMode {
  const raw = Array.isArray(value) ? value[0] : value;
  return isPracticeMode(raw) ? raw : "full";
}

export function getPracticeModeConfig(mode: PracticeMode) {
  return REVIEW_MODE_CONFIG[mode];
}

export function getReviewWordIds(levelProgress: LevelProgress, mode: ReviewPracticeMode): string[] {
  return levelProgress[REVIEW_MODE_CONFIG[mode].progressField];
}
