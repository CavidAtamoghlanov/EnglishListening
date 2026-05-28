import { LessonStatsPanel } from "../../../components/lesson/LessonStatsPanel";
import type { GrammarExerciseProgress } from "../types";

type GrammarStatsPanelProps = {
  stats: GrammarExerciseProgress | null;
  remaining: number;
};

export function GrammarStatsPanel({ stats, remaining }: GrammarStatsPanelProps) {
  return (
    <LessonStatsPanel
      attempts={stats?.totalAttempts ?? 0}
      correct={stats?.correctCount ?? 0}
      wrong={stats?.wrongCount ?? 0}
      streak={stats?.currentStreak ?? 0}
      best={stats?.bestStreak ?? 0}
      remaining={remaining}
    />
  );
}
