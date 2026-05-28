import { LessonStatsPanel } from "../../../components/lesson/LessonStatsPanel";
import type { WritingLevelProgress } from "../types";

type WritingStatsPanelProps = {
  stats: WritingLevelProgress | null;
  remaining: number;
};

export function WritingStatsPanel({ stats, remaining }: WritingStatsPanelProps) {
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
