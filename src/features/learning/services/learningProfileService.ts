import { dailyPathService } from "./dailyPathService";
import { learningEventStorageService } from "./learningEventStorageService";
import { reviewQueueStorageService } from "./reviewQueueStorageService";
import { xpService } from "./xpService";

export const learningProfileService = {
  async initializeProfile(profileId: string): Promise<void> {
    await Promise.all([
      xpService.saveXP(profileId, await xpService.getXP(profileId)),
      dailyPathService.getDailyPath(profileId),
    ]);
  },

  async deleteProfileLearningData(profileId: string): Promise<void> {
    await Promise.all([
      learningEventStorageService.deleteEvents(profileId),
      reviewQueueStorageService.deleteReviewQueue(profileId),
      xpService.deleteXP(profileId),
      dailyPathService.deleteDailyPath(profileId),
    ]);
  },
};
