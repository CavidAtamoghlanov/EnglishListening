import { useCallback, useEffect, useState } from "react";
import { sentenceProgressStorageService } from "../services/sentenceProgressStorageService";
import type { UserSentenceProgress } from "../types";

export function useSentenceProgress(profileId: string | null | undefined) {
  const [progress, setProgress] = useState<UserSentenceProgress | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(profileId));

  const reload = useCallback(async () => {
    if (!profileId) {
      setProgress(null);
      setIsLoading(false);
      return null;
    }

    setIsLoading(true);
    const stored = await sentenceProgressStorageService.getProgress(profileId);
    setProgress(stored);
    setIsLoading(false);
    return stored;
  }, [profileId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const saveProgress = useCallback(
    async (updated: UserSentenceProgress) => {
      if (!profileId) {
        return;
      }
      await sentenceProgressStorageService.saveProgress(profileId, updated);
      setProgress(updated);
    },
    [profileId],
  );

  return { progress, isLoading, reload, saveProgress, setProgress };
}
