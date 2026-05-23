import AsyncStorage from "@react-native-async-storage/async-storage";

const keyPrefix = "english-practice";

export const storageKeys = {
  profiles: `${keyPrefix}:profiles`,
  progress: (profileId: string) => `${keyPrefix}:progress:${profileId}`,
  sentenceProgress: (profileId: string) => `${keyPrefix}:sentence-progress:${profileId}`,
  settings: (profileId: string) => `${keyPrefix}:settings:${profileId}`,
};

export const storageService = {
  async getString(key: string): Promise<string | null> {
    return AsyncStorage.getItem(key);
  },

  async setString(key: string, value: string): Promise<void> {
    await AsyncStorage.setItem(key, value);
  },

  async getJson<T>(key: string, fallback: T): Promise<T> {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) {
      return fallback;
    }

    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  },

  async setJson<T>(key: string, value: T): Promise<void> {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  },

  async remove(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  },
};
