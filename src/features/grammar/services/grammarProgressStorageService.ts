import { storageKeys, storageService } from "../../../storage/storageService";
import type { GrammarLevel, GrammarPracticeMode, UserGrammarProgress } from "../types";
import {
  createEmptyGrammarLevelProgress,
  createEmptyGrammarProgress,
  GRAMMAR_PRACTICE_MODES,
} from "../utils/grammarProgress";

export function mergeGrammarProgress(
  profileId: string,
  stored: UserGrammarProgress | null,
): UserGrammarProgress {
  const empty = createEmptyGrammarProgress(profileId);
  if (!stored) {
    return empty;
  }

  const levels = { ...empty.levels };
  for (const mode of GRAMMAR_PRACTICE_MODES) {
    levels[mode] = { ...empty.levels[mode] };
    for (const level of Object.keys(empty.levels[mode]) as GrammarLevel[]) {
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

export const grammarProgressStorageService = {
  async getProgress(profileId: string): Promise<UserGrammarProgress> {
    const stored = await storageService.getJson<UserGrammarProgress | null>(
      storageKeys.grammarProgress(profileId),
      null,
    );
    return mergeGrammarProgress(profileId, stored);
  },

  async saveProgress(profileId: string, progress: UserGrammarProgress): Promise<void> {
    await storageService.setJson(storageKeys.grammarProgress(profileId), {
      ...progress,
      profileId,
    });
  },

  async resetLevel(
    profileId: string,
    mode: GrammarPracticeMode,
    level: GrammarLevel,
  ): Promise<UserGrammarProgress> {
    const progress = await this.getProgress(profileId);
    const updated: UserGrammarProgress = {
      ...progress,
      lastSelectedMode: progress.lastSelectedMode === mode ? null : progress.lastSelectedMode,
      lastSelectedLevel: progress.lastSelectedLevel === level ? null : progress.lastSelectedLevel,
      levels: {
        ...progress.levels,
        [mode]: {
          ...progress.levels[mode],
          [level]: createEmptyGrammarLevelProgress(mode, level),
        },
      },
    };
    await this.saveProgress(profileId, updated);
    return updated;
  },

  async deleteProgress(profileId: string): Promise<void> {
    await storageService.remove(storageKeys.grammarProgress(profileId));
  },
};
