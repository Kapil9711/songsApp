import { createMMKV } from "react-native-mmkv";
import type { StorageAdapter } from "..";

const mmkv = createMMKV({
  id: "riffly-storage",
});

function safeJsonParse<T>(value: string | undefined): T | null {
  if (value === undefined) {
    return null;
  }

  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.error("[MMKVStorageAdapter] Failed to parse stored JSON", error);

    return null;
  }
}

export class MMKVStorageAdapter implements StorageAdapter {
  setItem<T>(key: string, value: T): void {
    try {
      const serializedValue = JSON.stringify(value);

      if (serializedValue === undefined) {
        throw new Error(`Value for key "${key}" cannot be serialized to JSON`);
      }

      mmkv.set(key, serializedValue);
    } catch (error) {
      console.error(`[MMKVStorageAdapter] Failed to save key "${key}"`, error);

      throw error;
    }
  }

  getItem<T>(key: string): T | null {
    try {
      const value = mmkv.getString(key);
      return safeJsonParse<T>(value);
    } catch (error) {
      console.error(`[MMKVStorageAdapter] Failed to read key "${key}"`, error);

      return null;
    }
  }

  removeItem(key: string): void {
    try {
      mmkv.remove(key);
    } catch (error) {
      console.error(
        `[MMKVStorageAdapter] Failed to remove key "${key}"`,
        error,
      );

      throw error;
    }
  }

  clear(): void {
    try {
      mmkv.clearAll();
    } catch (error) {
      console.error("[MMKVStorageAdapter] Failed to clear storage", error);

      throw error;
    }
  }
}
