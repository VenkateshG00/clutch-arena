export interface GameConfig {
  id: string
  seed?: number
  difficulty?: number
  duration?: number
  customSettings?: Record<string, unknown>
}

export interface GameResult {
  score: number
  accuracy?: number
  completionTime?: number
  metadata: Record<string, unknown>
}

export type GameState = 'idle' | 'countdown' | 'playing' | 'paused' | 'finished'

export interface GameDefinition {
  id: string
  name: string
  slug: string
  description: string
  category: string
  difficulty: string
  defaultDuration: number
  instructions: string[]
  thumbnailUrl?: string
}

export interface GameCallbacks {
  onScoreUpdate: (score: number) => void
  onGameEnd: (result: GameResult) => void
  onComboChange?: (combo: number) => void
  onTimeUpdate?: (timeRemaining: number) => void
}

export interface GameEngine {
  initialize: (config: GameConfig, callbacks: GameCallbacks) => void
  start: () => void
  pause: () => void
  resume: () => void
  destroy: () => void
  getState: () => GameState
  getScore: () => number
}

export const RANK_TIERS = {
  bronze: { name: 'Bronze', minXP: 0, color: '#CD7F32', icon: '🥉' },
  silver: { name: 'Silver', minXP: 1000, color: '#C0C0C0', icon: '🥈' },
  gold: { name: 'Gold', minXP: 5000, color: '#FFD700', icon: '🥇' },
  platinum: { name: 'Platinum', minXP: 15000, color: '#E5E4E2', icon: '💎' },
  diamond: { name: 'Diamond', minXP: 50000, color: '#B9F2FF', icon: '💠' },
  elite: { name: 'Elite', minXP: 100000, color: '#FF4500', icon: '🔥' },
} as const

export function getRankTier(xp: number): keyof typeof RANK_TIERS {
  if (xp >= RANK_TIERS.elite.minXP) return 'elite'
  if (xp >= RANK_TIERS.diamond.minXP) return 'diamond'
  if (xp >= RANK_TIERS.platinum.minXP) return 'platinum'
  if (xp >= RANK_TIERS.gold.minXP) return 'gold'
  if (xp >= RANK_TIERS.silver.minXP) return 'silver'
  return 'bronze'
}

export function getXPForNextRank(currentXP: number): { nextRank: string; xpNeeded: number; progress: number } {
  const tiers = Object.entries(RANK_TIERS).sort((a, b) => a[1].minXP - b[1].minXP)
  for (let i = 0; i < tiers.length - 1; i++) {
    if (currentXP < tiers[i + 1][1].minXP) {
      const currentMin = tiers[i][1].minXP
      const nextMin = tiers[i + 1][1].minXP
      return {
        nextRank: tiers[i + 1][1].name,
        xpNeeded: nextMin - currentXP,
        progress: ((currentXP - currentMin) / (nextMin - currentMin)) * 100,
      }
    }
  }
  return { nextRank: 'Elite', xpNeeded: 0, progress: 100 }
}

export const XP_REWARDS = {
  GAME_COMPLETE: 10,
  DAILY_CHALLENGE: 50,
  PERSONAL_RECORD: 25,
  FRIEND_CHALLENGE_WIN: 30,
  ACHIEVEMENT_UNLOCK: 15,
} as const

export const SUBSCRIPTION_PLANS = {
  free: {
    name: 'Free',
    price: { monthly: 0, annual: 0, currency: 'INR' },
    features: [
      'Access to core games',
      'Daily challenges',
      'Basic leaderboards',
      'Basic player profile',
      'Friend challenges',
    ],
  },
  plus: {
    name: 'Clutch Plus',
    price: { monthly: 149, annual: 1199, currency: 'INR' },
    features: [
      'Everything in Free',
      'Advanced statistics',
      'Unlimited practice',
      'Additional game modes',
      'Profile themes',
      'Custom challenges',
      'Cosmetic rewards',
    ],
  },
  pro: {
    name: 'Clutch Pro',
    price: { monthly: 299, annual: 2399, currency: 'INR' },
    features: [
      'Everything in Plus',
      'Private leagues',
      'Custom leaderboards',
      'Advanced historical analytics',
      'Competition management',
      'Priority support',
    ],
  },
} as const
