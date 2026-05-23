import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { profileStorageService } from "../services/profileStorageService";
import type { UserProfile } from "../types";

type ActiveProfileContextValue = {
  activeProfile: UserProfile | null;
  setActiveProfile: (profile: UserProfile | null) => void;
  setActiveProfileById: (profileId: string) => Promise<UserProfile | null>;
  clearActiveProfile: () => void;
};

const ActiveProfileContext = createContext<ActiveProfileContextValue | null>(null);

export function ActiveProfileProvider({ children }: PropsWithChildren) {
  const [activeProfile, setActiveProfile] = useState<UserProfile | null>(null);

  const setActiveProfileById = useCallback(async (profileId: string) => {
    const profile = await profileStorageService.touchProfile(profileId);
    setActiveProfile(profile);
    return profile;
  }, []);

  const clearActiveProfile = useCallback(() => {
    setActiveProfile(null);
  }, []);

  const value = useMemo(
    () => ({
      activeProfile,
      setActiveProfile,
      setActiveProfileById,
      clearActiveProfile,
    }),
    [activeProfile, setActiveProfileById, clearActiveProfile],
  );

  return (
    <ActiveProfileContext.Provider value={value}>{children}</ActiveProfileContext.Provider>
  );
}

export function useActiveProfile() {
  const context = useContext(ActiveProfileContext);
  if (!context) {
    throw new Error("useActiveProfile must be used inside ActiveProfileProvider");
  }

  return context;
}
