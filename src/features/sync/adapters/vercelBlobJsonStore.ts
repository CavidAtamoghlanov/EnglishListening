import { head, put } from "@vercel/blob";
import type { CloudJsonStore, UserCloudData, UserIndexRecord } from "../types";

const basePath = "english-practice";
const usersIndexPath = `${basePath}/users.index.json`;

function token(): string {
  const value = process.env.BLOB_READ_WRITE_TOKEN;
  if (!value) {
    throw new Error("BLOB_READ_WRITE_TOKEN is not configured.");
  }
  return value;
}

function userDataPath(userId: string): string {
  return `${basePath}/user-data/${userId}.json`;
}

async function readBlobJson<T>(pathname: string, fallback: T): Promise<T> {
  try {
    const details = await head(pathname, { token: token() });
    const response = await fetch(details.downloadUrl ?? details.url);
    if (!response.ok) {
      return fallback;
    }
    return (await response.json()) as T;
  } catch (error) {
    const name = error instanceof Error ? error.name : "";
    if (name.includes("BlobNotFound")) {
      return fallback;
    }
    return fallback;
  }
}

async function writeBlobJson<T>(pathname: string, value: T): Promise<void> {
  await put(pathname, JSON.stringify(value, null, 2), {
    access: "private",
    allowOverwrite: true,
    contentType: "application/json",
    token: token(),
  });
}

export const vercelBlobJsonStore: CloudJsonStore = {
  async getUsersIndex(): Promise<UserIndexRecord[]> {
    return readBlobJson<UserIndexRecord[]>(usersIndexPath, []);
  },

  async saveUsersIndex(users: UserIndexRecord[]): Promise<void> {
    await writeBlobJson(usersIndexPath, users);
  },

  async getUserData(userId: string): Promise<UserCloudData | null> {
    return readBlobJson<UserCloudData | null>(userDataPath(userId), null);
  },

  async saveUserData(userId: string, data: UserCloudData): Promise<void> {
    await writeBlobJson(userDataPath(userId), data);
  },
};
