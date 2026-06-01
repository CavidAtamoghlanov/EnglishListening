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

function getUserId(req: ApiRequest): string | null {
  const raw = req.query?.userId;
  return Array.isArray(raw) ? raw[0] ?? null : raw ?? null;
}

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

    const userId = getUserId(req);
    if (!userId) {
      throw new Error("userId is required.");
    }

    const store = getCloudJsonStore();
    const users = await store.getUsersIndex();
    const record = users.find((user) => user.userId === userId);
    if (!record) {
      res.status(404).json({ error: "User not found." });
      return;
    }

    const data = await store.getUserData(userId);
    res.status(200).json({
      user: toSafeUser(record),
      data,
    });
  } catch (error) {
    handleApiError(res, error, 500);
  }
}
