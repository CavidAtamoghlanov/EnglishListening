import { WRITING_DATA_BY_MODE } from "../../../data/writing";
import { WRITING_LEVEL_IDS } from "../config/levels";
import type { WritingItem, WritingLevel, WritingPracticeMode } from "../types";
import { WRITING_PRACTICE_MODES } from "../utils/writingProgress";

const itemById = new Map<string, WritingItem>();

for (const mode of WRITING_PRACTICE_MODES) {
  for (const level of WRITING_LEVEL_IDS) {
    WRITING_DATA_BY_MODE[mode][level].forEach((item) => {
      itemById.set(item.id, item);
    });
  }
}

export const writingDataService = {
  getItemsByModeAndLevel(mode: WritingPracticeMode, level: WritingLevel): WritingItem[] {
    return WRITING_DATA_BY_MODE[mode][level] ?? [];
  },

  getItemCount(mode: WritingPracticeMode, level: WritingLevel): number {
    return this.getItemsByModeAndLevel(mode, level).length;
  },

  getItemsByIds(ids: string[]): WritingItem[] {
    return ids
      .map((id) => itemById.get(id))
      .filter((item): item is WritingItem => Boolean(item));
  },

  getItemById(id: string): WritingItem | null {
    return itemById.get(id) ?? null;
  },
};
