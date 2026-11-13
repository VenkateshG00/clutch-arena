import { XP_REWARDS } from '@/types/game'

export function calculateXPEarned(params: {
  gameCompleted: boolean
  isDailyChallenge: boolean
  isPersonalBest: boolean
  friendChallengeWon: boolean
}): number {
  let xp = 0
  if (params.gameCompleted) xp += XP_REWARDS.GAME_COMPLETE
  if (params.isDailyChallenge) xp += XP_REWARDS.DAILY_CHALLENGE
  if (params.isPersonalBest) xp += XP_REWARDS.PERSONAL_RECORD
  if (params.friendChallengeWon) xp += XP_REWARDS.FRIEND_CHALLENGE_WIN
  return xp
}

export function validateScorePlausibility(
  gameSlug: string,
  score: number,
  completionTime: number | undefined,
  gameDuration: number
): { valid: boolean; reason?: string } {
  if (score < 0) return { valid: false, reason: 'Score cannot be negative' }
  if (score > 999999) return { valid: false, reason: 'Score exceeds maximum' }

  if (completionTime !== undefined) {
    const maxAllowed = gameDuration * 1.1
    if (completionTime > maxAllowed) {
      return { valid: false, reason: 'Completion time exceeds game duration' }
    }
  }

  const maxScores: Record<string, number> = {
    'color-snap': 50000,
    'memory-matrix': 100000,
    'typeclash': 30000,
  }
  const maxScore = maxScores[gameSlug]
  if (maxScore && score > maxScore) {
    return { valid: false, reason: 'Score exceeds plausible maximum for this game' }
  }

  return { valid: true }
}

export function generateChallengeCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export function formatScore(score: number): string {
  return score.toLocaleString()
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`
}

export function formatWPM(wpm: number): string {
  return `${Math.round(wpm)} WPM`
}

export function formatAccuracy(accuracy: number): string {
  return `${accuracy.toFixed(1)}%`
}
