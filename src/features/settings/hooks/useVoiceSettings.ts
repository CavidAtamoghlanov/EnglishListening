import { useCallback, useEffect, useState } from "react";
import { settingsStorageService } from "../services/settingsStorageService";
import type { ProfileSettings } from "../types";

export function useVoiceSettings(profileId: string | null | undefined) {
  const [settings, setSettings] = useState<ProfileSettings | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(profileId));

  const reload = useCallback(async () => {
    if (!profileId) {
      setSettings(null);
      setIsLoading(false);
      return null;
    }

    setIsLoading(true);
    const stored = await settingsStorageService.getSettings(profileId);
    setSettings(stored);
    setIsLoading(false);
    return stored;
  }, [profileId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const updateSettings = useCallback(
    async (patch: Partial<Omit<ProfileSettings, "profileId">>) => {
      if (!profileId) {
        return null;
      }
      const updated = await settingsStorageService.updateSettings(profileId, patch);
      setSettings(updated);
      return updated;
    },
    [profileId],
  );

  return { settings, isLoading, reload, updateSettings };
}
