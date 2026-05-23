import { useCallback, useEffect, useState } from "react";
import { progressStorageService } from "../../progress/services/progressStorageService";

export function useFirstTimeModal(profileId: string | null | undefined) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(Boolean(profileId));

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!profileId) {
        setIsLoading(false);
        return;
      }

      const progress = await progressStorageService.getProgress(profileId);
      if (mounted) {
        setIsVisible(!progress.wordsIntroSeen);
        setIsLoading(false);
      }
    }

    void load();
    return () => {
      mounted = false;
    };
  }, [profileId]);

  const markSeen = useCallback(async () => {
    if (!profileId) {
      setIsVisible(false);
      return;
    }

    await progressStorageService.markWordsIntroSeen(profileId);
    setIsVisible(false);
  }, [profileId]);

  return { isVisible, isLoading, setIsVisible, markSeen };
}
