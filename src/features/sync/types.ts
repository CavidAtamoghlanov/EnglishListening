export type SyncLevel = "A1" | "A2" | "B1" | "B2";

export type UserIndexRecord = {
  userId: string;
  email: string;
  normalizedEmail: string;
  username: string;
  displayName: string;
  avatar: string;
  passwordHash: string;
  passwordSalt: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  isActive: boolean;
};

export type UserCloudProfile = {
  displayName: string;
  avatar: string;
  activeLevel?: SyncLevel;
  createdAt: string;
  updatedAt: string;
};

export type UserCloudData = {
  schemaVersion: number;
  userId: string;
  email: string;
  username: string;
  profile: UserCloudProfile;
  settings: unknown;
  wordProgress: unknown;
  sentenceProgress: unknown;
  grammarProgress?: unknown;
  writingProgress?: unknown;
  learningEvents?: unknown[];
  reviewQueue?: unknown[];
  xp?: unknown;
  dailyPath?: unknown;
  favorites?: unknown;
  difficultItems?: unknown;
  statistics?: unknown;
  sync: {
    updatedAt: string;
    lastPulledAt?: string;
    lastPushedAt?: string;
    revision: number;
  };
};

export type SafeUser = {
  userId: string;
  email: string;
  username: string;
  displayName: string;
  avatar: string;
  createdAt: string;
  lastLoginAt?: string;
};

export type AuthSession = {
  token: string;
  user: SafeUser;
};

export type AuthResponse = {
  token: string;
  user: SafeUser;
  data: UserCloudData;
};

export type SyncStatus = "idle" | "syncing" | "synced" | "error";

export type SyncPushResponse = {
  data: UserCloudData;
  conflict?: boolean;
};

export interface CloudJsonStore {
  getUsersIndex(): Promise<UserIndexRecord[]>;
  saveUsersIndex(users: UserIndexRecord[]): Promise<void>;
  getUserData(userId: string): Promise<UserCloudData | null>;
  saveUserData(userId: string, data: UserCloudData): Promise<void>;
}
