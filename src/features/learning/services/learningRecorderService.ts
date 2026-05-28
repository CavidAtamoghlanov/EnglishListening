import type { RecordLearningResultInput, ReviewItem } from "../types";
import { isLearningAnswerCorrect } from "../utils/learningAnswer";
import { learningEventStorageService } from "./learningEventStorageService";
import { spacedRepetitionService } from "./spacedRepetitionService";
import { xpService } from "./xpService";

export const learningRecorderService = {
  async recordPracticeResult(input: RecordLearningResultInput): Promise<void> {
    try {
      const event = await learningEventStorageService.appendEvent(input);
      await spacedRepetitionService.recordPracticeEvent(event);

      if (input.result === "correct" && input.awardXp !== false) {
        await xpService.awardXP(input.profileId, input.module, input.streakCount ?? 0);
      }
    } catch (error) {
      console.warn("Learning event recording failed", error);
    }
  },

  async recordReviewAnswer({
    profileId,
    item,
    userAnswer,
  }: {
    profileId: string;
    item: ReviewItem;
    userAnswer: string;
  }): Promise<boolean> {
    const correct = isLearningAnswerCorrect(userAnswer, [item.correctAnswer]);
    const result = correct ? "correct" : "wrong";

    try {
      await learningEventStorageService.appendEvent({
        profileId,
        module: item.sourceModule,
        activityType: "review",
        level: item.level,
        itemId: item.sourceItemId,
        prompt: item.prompt,
        correctAnswer: item.correctAnswer,
        userAnswer,
        result,
        explanationAz: item.explanationAz,
        awardXp: false,
      });
      await spacedRepetitionService.applyReviewAnswer(profileId, item.id, correct, userAnswer);
      if (correct) {
        await xpService.awardXP(profileId, "review");
      }
    } catch (error) {
      console.warn("Review recording failed", error);
    }

    return correct;
  },
};
