import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import type { UserCloudData, UserIndexRecord } from "../src/features/sync/types";

const rootDir = path.join(process.cwd(), ".local-cloud-json");
const usersIndexPath = path.join(rootDir, "users.index.json");

function readJson<T>(filePath: string, fallback: T): T {
  if (!existsSync(filePath)) {
    return fallback;
  }
  return JSON.parse(readFileSync(filePath, "utf8")) as T;
}

function hasText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function validateUserRecord(record: UserIndexRecord, index: number, errors: string[]) {
  const label = `users[${index}]`;
  for (const field of [
    "userId",
    "email",
    "normalizedEmail",
    "username",
    "displayName",
    "avatar",
    "passwordHash",
    "passwordSalt",
    "createdAt",
    "updatedAt",
  ] as const) {
    if (!hasText(record[field])) {
      errors.push(`${label}: ${field} is required`);
    }
  }
  if (record.normalizedEmail !== record.email.trim().toLowerCase()) {
    errors.push(`${label}: normalizedEmail must be lowercase email`);
  }
  if ("password" in record) {
    errors.push(`${label}: plaintext password field is not allowed`);
  }
}

function validateCloudData(data: UserCloudData | null, userId: string, errors: string[]) {
  if (!data) {
    errors.push(`${userId}: missing user-data document`);
    return;
  }
  if (!data.schemaVersion) {
    errors.push(`${userId}: schemaVersion is required`);
  }
  if (data.userId !== userId) {
    errors.push(`${userId}: user-data userId mismatch`);
  }
  if (!data.profile || !hasText(data.profile.displayName) || !hasText(data.profile.avatar)) {
    errors.push(`${userId}: profile displayName/avatar are required`);
  }
  if (!data.sync || typeof data.sync.revision !== "number") {
    errors.push(`${userId}: sync.revision is required`);
  }
  if ("password" in data || "passwordHash" in data || "passwordSalt" in data) {
    errors.push(`${userId}: password fields are not allowed in user-data`);
  }
}

function main() {
  const errors: string[] = [];
  const emails = new Set<string>();
  const usernames = new Set<string>();
  const users = readJson<UserIndexRecord[]>(usersIndexPath, []);

  console.log("Users JSON validation report");
  console.log("----------------------------");
  console.log(`Users index: ${users.length} user(s)`);

  users.forEach((record, index) => {
    validateUserRecord(record, index, errors);
    if (emails.has(record.normalizedEmail)) {
      errors.push(`Duplicate email: ${record.normalizedEmail}`);
    }
    emails.add(record.normalizedEmail);
    if (usernames.has(record.username.toLowerCase())) {
      errors.push(`Duplicate username: ${record.username}`);
    }
    usernames.add(record.username.toLowerCase());

    const dataPath = path.join(rootDir, "user-data", `${record.userId}.json`);
    validateCloudData(readJson<UserCloudData | null>(dataPath, null), record.userId, errors);
  });

  if (users.length === 0) {
    console.log("No local mock users found. This is OK before first local API registration.");
  }

  if (errors.length > 0) {
    console.log("\nErrors:");
    errors.forEach((error) => console.log(`- ${error}`));
    process.exitCode = 1;
    return;
  }

  console.log("\nUsers JSON validation passed.");
}

try {
  main();
} catch (error) {
  console.error((error as Error).message);
  process.exitCode = 1;
}
