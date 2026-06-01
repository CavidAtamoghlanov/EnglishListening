export type {
  AuthResponse,
  AuthSession,
  SafeUser,
  SyncStatus,
} from "../sync/types";

export type RegisterInput = {
  email: string;
  username: string;
  displayName: string;
  avatar: string;
  password: string;
};

export type LoginInput = {
  email: string;
  password: string;
};
