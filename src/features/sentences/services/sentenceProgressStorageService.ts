import { storageKeys, storageService } from "../../../storage/storageService";
import type { SentenceLevel, SentencePracticeMode, UserSentenceProgress } from "../types";
import { createEmptySentenceLevelProgress } from "../utils/sentenceProgressUtils";
import { mergeSentenceProgress } from "./sentencePracticeService";

export const sentenceProgressStorageService = {
  async getProgress(profileId: string): Promise<UserSentenceProgress> {
    const stored = await storageService.getJson<UserSentenceProgress | null>(
      storageKeys.sentenceProgress(profileId),
      null,
    );
    return mergeSentenceProgress(profileId, stored);
  },

  async saveProgress(profileId: string, progress: UserSentenceProgress): Promise<void> {
    await storageService.setJson(storageKeys.sentenceProgress(profileId), {
      ...progress,
      profileId,
    });
  },

  async resetLevel(
    profileId: string,
    mode: SentencePracticeMode,
    level: SentenceLevel,
  ): Promise<UserSentenceProgress> {
    const progress = await this.getProgress(profileId);
    const updated: UserSentenceProgress = {
      ...progress,
      lastSelectedMode: progress.lastSelectedMode === mode ? null : progress.lastSelectedMode,
      lastSelectedLevel: progress.lastSelectedLevel === level ? null : progress.lastSelectedLevel,
      levels: {
        ...progress.levels,
        [mode]: {
          ...progress.levels[mode],
          [level]: createEmptySentenceLevelProgress(mode, level),
        },
      },
    };
    await this.saveProgress(profileId, updated);
    return updated;
  },

  async deleteProgress(profileId: string): Promise<void> {
    await storageService.remove(storageKeys.sentenceProgress(profileId));
  },
};
