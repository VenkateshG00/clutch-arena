import { createClient } from '@/lib/supabase/server'
import { jsonResponse, errorResponse, requireAuth } from '@/lib/api-utils'
import { profileUpdateSchema } from '@/lib/validation'

export async function GET() {
  try {
    const supabase = await createClient()
    const { user, response } = await requireAuth(supabase)
    if (response) return response

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error || !profile) {
      return errorResponse('Profile not found', 404)
    }

    // Get game stats
    const { data: stats } = await supabase
      .from('scores')
      .select('game_id, score')
      .eq('user_id', user.id)

    const gameStats: Record<string, { games_played: number; best_score: number; total_score: number }> = {}
    for (const s of stats || []) {
      if (!gameStats[s.game_id]) {
        gameStats[s.game_id] = { games_played: 0, best_score: 0, total_score: 0 }
      }
      gameStats[s.game_id].games_played++
      gameStats[s.game_id].total_score += s.score
      if (s.score > gameStats[s.game_id].best_score) {
        gameStats[s.game_id].best_score = s.score
      }
    }

    return jsonResponse({ profile, game_stats: gameStats })
  } catch {
    return errorResponse('Internal server error', 500)
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const { user, response } = await requireAuth(supabase)
    if (response) return response

    const body = await request.json()
    const parsed = profileUpdateSchema.safeParse(body)
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message)
    }

    const updates = parsed.data

    // Check username uniqueness if updating
    if (updates.username) {
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', updates.username)
        .neq('id', user.id)
        .single()

      if (existing) {
        return errorResponse('Username already taken', 409)
      }
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      return errorResponse(error.message, 500)
    }

    return jsonResponse(profile)
  } catch {
    return errorResponse('Internal server error', 500)
  }
}
