import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { AuthResponse, AuthSession } from "../types";
import { authSessionStorage } from "../services/authSessionStorage";

type AuthContextValue = {
  session: AuthSession | null;
  isLoading: boolean;
  offlineMode: boolean;
  setAuthenticated: (response: AuthResponse) => Promise<void>;
  logout: () => Promise<void>;
  continueOffline: () => Promise<void>;
  clearOfflineMode: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [offlineMode, setOfflineMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function restore() {
      const [storedSession, storedOfflineMode] = await Promise.all([
        authSessionStorage.getSession(),
        authSessionStorage.getOfflineMode(),
      ]);
      if (mounted) {
        setSession(storedSession);
        setOfflineMode(storedOfflineMode);
        setIsLoading(false);
      }
    }
    void restore();
    return () => {
      mounted = false;
    };
  }, []);

  const setAuthenticated = useCallback(async (response: AuthResponse) => {
    const nextSession = { token: response.token, user: response.user };
    await authSessionStorage.saveSession(nextSession);
    setSession(nextSession);
    setOfflineMode(false);
  }, []);

  const logout = useCallback(async () => {
    await authSessionStorage.clearSession();
    setSession(null);
  }, []);

  const continueOffline = useCallback(async () => {
    await authSessionStorage.setOfflineMode(true);
    setOfflineMode(true);
    setSession(null);
  }, []);

  const clearOfflineMode = useCallback(async () => {
    await authSessionStorage.setOfflineMode(false);
    setOfflineMode(false);
  }, []);

  const value = useMemo(
    () => ({
      session,
      isLoading,
      offlineMode,
      setAuthenticated,
      logout,
      continueOffline,
      clearOfflineMode,
    }),
    [clearOfflineMode, continueOffline, isLoading, logout, offlineMode, session, setAuthenticated],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
