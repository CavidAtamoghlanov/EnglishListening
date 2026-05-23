import { storageKeys, storageService } from "../../../storage/storageService";
import type { CEFRLevel, UserProgress } from "../types";
import {
  createEmptyLevelProgress,
  createEmptyProgress,
  ensureDailyGoalForToday,
} from "../utils/progressUtils";

export const progressStorageService = {
  async getProgress(profileId: string): Promise<UserProgress> {
    const progress = await storageService.getJson<UserProgress>(
      storageKeys.progress(profileId),
      createEmptyProgress(profileId),
    );
    const normalized = ensureDailyGoalForToday({
      ...createEmptyProgress(profileId),
      ...progress,
      profileId,
      levels: {
        ...createEmptyProgress(profileId).levels,
        ...progress.levels,
      },
    });

    if (normalized.dailyGoal.date !== progress.dailyGoal?.date) {
      await this.saveProgress(profileId, normalized);
    }

    return normalized;
  },

  async createProgress(profileId: string): Promise<UserProgress> {
    const progress = createEmptyProgress(profileId);
    await this.saveProgress(profileId, progress);
    return progress;
  },

  async saveProgress(profileId: string, progress: UserProgress): Promise<void> {
    await storageService.setJson(storageKeys.progress(profileId), {
      ...progress,
      profileId,
    });
  },

  async resetLevel(profileId: string, level: CEFRLevel): Promise<UserProgress> {
    const progress = await this.getProgress(profileId);
    const updated: UserProgress = {
      ...progress,
      lastSelectedLevel: progress.lastSelectedLevel === level ? null : progress.lastSelectedLevel,
      levels: {
        ...progress.levels,
        [level]: createEmptyLevelProgress(level),
      },
    };
    await this.saveProgress(profileId, updated);
    return updated;
  },

  async resetAll(profileId: string): Promise<UserProgress> {
    return this.createProgress(profileId);
  },

  async markWordsIntroSeen(profileId: string): Promise<UserProgress> {
    const progress = await this.getProgress(profileId);
    const updated = { ...progress, wordsIntroSeen: true };
    await this.saveProgress(profileId, updated);
    return updated;
  },

  async deleteProgress(profileId: string): Promise<void> {
    await storageService.remove(storageKeys.progress(profileId));
  },
};
