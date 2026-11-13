import { createClient } from '@/lib/supabase/server'
import { jsonResponse, errorResponse, requireAuth } from '@/lib/api-utils'

const RANK_TIERS = [
  { tier: 'bronze', minXp: 0, maxXp: 999 },
  { tier: 'silver', minXp: 1000, maxXp: 4999 },
  { tier: 'gold', minXp: 5000, maxXp: 9999 },
  { tier: 'platinum', minXp: 10000, maxXp: 24999 },
  { tier: 'diamond', minXp: 25000, maxXp: 49999 },
  { tier: 'elite', minXp: 50000, maxXp: Infinity },
]

export async function GET() {
  try {
    const supabase = await createClient()
    const { user, response } = await requireAuth(supabase)
    if (response) return response

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('total_xp, rank_tier, overall_rank, games_played')
      .eq('id', user.id)
      .single()

    if (error || !profile) {
      return errorResponse('Profile not found', 404)
    }

    // Find current rank info
    const currentRank = RANK_TIERS.find(r => r.tier === profile.rank_tier) || RANK_TIERS[0]
    const nextRank = RANK_TIERS.find(r => r.minXp > profile.total_xp)

    const xpToNextRank = nextRank ? nextRank.minXp - profile.total_xp : 0
    const progressInCurrentTier = nextRank
      ? ((profile.total_xp - currentRank.minXp) / (nextRank.minXp - currentRank.minXp)) * 100
      : 100

    return jsonResponse({
      total_xp: profile.total_xp,
      rank_tier: profile.rank_tier,
      overall_rank: profile.overall_rank,
      games_played: profile.games_played,
      current_tier: {
        name: currentRank.tier,
        min_xp: currentRank.minXp,
        max_xp: currentRank.maxXp === Infinity ? null : currentRank.maxXp,
      },
      next_tier: nextRank
        ? {
            name: nextRank.tier,
            min_xp: nextRank.minXp,
            xp_needed: xpToNextRank,
          }
        : null,
      progress_percent: Math.round(progressInCurrentTier * 100) / 100,
    })
  } catch {
    return errorResponse('Internal server error', 500)
  }
}
