import { storageService } from "../../../storage/storageService";
import type { AuthSession } from "../types";

const sessionKey = "english-practice:auth-session";
const offlineModeKey = "english-practice:auth-offline-mode";

export const authSessionStorage = {
  async getSession(): Promise<AuthSession | null> {
    return storageService.getJson<AuthSession | null>(sessionKey, null);
  },

  async saveSession(session: AuthSession): Promise<void> {
    await storageService.setJson(sessionKey, session);
    await storageService.setString(offlineModeKey, "false");
  },

  async clearSession(): Promise<void> {
    await storageService.remove(sessionKey);
  },

  async getOfflineMode(): Promise<boolean> {
    return (await storageService.getString(offlineModeKey)) === "true";
  },

  async setOfflineMode(enabled: boolean): Promise<void> {
    await storageService.setString(offlineModeKey, enabled ? "true" : "false");
  },
};
