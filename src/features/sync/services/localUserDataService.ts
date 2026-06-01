import { profileStorageService } from "../../profile/services/profileStorageService";
import type { UserProfile } from "../../profile/types";
import { progressStorageService } from "../../progress/services/progressStorageService";
import { sentenceProgressStorageService } from "../../sentences/services/sentenceProgressStorageService";
import { grammarProgressStorageService } from "../../grammar/services/grammarProgressStorageService";
import { writingProgressStorageService } from "../../writing/services/writingProgressStorageService";
import { settingsStorageService } from "../../settings/services/settingsStorageService";
import { learningEventStorageService } from "../../learning/services/learningEventStorageService";
import { reviewQueueStorageService } from "../../learning/services/reviewQueueStorageService";
import { xpService } from "../../learning/services/xpService";
import { dailyPathService } from "../../learning/services/dailyPathService";
import type { SafeUser, UserCloudData } from "../types";
import { USER_CLOUD_SCHEMA_VERSION } from "../utils/cloudData";

function profileFromUser(user: SafeUser, existing?: UserProfile | null): UserProfile {
  const now = new Date().toISOString();
  return {
    id: user.userId,
    name: user.displayName,
    avatarEmoji: user.avatar,
    createdAt: existing?.createdAt ?? user.createdAt ?? now,
    updatedAt: now,
    lastActiveAt: now,
  };
}

export const localUserDataService = {
  async ensureLocalProfile(user: SafeUser): Promise<UserProfile> {
    const profiles = await profileStorageService.getProfiles();
    const existing = profiles.find((profile) => profile.id === user.userId) ?? null;
    const profile = profileFromUser(user, existing);
    const others = profiles.filter((item) => item.id !== user.userId);
    await profileStorageService.saveProfiles([profile, ...others]);
    return profile;
  },

  async createCloudDataFromProfile(profileId: string, user: SafeUser): Promise<UserCloudData> {
    const [
      settings,
      wordProgress,
      sentenceProgress,
      grammarProgress,
      writingProgress,
      learningEvents,
      reviewQueue,
      xp,
      dailyPath,
    ] = await Promise.all([
      settingsStorageService.getSettings(profileId),
      progressStorageService.getProgress(profileId),
      sentenceProgressStorageService.getProgress(profileId),
      grammarProgressStorageService.getProgress(profileId),
      writingProgressStorageService.getProgress(profileId),
      learningEventStorageService.getEvents(profileId),
      reviewQueueStorageService.getReviewItems(profileId),
      xpService.getXP(profileId),
      dailyPathService.getDailyPath(profileId),
    ]);

    const now = new Date().toISOString();
    return {
      schemaVersion: USER_CLOUD_SCHEMA_VERSION,
      userId: user.userId,
      email: user.email,
      username: user.username,
      profile: {
        displayName: user.displayName,
        avatar: user.avatar,
        activeLevel: wordProgress.lastSelectedLevel ?? undefined,
        createdAt: user.createdAt,
        updatedAt: now,
      },
      settings,
      wordProgress,
      sentenceProgress,
      grammarProgress,
      writingProgress,
      learningEvents,
      reviewQueue,
      xp,
      dailyPath,
      favorites: null,
      difficultItems: null,
      statistics: null,
      sync: {
        updatedAt: now,
        lastPushedAt: now,
        revision: 1,
      },
    };
  },

  async applyCloudDataToLocal(data: UserCloudData, user: SafeUser): Promise<UserProfile> {
    const profile = await this.ensureLocalProfile({
      ...user,
      displayName: data.profile.displayName,
      avatar: data.profile.avatar,
    });
    const profileId = user.userId;

    if (data.settings) {
      await settingsStorageService.saveSettings(profileId, data.settings as Awaited<ReturnType<typeof settingsStorageService.getSettings>>);
    }
    if (data.wordProgress) {
      await progressStorageService.saveProgress(profileId, data.wordProgress as Awaited<ReturnType<typeof progressStorageService.getProgress>>);
    }
    if (data.sentenceProgress) {
      await sentenceProgressStorageService.saveProgress(
        profileId,
        data.sentenceProgress as Awaited<ReturnType<typeof sentenceProgressStorageService.getProgress>>,
      );
    }
    if (data.grammarProgress) {
      await grammarProgressStorageService.saveProgress(
        profileId,
        data.grammarProgress as Awaited<ReturnType<typeof grammarProgressStorageService.getProgress>>,
      );
    }
    if (data.writingProgress) {
      await writingProgressStorageService.saveProgress(
        profileId,
        data.writingProgress as Awaited<ReturnType<typeof writingProgressStorageService.getProgress>>,
      );
    }
    if (Array.isArray(data.learningEvents)) {
      await learningEventStorageService.saveEvents(profileId, data.learningEvents as Awaited<ReturnType<typeof learningEventStorageService.getEvents>>);
    }
    if (Array.isArray(data.reviewQueue)) {
      await reviewQueueStorageService.saveReviewItems(
        profileId,
        data.reviewQueue as Awaited<ReturnType<typeof reviewQueueStorageService.getReviewItems>>,
      );
    }
    if (data.xp) {
      await xpService.saveXP(profileId, data.xp as Awaited<ReturnType<typeof xpService.getXP>>);
    }

    return profile;
  },
};
