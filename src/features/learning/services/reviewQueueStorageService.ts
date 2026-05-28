import { storageKeys, storageService } from "../../../storage/storageService";
import type { LearningModule, ReviewItem } from "../types";
import { isDue } from "../utils/learningDates";

export type ReviewFilter = LearningModule | "all";

function sortByDueDate(items: ReviewItem[]): ReviewItem[] {
  return [...items].sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime());
}

export const reviewQueueStorageService = {
  async getReviewItems(profileId: string): Promise<ReviewItem[]> {
    const items = await storageService.getJson<ReviewItem[]>(storageKeys.reviewQueue(profileId), []);
    return sortByDueDate(items);
  },

  async saveReviewItems(profileId: string, items: ReviewItem[]): Promise<void> {
    await storageService.setJson(storageKeys.reviewQueue(profileId), sortByDueDate(items));
  },

  async getDueReviewItems(
    profileId: string,
    filter: ReviewFilter = "all",
  ): Promise<ReviewItem[]> {
    const items = await this.getReviewItems(profileId);
    return items.filter(
      (item) => isDue(item.dueAt) && (filter === "all" || item.sourceModule === filter),
    );
  },

  async upsertReviewItem(profileId: string, item: ReviewItem): Promise<void> {
    const items = await this.getReviewItems(profileId);
    const nextItems = items.some((current) => current.id === item.id)
      ? items.map((current) => (current.id === item.id ? item : current))
      : [...items, item];
    await this.saveReviewItems(profileId, nextItems);
  },

  async deleteReviewQueue(profileId: string): Promise<void> {
    await storageService.remove(storageKeys.reviewQueue(profileId));
  },
};
