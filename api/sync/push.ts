import type { UserCloudData } from "../../src/features/sync/types";
import { authServerService } from "../../src/features/auth/server/authServerService";
import { tokenService } from "../../src/features/auth/server/tokenService";
import { allowMethods, handleApiError, readBody, setCors, type ApiRequest, type ApiResponse } from "../_lib/apiUtils";

type PushBody = {
  data: UserCloudData;
  baseRevision?: number;
};

export default async function handler(req: ApiRequest, res: ApiResponse) {
  setCors(res);
  if (!allowMethods(req, res, ["POST"])) {
    return;
  }

  try {
    const token = tokenService.readBearerToken(req.headers.authorization);
    const { record } = await authServerService.requireUser(token);
    const body = readBody<PushBody>(req);
    if (!body.data) {
      throw new Error("data is required.");
    }
    const result = await authServerService.saveUserData(record, body.data, body.baseRevision);
    res.status(200).json(result);
  } catch (error) {
    handleApiError(res, error, 401);
  }
}
