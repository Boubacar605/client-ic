import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export function readStorage(key: string): Promise<string | null> {
  if (Platform.OS === 'web') return Promise.resolve(globalThis.localStorage?.getItem(key) ?? null);
  return SecureStore.getItemAsync(key);
}

export function writeStorage(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    globalThis.localStorage?.setItem(key, value);
    return Promise.resolve();
  }
  return SecureStore.setItemAsync(key, value);
}

export function deleteStorage(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    globalThis.localStorage?.removeItem(key);
    return Promise.resolve();
  }
  return SecureStore.deleteItemAsync(key);
}
