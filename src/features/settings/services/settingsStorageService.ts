import { storageKeys, storageService } from "../../../storage/storageService";
import type { ProfileSettings } from "../types";

export function createDefaultSettings(profileId: string): ProfileSettings {
  return {
    profileId,
    pronunciationSpeed: "normal",
    voiceAccent: "default",
    updatedAt: new Date().toISOString(),
  };
}

export const settingsStorageService = {
  async getSettings(profileId: string): Promise<ProfileSettings> {
    const settings = await storageService.getJson<ProfileSettings>(
      storageKeys.settings(profileId),
      createDefaultSettings(profileId),
    );

    return {
      ...createDefaultSettings(profileId),
      ...settings,
      profileId,
    };
  },

  async saveSettings(profileId: string, settings: ProfileSettings): Promise<void> {
    await storageService.setJson(storageKeys.settings(profileId), {
      ...settings,
      profileId,
      updatedAt: new Date().toISOString(),
    });
  },

  async updateSettings(
    profileId: string,
    patch: Partial<Omit<ProfileSettings, "profileId">>,
  ): Promise<ProfileSettings> {
    const current = await this.getSettings(profileId);
    const updated = {
      ...current,
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    await this.saveSettings(profileId, updated);
    return updated;
  },

  async deleteSettings(profileId: string): Promise<void> {
    await storageService.remove(storageKeys.settings(profileId));
  },
};
