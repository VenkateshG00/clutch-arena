export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type RankTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'elite'
export type GameCategory = 'reaction' | 'memory' | 'typing' | 'puzzle' | 'strategy'
export type GameDifficulty = 'easy' | 'medium' | 'hard'
export type SessionStatus = 'active' | 'completed' | 'abandoned' | 'invalidated'
export type ChallengeStatus = 'pending' | 'active' | 'completed' | 'expired'
export type FriendshipStatus = 'pending' | 'accepted' | 'declined' | 'blocked'
export type SubscriptionPlan = 'free' | 'plus' | 'pro'
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'past_due'
export type PaymentProvider = 'razorpay' | 'stripe'
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'refunded'

export interface Profile {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  total_xp: number
  overall_rank: number
  rank_tier: RankTier
  games_played: number
  wins: number
  created_at: string
  updated_at: string
}

export interface Game {
  id: string
  slug: string
  name: string
  description: string
  category: GameCategory
  difficulty: GameDifficulty
  duration: number
  instructions: string
  thumbnail_url: string | null
  is_active: boolean
  created_at: string
}

export interface GameSession {
  id: string
  user_id: string
  game_id: string
  challenge_id: string | null
  started_at: string
  completed_at: string | null
  status: SessionStatus
  session_token: string
}

export interface Score {
  id: string
  user_id: string
  game_id: string
  session_id: string
  score: number
  accuracy: number | null
  completion_time: number | null
  metadata: Json
  is_personal_best: boolean
  created_at: string
}

export interface DailyChallenge {
  id: string
  game_id: string
  challenge_date: string
  configuration: Json
  status: ChallengeStatus
  created_at: string
}

export interface DailyChallengeResult {
  id: string
  challenge_id: string
  user_id: string
  score_id: string
  created_at: string
}

export interface Friendship {
  id: string
  requester_id: string
  addressee_id: string
  status: FriendshipStatus
  created_at: string
}

export interface FriendChallenge {
  id: string
  creator_id: string
  opponent_id: string | null
  game_id: string
  challenge_code: string
  configuration: Json
  status: ChallengeStatus
  expires_at: string
  created_at: string
}

export interface ChallengeResult {
  id: string
  challenge_id: string
  user_id: string
  score_id: string
  created_at: string
}

export interface Achievement {
  id: string
  slug: string
  name: string
  description: string
  icon: string
  xp_reward: number
  category: string
}

export interface UserAchievement {
  id: string
  user_id: string
  achievement_id: string
  unlocked_at: string
}

export interface Subscription {
  id: string
  user_id: string
  plan: SubscriptionPlan
  status: SubscriptionStatus
  provider: PaymentProvider | null
  provider_subscription_id: string | null
  current_period_start: string | null
  current_period_end: string | null
  created_at: string
}

export interface Transaction {
  id: string
  user_id: string
  provider: PaymentProvider
  provider_transaction_id: string
  amount: number
  currency: string
  status: TransactionStatus
  created_at: string
}

export interface LeaderboardEntry {
  rank: number
  user_id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  score: number
  rank_tier: RankTier
}

export interface GameStats {
  game_id: string
  games_played: number
  best_score: number
  average_score: number
  total_time_played: number
}
