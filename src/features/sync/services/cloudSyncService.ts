import type { AuthSession } from "../../auth/types";
import type { SyncPushResponse, UserCloudData } from "../types";

async function requestJson<T>(path: string, token: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init.headers ?? {}),
    },
  });
  const body = (await response.json().catch(() => ({}))) as { error?: string };
  if (!response.ok) {
    throw new Error(body.error ?? "Sync request failed.");
  }
  return body as T;
}

export const cloudSyncService = {
  async pull(session: AuthSession): Promise<UserCloudData> {
    const response = await requestJson<{ data: UserCloudData }>("/api/sync/pull", session.token, {
      method: "GET",
    });
    return response.data;
  },

  async push(session: AuthSession, data: UserCloudData, baseRevision?: number): Promise<SyncPushResponse> {
    return requestJson<SyncPushResponse>("/api/sync/push", session.token, {
      method: "POST",
      body: JSON.stringify({ data, baseRevision }),
    });
  },
};
