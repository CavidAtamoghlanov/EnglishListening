import { storageKeys, storageService } from "../../../storage/storageService";
import { toLocalDateKey } from "../../../utils/date";
import type { LearningModule, UserXP } from "../types";

const xpRewards: Partial<Record<LearningModule | "review", number>> = {
  words: 10,
  sentences: 12,
  grammar: 15,
  writing: 15,
  review: 20,
};

const levelTitles = [
  { minXp: 6000, title: "Confident English User" },
  { minXp: 3000, title: "Developer Communicator" },
  { minXp: 1500, title: "Travel Speaker" },
  { minXp: 500, title: "Daily Learner" },
  { minXp: 0, title: "Beginner Explorer" },
];

export function getLevelTitle(totalXp: number): string {
  return levelTitles.find((level) => totalXp >= level.minXp)?.title ?? "Beginner Explorer";
}

function createEmptyXP(profileId: string): UserXP {
  return {
    profileId,
    totalXp: 0,
    todayXp: 0,
    levelTitle: getLevelTitle(0),
    updatedAt: new Date().toISOString(),
  };
}

function normalizeTodayXp(xp: UserXP): UserXP {
  const today = toLocalDateKey();
  const updatedDay = toLocalDateKey(new Date(xp.updatedAt));
  if (today === updatedDay) {
    return xp;
  }

  return {
    ...xp,
    todayXp: 0,
    updatedAt: new Date().toISOString(),
  };
}

export const xpService = {
  async getXP(profileId: string): Promise<UserXP> {
    const stored = await storageService.getJson<UserXP | null>(storageKeys.xp(profileId), null);
    const xp = normalizeTodayXp(stored ?? createEmptyXP(profileId));
    return {
      ...xp,
      profileId,
      levelTitle: getLevelTitle(xp.totalXp),
    };
  },

  async saveXP(profileId: string, xp: UserXP): Promise<void> {
    await storageService.setJson(storageKeys.xp(profileId), {
      ...xp,
      profileId,
      levelTitle: getLevelTitle(xp.totalXp),
      updatedAt: new Date().toISOString(),
    });
  },

  async awardXP(
    profileId: string,
    source: LearningModule | "review",
    streakCount = 0,
  ): Promise<UserXP> {
    const current = await this.getXP(profileId);
    const baseXp = xpRewards[source] ?? 0;
    const bonusXp = streakCount > 0 && streakCount % 5 === 0 ? 10 : 0;
    const nextTotal = current.totalXp + baseXp + bonusXp;
    const updated: UserXP = {
      ...current,
      totalXp: nextTotal,
      todayXp: current.todayXp + baseXp + bonusXp,
      levelTitle: getLevelTitle(nextTotal),
      updatedAt: new Date().toISOString(),
    };
    await this.saveXP(profileId, updated);
    return updated;
  },

  async deleteXP(profileId: string): Promise<void> {
    await storageService.remove(storageKeys.xp(profileId));
  },
};
