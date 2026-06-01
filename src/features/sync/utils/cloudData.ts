import type { SafeUser, UserCloudData, UserIndexRecord } from "../types";

export const USER_CLOUD_SCHEMA_VERSION = 1;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function normalizeUsername(username: string): string {
  return username.trim().toLowerCase().replace(/\s+/g, "-");
}

export function toSafeUser(record: UserIndexRecord): SafeUser {
  return {
    userId: record.userId,
    email: record.email,
    username: record.username,
    displayName: record.displayName,
    avatar: record.avatar,
    createdAt: record.createdAt,
    lastLoginAt: record.lastLoginAt,
  };
}

export function createEmptyCloudData(record: UserIndexRecord): UserCloudData {
  const now = new Date().toISOString();
  return {
    schemaVersion: USER_CLOUD_SCHEMA_VERSION,
    userId: record.userId,
    email: record.email,
    username: record.username,
    profile: {
      displayName: record.displayName,
      avatar: record.avatar,
      createdAt: record.createdAt,
      updatedAt: now,
    },
    settings: null,
    wordProgress: null,
    sentenceProgress: null,
    grammarProgress: null,
    writingProgress: null,
    learningEvents: [],
    reviewQueue: [],
    xp: null,
    dailyPath: null,
    favorites: null,
    difficultItems: null,
    statistics: null,
    sync: {
      updatedAt: now,
      revision: 1,
    },
  };
}

export function sanitizeCloudDataForUser(data: UserCloudData, record: UserIndexRecord): UserCloudData {
  return {
    ...data,
    schemaVersion: data.schemaVersion || USER_CLOUD_SCHEMA_VERSION,
    userId: record.userId,
    email: record.email,
    username: record.username,
    profile: {
      ...data.profile,
      displayName: data.profile?.displayName || record.displayName,
      avatar: data.profile?.avatar || record.avatar,
      createdAt: data.profile?.createdAt || record.createdAt,
      updatedAt: data.profile?.updatedAt || new Date().toISOString(),
    },
    sync: {
      updatedAt: new Date().toISOString(),
      revision: Math.max(1, data.sync?.revision ?? 1),
      lastPulledAt: data.sync?.lastPulledAt,
      lastPushedAt: data.sync?.lastPushedAt,
    },
  };
}
