import { useCallback, useEffect, useState } from "react";
import { profileStorageService } from "../services/profileStorageService";
import type { UserProfile } from "../types";

export function useProfiles() {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    setIsLoading(true);
    const stored = await profileStorageService.getProfiles();
    setProfiles(stored);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const createProfile = useCallback(
    async (name: string, avatarEmoji?: string) => {
      const profile = await profileStorageService.createProfile(name, avatarEmoji);
      await reload();
      return profile;
    },
    [reload],
  );

  const renameProfile = useCallback(
    async (profileId: string, name: string) => {
      await profileStorageService.updateProfile(profileId, { name });
      await reload();
    },
    [reload],
  );

  const updateAvatar = useCallback(
    async (profileId: string, avatarEmoji: string) => {
      await profileStorageService.updateProfile(profileId, { avatarEmoji });
      await reload();
    },
    [reload],
  );

  const deleteProfile = useCallback(
    async (profileId: string) => {
      await profileStorageService.deleteProfile(profileId);
      await reload();
    },
    [reload],
  );

  return {
    profiles,
    isLoading,
    reload,
    createProfile,
    renameProfile,
    updateAvatar,
    deleteProfile,
  };
}
