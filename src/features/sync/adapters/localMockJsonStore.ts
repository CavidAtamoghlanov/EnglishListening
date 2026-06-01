import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { CloudJsonStore, UserCloudData, UserIndexRecord } from "../types";

const rootDir = path.join(process.cwd(), ".local-cloud-json");
const usersIndexPath = path.join(rootDir, "users.index.json");

async function readJson<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const raw = await readFile(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJson<T>(filePath: string, value: T): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function userDataPath(userId: string): string {
  return path.join(rootDir, "user-data", `${userId}.json`);
}

export const localMockJsonStore: CloudJsonStore = {
  async getUsersIndex(): Promise<UserIndexRecord[]> {
    console.warn("Using local mock JSON auth store. This is development-only and does not sync across devices.");
    return readJson<UserIndexRecord[]>(usersIndexPath, []);
  },

  async saveUsersIndex(users: UserIndexRecord[]): Promise<void> {
    await writeJson(usersIndexPath, users);
  },

  async getUserData(userId: string): Promise<UserCloudData | null> {
    return readJson<UserCloudData | null>(userDataPath(userId), null);
  },

  async saveUserData(userId: string, data: UserCloudData): Promise<void> {
    await writeJson(userDataPath(userId), data);
  },
};
