import { useCallback, useEffect, useState } from "react";
import { writingProgressStorageService } from "../services/writingProgressStorageService";
import type { UserWritingProgress } from "../types";

export function useWritingProgress(profileId: string | null | undefined) {
  const [progress, setProgress] = useState<UserWritingProgress | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(profileId));

  const reload = useCallback(async () => {
    if (!profileId) {
      setProgress(null);
      setIsLoading(false);
      return null;
    }

    setIsLoading(true);
    const stored = await writingProgressStorageService.getProgress(profileId);
    setProgress(stored);
    setIsLoading(false);
    return stored;
  }, [profileId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const saveProgress = useCallback(
    async (updated: UserWritingProgress) => {
      if (!profileId) {
        return;
      }
      await writingProgressStorageService.saveProgress(profileId, updated);
      setProgress(updated);
    },
    [profileId],
  );

  return { progress, isLoading, reload, saveProgress, setProgress };
}
