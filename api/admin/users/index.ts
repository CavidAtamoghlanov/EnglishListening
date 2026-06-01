import { getCloudJsonStore } from "../../../src/features/sync/adapters/cloudJsonStore";
import { toSafeUser } from "../../../src/features/sync/utils/cloudData";
import {
  allowMethods,
  handleApiError,
  isAdminTokenValid,
  readAdminToken,
  setCors,
  type ApiRequest,
  type ApiResponse,
} from "../../_lib/apiUtils";

export default async function handler(req: ApiRequest, res: ApiResponse) {
  setCors(res);
  if (!allowMethods(req, res, ["GET"])) {
    return;
  }

  try {
    if (!isAdminTokenValid(readAdminToken(req))) {
      res.status(403).json({ error: "Admin token is required." });
      return;
    }

    const store = getCloudJsonStore();
    const users = await store.getUsersIndex();
    const summaries = await Promise.all(
      users.map(async (record) => {
        const data = await store.getUserData(record.userId);
        const wordProgress = data?.wordProgress as { currentDayStreak?: number } | null | undefined;
        const xp = data?.xp as { totalXp?: number; todayXp?: number; levelTitle?: string } | null | undefined;
        const reviewQueue = Array.isArray(data?.reviewQueue) ? data.reviewQueue : [];
        return {
          user: toSafeUser(record),
          totalXp: xp?.totalXp ?? 0,
          todayXp: xp?.todayXp ?? 0,
          levelTitle: xp?.levelTitle ?? "Beginner Explorer",
          streak: wordProgress?.currentDayStreak ?? 0,
          dueReviewCount: reviewQueue.length,
          lastSyncAt: data?.sync.updatedAt,
        };
      }),
    );

    res.status(200).json({ users: summaries });
  } catch (error) {
    handleApiError(res, error, 500);
  }
}
