import {
  BookOpen,
  Flame,
  Heart,
  ListChecks,
  Sparkles,
  Target,
  type LucideProps,
} from "lucide-react-native";
import type { ComponentType } from "react";
import type { UserProgress } from "../features/progress/types";
import { colors } from "../theme/colors";

type HomeModuleContext = {
  progress: UserProgress;
  difficultCount: number;
  favoriteCount: number;
};

export type HomeModuleConfig = {
  id: string;
  kind: "action" | "route" | "dailyGoal" | "streak" | "placeholder";
  title: string;
  description: string | ((context: HomeModuleContext) => string);
  route?: string;
  tone?: "default" | "blue" | "green" | "yellow" | "violet" | "coral";
  icon: ComponentType<LucideProps>;
  iconColor: string;
  visible?: (context: HomeModuleContext) => boolean;
};

export const HOME_MODULES: HomeModuleConfig[] = [
  {
    id: "words",
    kind: "action",
    title: "Words Practice",
    description: "See Azerbaijani words and say them in English.",
    tone: "green",
    icon: BookOpen,
    iconColor: colors.success,
  },
  {
    id: "review-difficult",
    kind: "route",
    title: "Review Difficult Words",
    description: ({ difficultCount }) => `${difficultCount} words need another round.`,
    route: "/words/review-difficult",
    tone: "yellow",
    icon: ListChecks,
    iconColor: colors.warning,
    visible: ({ difficultCount }) => difficultCount > 0,
  },
  {
    id: "favorites",
    kind: "route",
    title: "Favorite Words",
    description: ({ favoriteCount }) => `${favoriteCount} saved words.`,
    route: "/words/favorites",
    tone: "coral",
    icon: Heart,
    iconColor: colors.coral,
    visible: ({ favoriteCount }) => favoriteCount > 0,
  },
  {
    id: "daily-goal",
    kind: "dailyGoal",
    title: "Daily Goal",
    description: ({ progress }) =>
      `Today's goal: ${progress.dailyGoal.completedWords} / ${progress.dailyGoal.targetWords}`,
    icon: Target,
    iconColor: colors.teal,
  },
  {
    id: "streak",
    kind: "streak",
    title: "Streak",
    description: ({ progress }) => `Best streak: ${progress.bestDayStreak} days`,
    tone: "violet",
    icon: Flame,
    iconColor: colors.violet,
  },
  {
    id: "sentence-practice",
    kind: "route",
    title: "Sentence Practice",
    description: "Practice short sentences by speaking aloud.",
    route: "/sentences",
    tone: "blue",
    icon: Sparkles,
    iconColor: colors.primary,
  },
  {
    id: "listening-practice",
    kind: "placeholder",
    title: "Listening Practice",
    description: "Train your listening skills",
    icon: Sparkles,
    iconColor: colors.muted,
  },
  {
    id: "grammar-practice",
    kind: "placeholder",
    title: "Grammar Practice",
    description: "Learn and practice grammar",
    icon: Sparkles,
    iconColor: colors.muted,
  },
];
