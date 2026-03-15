import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { authenticate, refreshWithToken, registerAccount } from './api'
import {
  clearAuthSession,
  loadAuthSession,
  persistAuthSession,
} from './storage'
import type { AuthMutationResult, AuthResponse, AuthSession, AuthUser } from './types'

type AuthStatus = 'loading' | 'authenticated' | 'anonymous'

type AuthContextValue = {
  status: AuthStatus
  user: AuthUser | null
  login: (email: string, password: string) => Promise<string | null>
  register: (
    fullName: string,
    email: string,
    password: string,
    confirmPassword: string
  ) => Promise<AuthMutationResult>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function normalizeRoles(roles: string[]): string[] {
  return Array.from(new Set(roles.map((r) => r.trim()).filter(Boolean)))
}

function toSession(data: AuthResponse): AuthSession {
  return {
    accessToken: data.jwToken,
    refreshToken: data.refreshToken,
    user: {
      id: data.id,
      userName: data.userName,
      email: data.email,
      roles: normalizeRoles(data.roles),
    },
  }
}

function canUseMobileClient(roles: string[]): boolean {
  return normalizeRoles(roles).includes('BasicUser')
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

  const register = useCallback(
    async (
      fullName: string,
      email: string,
      password: string,
      confirmPassword: string
    ): Promise<AuthMutationResult> => {
      try {
        const message = await registerAccount(
          fullName.trim(),
          email.trim(),
          password,
          confirmPassword
        )

        return {
          ok: true,
          message,
        }
      } catch (error) {
        return {
          ok: false,
          message:
            error instanceof Error ? error.message : 'Registration failed',
        }
      }
    },
    []
  )

  const logout = useCallback(async () => {
    await clearSession()
  }, [clearSession])

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user: session?.user ?? null,
      login,
      register,
      logout,
    }),
    [status, session, login, register, logout]
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
