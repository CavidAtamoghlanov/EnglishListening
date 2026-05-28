import { storageKeys, storageService } from "../../../storage/storageService";
import { toLocalDateKey } from "../../../utils/date";
import type { DailyPath, DailyTask, LearningEvent, LearningModule } from "../types";
import { learningEventStorageService } from "./learningEventStorageService";
import { reviewQueueStorageService } from "./reviewQueueStorageService";

function countCorrectToday(events: LearningEvent[], module: LearningModule | "review"): number {
  const today = toLocalDateKey();
  return events.filter((event) => {
    const sameDay = toLocalDateKey(new Date(event.createdAt)) === today;
    if (!sameDay || event.result !== "correct") {
      return false;
    }
    if (module === "review") {
      return event.activityType === "review";
    }
    return event.module === module && event.activityType !== "review";
  }).length;
}

function createTask(
  id: string,
  module: DailyTask["module"],
  title: string,
  description: string,
  targetCount: number,
  completedCount: number,
  route: string,
): DailyTask {
  return {
    id,
    module,
    title,
    description,
    targetCount,
    completedCount: Math.min(completedCount, targetCount),
    route,
    isCompleted: completedCount >= targetCount,
  };
}

export const dailyPathService = {
  async getDailyPath(profileId: string): Promise<DailyPath> {
    const today = toLocalDateKey();
    const events = await learningEventStorageService.getEvents(profileId);
    const dueReviewItems = await reviewQueueStorageService.getDueReviewItems(profileId);

    const reviewTarget = Math.min(5, dueReviewItems.length);
    const tasks: DailyTask[] = [];

    if (reviewTarget > 0) {
      tasks.push(
        createTask(
          "review",
          "review",
          "Review mistakes",
          "Repeat the hardest items first.",
          reviewTarget,
          countCorrectToday(events, "review"),
          "/review",
        ),
      );
    }

    tasks.push(
      createTask(
        "words",
        "words",
        "Practice words",
        "Build vocabulary with speaking practice.",
        10,
        countCorrectToday(events, "words"),
        "/words/levels",
      ),
      createTask(
        "sentences",
        "sentences",
        "Practice sentences",
        "Repeat and translate useful sentences.",
        5,
        countCorrectToday(events, "sentences"),
        "/sentences",
      ),
      createTask(
        "writing",
        "writing",
        "Do writing reps",
        "Write short practical English answers.",
        3,
        countCorrectToday(events, "writing"),
        "/writing",
      ),
      createTask(
        "grammar",
        "grammar",
        "Fix grammar",
        "Practice grammar with typed answers.",
        3,
        countCorrectToday(events, "grammar"),
        "/grammar",
      ),
    );

    const completedTasks = tasks.filter((task) => task.isCompleted).length;
    const path: DailyPath = {
      profileId,
      date: today,
      tasks,
      completedTasks,
      totalTasks: tasks.length,
      updatedAt: new Date().toISOString(),
    };

    await storageService.setJson(storageKeys.dailyPath(profileId), path);
    return path;
  },

  async getStoredDailyPath(profileId: string): Promise<DailyPath | null> {
    return storageService.getJson<DailyPath | null>(storageKeys.dailyPath(profileId), null);
  },

  async deleteDailyPath(profileId: string): Promise<void> {
    await storageService.remove(storageKeys.dailyPath(profileId));
  },
};
