import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { authenticate, refreshWithToken } from './api'
import {
  clearAuthSession,
  loadAuthSession,
  persistAuthSession,
} from './storage'
import type { AuthResponse, AuthSession, AuthUser } from './types'

type AuthStatus = 'loading' | 'authenticated' | 'anonymous'

type AuthContextValue = {
  status: AuthStatus
  user: AuthUser | null
  login: (email: string, password: string) => Promise<string | null>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function toSession(data: AuthResponse): AuthSession {
  return {
    accessToken: data.jwToken,
    refreshToken: data.refreshToken,
    user: {
      id: data.id,
      userName: data.userName,
      email: data.email,
      roles: data.roles,
    },
  }
}

function canUseMobileClient(roles: string[]): boolean {
  return roles.includes('Basic')
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading')
  const [session, setSession] = useState<AuthSession | null>(null)

  const applySession = useCallback((nextSession: AuthSession) => {
    setSession(nextSession)
    setStatus('authenticated')
  }, [])

  const clearSession = useCallback(async () => {
    setSession(null)
    setStatus('anonymous')
    await clearAuthSession()
  }, [])

  useEffect(() => {
    const restore = async () => {
      const stored = await loadAuthSession()
      if (!stored) {
        setStatus('anonymous')
        return
      }

      if (stored.refreshToken) {
        try {
          const refreshed = await refreshWithToken(stored.refreshToken)
          const nextSession = toSession(refreshed)
          applySession(nextSession)
          await persistAuthSession(nextSession)
          return
        } catch {}
      }

      if (stored.accessToken && stored.user) {
        applySession(stored)
        return
      }

      await clearSession()
    }

    restore().catch(async () => {
      await clearSession()
    })
  }, [applySession, clearSession])

  const login = useCallback(
    async (email: string, password: string): Promise<string | null> => {
      try {
        const data = await authenticate(email.trim(), password)
        if (!canUseMobileClient(data.roles)) {
          return 'Mobile client sadece user rolü olan hesaplar içindir.'
        }

        const nextSession = toSession(data)
        applySession(nextSession)
        await persistAuthSession(nextSession)
        return null
      } catch (error) {
        if (error instanceof Error) return error.message
        return 'Login failed'
      }
    },
    [applySession]
  )

  const logout = useCallback(async () => {
    await clearSession()
  }, [clearSession])

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user: session?.user ?? null,
      login,
      logout,
    }),
    [status, session, login, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}
