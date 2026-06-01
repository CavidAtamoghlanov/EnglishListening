import crypto from "node:crypto";
import { getCloudJsonStore } from "../../sync/adapters/cloudJsonStore";
import type { AuthResponse, SafeUser, UserCloudData, UserIndexRecord } from "../../sync/types";
import {
  createEmptyCloudData,
  normalizeEmail,
  normalizeUsername,
  sanitizeCloudDataForUser,
  toSafeUser,
} from "../../sync/utils/cloudData";
import type { LoginInput, RegisterInput } from "../types";
import { passwordService } from "./passwordService";
import { tokenService } from "./tokenService";

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function findUserById(users: UserIndexRecord[], userId: string): UserIndexRecord | null {
  return users.find((user) => user.userId === userId && user.isActive) ?? null;
}

export const authServerService = {
  async register(input: RegisterInput): Promise<AuthResponse> {
    const email = input.email.trim();
    const normalizedEmail = normalizeEmail(email);
    const username = normalizeUsername(input.username);
    const displayName = input.displayName.trim();
    const avatar = input.avatar.trim() || "🙂";
    const rawPassword = input.password;

    if (!validateEmail(email)) {
      throw new Error("Enter a valid email address.");
    }
    if (username.length < 3) {
      throw new Error("Username must be at least 3 characters.");
    }
    if (!displayName) {
      throw new Error("Display name is required.");
    }
    if (rawPassword.length < 8) {
      throw new Error("Password must be at least 8 characters.");
    }

    const store = getCloudJsonStore();
    const users = await store.getUsersIndex();
    if (users.some((user) => user.normalizedEmail === normalizedEmail)) {
      throw new Error("This email is already registered.");
    }
    if (users.some((user) => user.username.toLowerCase() === username)) {
      throw new Error("This username is already taken.");
    }

    const now = new Date().toISOString();
    const password = passwordService.hashPassword(rawPassword);
    const record: UserIndexRecord = {
      userId: crypto.randomUUID(),
      email,
      normalizedEmail,
      username,
      displayName,
      avatar,
      passwordHash: password.passwordHash,
      passwordSalt: password.passwordSalt,
      createdAt: now,
      updatedAt: now,
      lastLoginAt: now,
      isActive: true,
    };
    const data = createEmptyCloudData(record);

    await store.saveUsersIndex([...users, record]);
    await store.saveUserData(record.userId, data);

    return {
      token: tokenService.createToken(record.userId),
      user: toSafeUser(record),
      data,
    };
  },

  async login(input: LoginInput): Promise<AuthResponse> {
    const normalizedEmail = normalizeEmail(input.email);
    const store = getCloudJsonStore();
    const users = await store.getUsersIndex();
    const record = users.find((user) => user.normalizedEmail === normalizedEmail && user.isActive);
    if (!record || !passwordService.verifyPassword(input.password, record.passwordHash, record.passwordSalt)) {
      throw new Error("Invalid email or password.");
    }

    const now = new Date().toISOString();
    const updatedRecord: UserIndexRecord = {
      ...record,
      lastLoginAt: now,
      updatedAt: now,
    };
    const updatedUsers = users.map((user) => (user.userId === record.userId ? updatedRecord : user));
    const storedData = await store.getUserData(record.userId);
    const data = sanitizeCloudDataForUser(storedData ?? createEmptyCloudData(updatedRecord), updatedRecord);

    await store.saveUsersIndex(updatedUsers);
    await store.saveUserData(record.userId, data);

    return {
      token: tokenService.createToken(record.userId),
      user: toSafeUser(updatedRecord),
      data,
    };
  },

  async requireUser(token: string | null): Promise<{ user: SafeUser; record: UserIndexRecord; data: UserCloudData }> {
    if (!token) {
      throw new Error("Authorization token is required.");
    }
    const payload = tokenService.verifyToken(token);
    if (!payload) {
      throw new Error("Invalid or expired token.");
    }

    const store = getCloudJsonStore();
    const users = await store.getUsersIndex();
    const record = findUserById(users, payload.userId);
    if (!record) {
      throw new Error("User not found.");
    }
    const data = sanitizeCloudDataForUser(
      (await store.getUserData(record.userId)) ?? createEmptyCloudData(record),
      record,
    );
    return { user: toSafeUser(record), record, data };
  },

  async saveUserData(record: UserIndexRecord, data: UserCloudData, baseRevision?: number): Promise<{ data: UserCloudData; conflict: boolean }> {
    const store = getCloudJsonStore();
    const current = (await store.getUserData(record.userId)) ?? createEmptyCloudData(record);
    const conflict = typeof baseRevision === "number" && current.sync.revision !== baseRevision;
    if (conflict) {
      return { data: current, conflict: true };
    }

    const now = new Date().toISOString();
    const next = sanitizeCloudDataForUser(
      {
        ...current,
        ...data,
        userId: record.userId,
        email: record.email,
        username: record.username,
        sync: {
          ...data.sync,
          updatedAt: now,
          lastPushedAt: now,
          revision: Math.max(current.sync.revision, data.sync?.revision ?? 0) + 1,
        },
      },
      record,
    );
    await store.saveUserData(record.userId, next);
    return { data: next, conflict };
  },
};
