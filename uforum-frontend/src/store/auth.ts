'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserSummary } from '@/types'

interface AuthState {
  user: UserSummary | null
  isAuthenticated: boolean
  login: (user: UserSummary, access: string, refresh: string) => void
  logout: () => void
  updateUser: (u: Partial<UserSummary>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (user, access, refresh) => {
        localStorage.setItem('uf_access', access)
        localStorage.setItem('uf_refresh', refresh)
        set({ user, isAuthenticated: true })
      },
      logout: () => {
        localStorage.removeItem('uf_access')
        localStorage.removeItem('uf_refresh')
        set({ user: null, isAuthenticated: false })
      },
      updateUser: (u) => set((s) => ({ user: s.user ? { ...s.user, ...u } : null })),
    }),
    { name: 'uf-auth', partialize: (s) => ({ user: s.user, isAuthenticated: s.isAuthenticated }) }
  )
)
