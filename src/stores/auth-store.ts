'use client'

import { create } from 'zustand'
import type { Profile, Subscription } from '@/types/database'

interface AuthState {
  user: { id: string; email: string } | null
  profile: Profile | null
  subscription: Subscription | null
  isLoading: boolean
  setUser: (user: { id: string; email: string } | null) => void
  setProfile: (profile: Profile | null) => void
  setSubscription: (subscription: Subscription | null) => void
  setLoading: (loading: boolean) => void
  isPremium: () => boolean
  isPro: () => boolean
  reset: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  subscription: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setSubscription: (subscription) => set({ subscription }),
  setLoading: (isLoading) => set({ isLoading }),
  isPremium: () => {
    const sub = get().subscription
    return sub?.status === 'active' && (sub.plan === 'plus' || sub.plan === 'pro')
  },
  isPro: () => {
    const sub = get().subscription
    return sub?.status === 'active' && sub.plan === 'pro'
  },
  reset: () => set({ user: null, profile: null, subscription: null, isLoading: false }),
}))
