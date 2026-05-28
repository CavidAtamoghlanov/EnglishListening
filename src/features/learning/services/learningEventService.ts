import { toLocalDateKey } from "../../../utils/date";
import type { LearningEvent, LearningModule, RecordLearningResultInput } from "../types";
import { learningEventStorageService } from "./learningEventStorageService";

export type LearningModuleStats = {
  module: LearningModule;
  correct: number;
  wrong: number;
  skipped: number;
  total: number;
};

export const learningEventService = {
  async recordLearningEvent(input: RecordLearningResultInput): Promise<LearningEvent> {
    return learningEventStorageService.appendEvent(input);
  },

  async getLearningEvents(profileId: string): Promise<LearningEvent[]> {
    return learningEventStorageService.getEvents(profileId);
  },

  async getTodayLearningEvents(profileId: string): Promise<LearningEvent[]> {
    const today = toLocalDateKey();
    const events = await learningEventStorageService.getEvents(profileId);
    return events.filter((event) => toLocalDateKey(new Date(event.createdAt)) === today);
  },

  async getModuleStats(profileId: string): Promise<LearningModuleStats[]> {
    const events = await learningEventStorageService.getEvents(profileId);
    const stats = new Map<LearningModule, LearningModuleStats>();

    for (const event of events) {
      const current =
        stats.get(event.module) ??
        {
          module: event.module,
          correct: 0,
          wrong: 0,
          skipped: 0,
          total: 0,
        };

      current.total += 1;
      if (event.result === "correct") {
        current.correct += 1;
      } else if (event.result === "wrong") {
        current.wrong += 1;
      } else {
        current.skipped += 1;
      }
      stats.set(event.module, current);
    }

    return Array.from(stats.values());
  },

  async clearLearningEventsForProfile(profileId: string): Promise<void> {
    await learningEventStorageService.deleteEvents(profileId);
  },
};
