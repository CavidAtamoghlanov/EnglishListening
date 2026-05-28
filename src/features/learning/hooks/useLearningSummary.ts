import { useCallback, useEffect, useState } from "react";
import type { DailyPath, ReviewItem, UserXP } from "../types";
import { dailyPathService } from "../services/dailyPathService";
import { reviewQueueStorageService } from "../services/reviewQueueStorageService";
import { xpService } from "../services/xpService";

export type LearningSummary = {
  xp: UserXP;
  dueReviewItems: ReviewItem[];
  dailyPath: DailyPath;
};

export function useLearningSummary(profileId: string | null | undefined) {
  const [summary, setSummary] = useState<LearningSummary | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(profileId));

  const reload = useCallback(async () => {
    if (!profileId) {
      setSummary(null);
      setIsLoading(false);
      return null;
    }

    setIsLoading(true);
    const [xp, dueReviewItems, dailyPath] = await Promise.all([
      xpService.getXP(profileId),
      reviewQueueStorageService.getDueReviewItems(profileId),
      dailyPathService.getDailyPath(profileId),
    ]);
    const nextSummary = { xp, dueReviewItems, dailyPath };
    setSummary(nextSummary);
    setIsLoading(false);
    return nextSummary;
  }, [profileId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { summary, isLoading, reload };
}
