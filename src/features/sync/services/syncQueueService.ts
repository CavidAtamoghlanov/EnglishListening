import { authSessionStorage } from "../../auth/services/authSessionStorage";
import type { SyncStatus } from "../types";
import { cloudSyncService } from "./cloudSyncService";
import { localUserDataService } from "./localUserDataService";

export type SyncResult = {
  status: SyncStatus;
  message: string;
};

export const syncQueueService = {
  async pushNow(profileId: string): Promise<SyncResult> {
    const session = await authSessionStorage.getSession();
    if (!session) {
      return { status: "idle", message: "No logged-in user. Local progress is still saved." };
    }

    try {
      const data = await localUserDataService.createCloudDataFromProfile(profileId, session.user);
      await cloudSyncService.push(session, data, data.sync.revision);
      return { status: "synced", message: "Progress synced." };
    } catch (error) {
      return {
        status: "error",
        message: error instanceof Error ? error.message : "Sync failed.",
      };
    }
  },

  async pullNow(): Promise<SyncResult> {
    const session = await authSessionStorage.getSession();
    if (!session) {
      return { status: "idle", message: "No logged-in user." };
    }

    try {
      const data = await cloudSyncService.pull(session);
      await localUserDataService.applyCloudDataToLocal(data, session.user);
      return { status: "synced", message: "Cloud progress loaded." };
    } catch (error) {
      return {
        status: "error",
        message: error instanceof Error ? error.message : "Sync failed.",
      };
    }
  },
};
