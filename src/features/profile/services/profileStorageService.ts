import { storageKeys, storageService } from "../../../storage/storageService";
import { createId } from "../../../utils/ids";
import { progressStorageService } from "../../progress/services/progressStorageService";
import { sentenceProgressStorageService } from "../../sentences/services/sentenceProgressStorageService";
import { settingsStorageService } from "../../settings/services/settingsStorageService";
import type { UserProfile } from "../types";

export const PROFILE_AVATARS = [
  "\u{1F642}",
  "\u{1F604}",
  "\u{1F60E}",
  "\u{1F31F}",
  "\u{1F3A7}",
  "\u{1F4DA}",
  "\u{1F680}",
  "\u2600\uFE0F",
];

function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

export const profileStorageService = {
  async getProfiles(): Promise<UserProfile[]> {
    const profiles = await storageService.getJson<UserProfile[]>(storageKeys.profiles, []);
    return profiles.sort(
      (a, b) => new Date(b.lastActiveAt).getTime() - new Date(a.lastActiveAt).getTime(),
    );
  },

  async saveProfiles(profiles: UserProfile[]): Promise<void> {
    await storageService.setJson(storageKeys.profiles, profiles);
  },

  async createProfile(name: string, avatarEmoji = PROFILE_AVATARS[0]): Promise<UserProfile> {
    const now = new Date().toISOString();
    const profile: UserProfile = {
      id: createId("profile"),
      name: normalizeName(name),
      avatarEmoji,
      createdAt: now,
      updatedAt: now,
      lastActiveAt: now,
    };

    const profiles = await this.getProfiles();
    await this.saveProfiles([profile, ...profiles]);
    await progressStorageService.createProgress(profile.id);
    await settingsStorageService.saveSettings(
      profile.id,
      await settingsStorageService.getSettings(profile.id),
    );
    return profile;
  },

  async updateProfile(
    profileId: string,
    patch: Partial<Pick<UserProfile, "name" | "avatarEmoji" | "lastActiveAt">>,
  ): Promise<UserProfile | null> {
    const profiles = await this.getProfiles();
    let updatedProfile: UserProfile | null = null;
    const now = new Date().toISOString();
    const updatedProfiles = profiles.map((profile) => {
      if (profile.id !== profileId) {
        return profile;
      }

      updatedProfile = {
        ...profile,
        ...patch,
        name: patch.name ? normalizeName(patch.name) : profile.name,
        updatedAt: now,
      };
      return updatedProfile;
    });

    await this.saveProfiles(updatedProfiles);
    return updatedProfile;
  },

  async touchProfile(profileId: string): Promise<UserProfile | null> {
    return this.updateProfile(profileId, { lastActiveAt: new Date().toISOString() });
  },

  async deleteProfile(profileId: string): Promise<void> {
    const profiles = await this.getProfiles();
    await this.saveProfiles(profiles.filter((profile) => profile.id !== profileId));
    await progressStorageService.deleteProgress(profileId);
    await sentenceProgressStorageService.deleteProgress(profileId);
    await settingsStorageService.deleteSettings(profileId);
  },
};
