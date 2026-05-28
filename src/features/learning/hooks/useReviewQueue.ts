import { useCallback, useEffect, useState } from "react";
import type { LearningModule, ReviewItem } from "../types";
import { reviewQueueStorageService } from "../services/reviewQueueStorageService";

export type ReviewQueueFilter = LearningModule | "all";

export function useReviewQueue(
  profileId: string | null | undefined,
  filter: ReviewQueueFilter = "all",
) {
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [isLoading, setIsLoading] = useState(Boolean(profileId));

  const reload = useCallback(async () => {
    if (!profileId) {
      setItems([]);
      setIsLoading(false);
      return [];
    }

    setIsLoading(true);
    const dueItems = await reviewQueueStorageService.getDueReviewItems(profileId, filter);
    setItems(dueItems);
    setIsLoading(false);
    return dueItems;
  }, [filter, profileId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { items, isLoading, reload };
}
