import { createClient } from '@/lib/supabase/server'
import { jsonResponse, errorResponse } from '@/lib/api-utils'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const url = new URL(request.url)
    const gameId = url.searchParams.get('gameId')
    const type = url.searchParams.get('type') || 'global'
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20', 10), 100)
    const offset = parseInt(url.searchParams.get('offset') || '0', 10)

    if (!['global', 'weekly', 'daily'].includes(type)) {
      return errorResponse('Invalid type. Must be global, weekly, or daily')
    }

    let query = supabase
      .from('scores')
      .select('score, user_id, created_at, profiles:user_id(username, display_name, avatar_url, rank_tier)')

    if (gameId) {
      query = query.eq('game_id', gameId)
    }

    // Apply time filter
    if (type === 'weekly') {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      query = query.gte('created_at', weekAgo.toISOString())
    } else if (type === 'daily') {
      const today = new Date()
      today.setUTCHours(0, 0, 0, 0)
      query = query.gte('created_at', today.toISOString())
    }

    const { data, error } = await query
      .order('score', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      return errorResponse(error.message, 500)
    }

    // Format leaderboard entries with rank
    const entries = (data || []).map((entry, index) => {
      const profile = entry.profiles as unknown as { username: string; display_name: string | null; avatar_url: string | null; rank_tier: string } | null
      return {
        rank: offset + index + 1,
        user_id: entry.user_id,
        username: profile?.username ?? 'Unknown',
        display_name: profile?.display_name ?? null,
        avatar_url: profile?.avatar_url ?? null,
        score: entry.score,
        rank_tier: profile?.rank_tier ?? 'bronze',
      }
    })

    return jsonResponse({ entries, type, limit, offset })
  } catch {
    return errorResponse('Internal server error', 500)
  }
}
