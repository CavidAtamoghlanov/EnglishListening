import { storageKeys, storageService } from "../../../storage/storageService";
import { createId } from "../../../utils/ids";
import type { LearningEvent, RecordLearningResultInput } from "../types";

const maxStoredEvents = 2000;

export const learningEventStorageService = {
  async getEvents(profileId: string): Promise<LearningEvent[]> {
    return storageService.getJson<LearningEvent[]>(storageKeys.learningEvents(profileId), []);
  },

  async saveEvents(profileId: string, events: LearningEvent[]): Promise<void> {
    await storageService.setJson(storageKeys.learningEvents(profileId), events.slice(-maxStoredEvents));
  },

  async appendEvent(input: RecordLearningResultInput): Promise<LearningEvent> {
    const now = new Date().toISOString();
    const event: LearningEvent = {
      id: createId("learning_event"),
      profileId: input.profileId,
      module: input.module,
      activityType: input.activityType,
      level: input.level,
      itemId: input.itemId,
      prompt: input.prompt,
      correctAnswer: input.correctAnswer,
      userAnswer: input.userAnswer,
      result: input.result,
      mistakeType: input.mistakeType,
      explanationAz: input.explanationAz,
      createdAt: now,
    };

    const events = await this.getEvents(input.profileId);
    await this.saveEvents(input.profileId, [...events, event]);
    return event;
  },

  async deleteEvents(profileId: string): Promise<void> {
    await storageService.remove(storageKeys.learningEvents(profileId));
  },
};
