import type { AuthSession } from "../../auth/types";
import { profileStorageService } from "../../profile/services/profileStorageService";
import type { UserProfile } from "../../profile/types";
import { cloudSyncService } from "./cloudSyncService";
import { localUserDataService } from "./localUserDataService";

export const localToCloudMigrationService = {
  async getMergeCandidate(cloudUserId: string): Promise<UserProfile | null> {
    const profiles = await profileStorageService.getProfiles();
    return profiles.find((profile) => profile.id !== cloudUserId) ?? null;
  },

  async mergeLocalProfileIntoCloud(session: AuthSession, localProfileId: string): Promise<void> {
    const data = await localUserDataService.createCloudDataFromProfile(localProfileId, session.user);
    await cloudSyncService.push(session, data, data.sync.revision);
    await localUserDataService.applyCloudDataToLocal(data, session.user);
  },
};
