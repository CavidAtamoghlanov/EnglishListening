import { createId } from "../../../utils/ids";
import type { LearningEvent, ReviewItem } from "../types";
import { dueInDaysIso, dueTodayIso } from "../utils/learningDates";
import { reviewQueueStorageService } from "./reviewQueueStorageService";

const correctIntervals = [1, 3, 7, 14, 30];

function createReviewId(sourceModule: string, sourceItemId: string): string {
  return `review_${sourceModule}_${sourceItemId}`.replace(/[^a-zA-Z0-9_-]/g, "_");
}

function nextCorrectInterval(correctReviewCount: number): number {
  return correctIntervals[Math.min(correctReviewCount - 1, correctIntervals.length - 1)] ?? 30;
}

export const spacedRepetitionService = {
  async recordPracticeEvent(event: LearningEvent): Promise<void> {
    if (event.result === "correct") {
      return;
    }

    const items = await reviewQueueStorageService.getReviewItems(event.profileId);
    const existing = items.find(
      (item) =>
        item.sourceModule === event.module && item.sourceItemId === event.itemId,
    );
    const now = new Date().toISOString();
    const skipped = event.result === "skipped";
    const dueAt = skipped ? dueInDaysIso(1) : dueTodayIso();

    const reviewItem: ReviewItem = existing
      ? {
          ...existing,
          prompt: event.prompt,
          correctAnswer: event.correctAnswer,
          userAnswer: event.userAnswer ?? existing.userAnswer,
          explanationAz: event.explanationAz ?? existing.explanationAz,
          mistakeCount: skipped ? existing.mistakeCount : existing.mistakeCount + 1,
          intervalDays: skipped ? Math.max(existing.intervalDays, 1) : 0,
          dueAt,
          updatedAt: now,
        }
      : {
          id: createReviewId(event.module, event.itemId) || createId("review"),
          profileId: event.profileId,
          sourceModule: event.module,
          sourceItemId: event.itemId,
          level: event.level,
          prompt: event.prompt,
          correctAnswer: event.correctAnswer,
          userAnswer: event.userAnswer,
          explanationAz: event.explanationAz,
          mistakeCount: skipped ? 0 : 1,
          correctReviewCount: 0,
          easeFactor: 2.5,
          intervalDays: skipped ? 1 : 0,
          dueAt,
          createdAt: now,
          updatedAt: now,
        };

    await reviewQueueStorageService.upsertReviewItem(event.profileId, reviewItem);
  },

  async applyReviewAnswer(
    profileId: string,
    reviewItemId: string,
    correct: boolean,
    userAnswer?: string,
  ): Promise<ReviewItem | null> {
    const items = await reviewQueueStorageService.getReviewItems(profileId);
    const item = items.find((current) => current.id === reviewItemId);
    if (!item) {
      return null;
    }

    const now = new Date().toISOString();
    const correctReviewCount = correct ? item.correctReviewCount + 1 : 0;
    const intervalDays = correct ? nextCorrectInterval(correctReviewCount) : 0;
    const updated: ReviewItem = {
      ...item,
      userAnswer,
      mistakeCount: correct ? item.mistakeCount : item.mistakeCount + 1,
      correctReviewCount,
      intervalDays,
      dueAt: correct ? dueInDaysIso(intervalDays) : dueTodayIso(),
      lastReviewedAt: now,
      updatedAt: now,
    };

    await reviewQueueStorageService.upsertReviewItem(profileId, updated);
    return updated;
  },
};
