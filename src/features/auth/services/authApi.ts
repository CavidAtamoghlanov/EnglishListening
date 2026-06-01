import type { AuthResponse } from "../../sync/types";
import type { LoginInput, RegisterInput } from "../types";

async function requestJson<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  const body = (await response.json().catch(() => ({}))) as { error?: string };
  if (!response.ok) {
    throw new Error(body.error ?? "Request failed.");
  }
  return body as T;
}

export const authApi = {
  register(input: RegisterInput): Promise<AuthResponse> {
    return requestJson<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  login(input: LoginInput): Promise<AuthResponse> {
    return requestJson<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
};
