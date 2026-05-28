import { useCallback, useEffect, useState } from "react";
import { grammarProgressStorageService } from "../services/grammarProgressStorageService";
import type { UserGrammarProgress } from "../types";

export function useGrammarProgress(profileId: string | null | undefined) {
  const [progress, setProgress] = useState<UserGrammarProgress | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(profileId));

  const reload = useCallback(async () => {
    if (!profileId) {
      setProgress(null);
      setIsLoading(false);
      return null;
    }

    setIsLoading(true);
    const stored = await grammarProgressStorageService.getProgress(profileId);
    setProgress(stored);
    setIsLoading(false);
    return stored;
  }, [profileId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const saveProgress = useCallback(
    async (updated: UserGrammarProgress) => {
      if (!profileId) {
        return;
      }
      await grammarProgressStorageService.saveProgress(profileId, updated);
      setProgress(updated);
    },
    [profileId],
  );

  return { progress, isLoading, reload, saveProgress, setProgress };
}
