import { authServerService } from "../../src/features/auth/server/authServerService";
import { tokenService } from "../../src/features/auth/server/tokenService";
import { allowMethods, handleApiError, setCors, type ApiRequest, type ApiResponse } from "../_lib/apiUtils";

export default async function handler(req: ApiRequest, res: ApiResponse) {
  setCors(res);
  if (!allowMethods(req, res, ["GET"])) {
    return;
  }

  try {
    const token = tokenService.readBearerToken(req.headers.authorization);
    const { data } = await authServerService.requireUser(token);
    res.status(200).json({
      data: {
        ...data,
        sync: {
          ...data.sync,
          lastPulledAt: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    handleApiError(res, error, 401);
  }
}
