import type { LearningModule, ReviewItem } from "../types";
import {
  reviewQueueStorageService,
  type ReviewFilter,
} from "./reviewQueueStorageService";

export const reviewQueueService = {
  async getReviewQueue(profileId: string): Promise<ReviewItem[]> {
    return reviewQueueStorageService.getReviewItems(profileId);
  },

  async getDueReviewItems(
    profileId: string,
    filter: ReviewFilter = "all",
  ): Promise<ReviewItem[]> {
    return reviewQueueStorageService.getDueReviewItems(profileId, filter);
  },

  async getDueReviewCount(profileId: string, module?: LearningModule): Promise<number> {
    const items = await reviewQueueStorageService.getDueReviewItems(profileId, module ?? "all");
    return items.length;
  },

  async saveReviewQueue(profileId: string, items: ReviewItem[]): Promise<void> {
    await reviewQueueStorageService.saveReviewItems(profileId, items);
  },

  async upsertReviewItem(profileId: string, item: ReviewItem): Promise<void> {
    await reviewQueueStorageService.upsertReviewItem(profileId, item);
  },

  async clearReviewQueueForProfile(profileId: string): Promise<void> {
    await reviewQueueStorageService.deleteReviewQueue(profileId);
  },
};
