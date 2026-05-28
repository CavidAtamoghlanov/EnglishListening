import { storageKeys, storageService } from "../../../storage/storageService";
import type { UserWritingProgress, WritingLevel, WritingPracticeMode } from "../types";
import {
  createEmptyWritingLevelProgress,
  createEmptyWritingProgress,
  WRITING_PRACTICE_MODES,
} from "../utils/writingProgress";

export function mergeWritingProgress(
  profileId: string,
  stored: UserWritingProgress | null,
): UserWritingProgress {
  const empty = createEmptyWritingProgress(profileId);
  if (!stored) {
    return empty;
  }

  const levels = { ...empty.levels };
  for (const mode of WRITING_PRACTICE_MODES) {
    levels[mode] = { ...empty.levels[mode] };
    for (const level of Object.keys(empty.levels[mode]) as WritingLevel[]) {
      levels[mode][level] = {
        ...empty.levels[mode][level],
        ...stored.levels?.[mode]?.[level],
        mode,
        level,
      };
    }
  }

  return {
    ...empty,
    ...stored,
    profileId,
    levels,
  };
}

export const writingProgressStorageService = {
  async getProgress(profileId: string): Promise<UserWritingProgress> {
    const stored = await storageService.getJson<UserWritingProgress | null>(
      storageKeys.writingProgress(profileId),
      null,
    );
    return mergeWritingProgress(profileId, stored);
  },

  async saveProgress(profileId: string, progress: UserWritingProgress): Promise<void> {
    await storageService.setJson(storageKeys.writingProgress(profileId), {
      ...progress,
      profileId,
    });
  },

  async resetLevel(
    profileId: string,
    mode: WritingPracticeMode,
    level: WritingLevel,
  ): Promise<UserWritingProgress> {
    const progress = await this.getProgress(profileId);
    const updated: UserWritingProgress = {
      ...progress,
      lastSelectedMode: progress.lastSelectedMode === mode ? null : progress.lastSelectedMode,
      lastSelectedLevel: progress.lastSelectedLevel === level ? null : progress.lastSelectedLevel,
      levels: {
        ...progress.levels,
        [mode]: {
          ...progress.levels[mode],
          [level]: createEmptyWritingLevelProgress(mode, level),
        },
      },
    };
    await this.saveProgress(profileId, updated);
    return updated;
  },

  async deleteProgress(profileId: string): Promise<void> {
    await storageService.remove(storageKeys.writingProgress(profileId));
  },
};
