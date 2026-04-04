import * as SecureStore from 'expo-secure-store'
import { Platform } from 'react-native'
import type { AuthSession } from './types'

const SESSION_KEY = 'antapp.mobile.auth.session'

async function getItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    if (typeof localStorage === 'undefined') return null
    return localStorage.getItem(key)
  }
  return SecureStore.getItemAsync(key)
}

async function setItem(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    if (typeof localStorage === 'undefined') return
    localStorage.setItem(key, value)
    return
  }
  await SecureStore.setItemAsync(key, value)
}

async function deleteItem(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    if (typeof localStorage === 'undefined') return
    localStorage.removeItem(key)
    return
  }
  await SecureStore.deleteItemAsync(key)
}

export async function loadAuthSession(): Promise<AuthSession | null> {
  const raw = await getItem(SESSION_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw) as AuthSession
  } catch {
    await deleteItem(SESSION_KEY)
    return null
  }
}

export function persistAuthSession(session: AuthSession): Promise<void> {
  return setItem(SESSION_KEY, JSON.stringify(session))
}

export function clearAuthSession(): Promise<void> {
  return deleteItem(SESSION_KEY)
}
