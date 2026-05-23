import { useCallback, useEffect, useState } from "react";
import { progressStorageService } from "../services/progressStorageService";
import type { UserProgress } from "../types";

export function useProgress(profileId: string | null | undefined) {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(profileId));

  const reload = useCallback(async () => {
    if (!profileId) {
      setProgress(null);
      setIsLoading(false);
      return null;
    }

    setIsLoading(true);
    const stored = await progressStorageService.getProgress(profileId);
    setProgress(stored);
    setIsLoading(false);
    return stored;
  }, [profileId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const saveProgress = useCallback(
    async (updated: UserProgress) => {
      if (!profileId) {
        return;
      }
      await progressStorageService.saveProgress(profileId, updated);
      setProgress(updated);
    },
    [profileId],
  );

  return { progress, isLoading, reload, saveProgress, setProgress };
}
