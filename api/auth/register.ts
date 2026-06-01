import type { RegisterInput } from "../../src/features/auth/types";
import { authServerService } from "../../src/features/auth/server/authServerService";
import { allowMethods, handleApiError, readBody, setCors, type ApiRequest, type ApiResponse } from "../_lib/apiUtils";

export default async function handler(req: ApiRequest, res: ApiResponse) {
  setCors(res);
  if (!allowMethods(req, res, ["POST"])) {
    return;
  }

  try {
    const result = await authServerService.register(readBody<RegisterInput>(req));
    res.status(200).json(result);
  } catch (error) {
    handleApiError(res, error, 400);
  }
}
