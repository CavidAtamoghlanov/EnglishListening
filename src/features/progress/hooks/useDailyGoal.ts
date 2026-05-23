import { useMemo } from "react";
import { useProgress } from "./useProgress";

export function useDailyGoal(profileId: string | null | undefined) {
  const progressState = useProgress(profileId);

  const dailyGoalPercent = useMemo(() => {
    const goal = progressState.progress?.dailyGoal;
    if (!goal || goal.targetWords <= 0) {
      return 0;
    }
    return Math.min(100, Math.round((goal.completedWords / goal.targetWords) * 100));
  }, [progressState.progress]);

  return {
    ...progressState,
    dailyGoalPercent,
  };
}
