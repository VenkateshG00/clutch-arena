import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'
import { jsonResponse, errorResponse, requireAuth } from '@/lib/api-utils'
import { scoreSubmissionSchema } from '@/lib/validation'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { user, response } = await requireAuth(supabase)
    if (response) return response

    const body = await request.json()
    const parsed = scoreSubmissionSchema.safeParse(body)
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message)
    }

    const { sessionId, score, accuracy, completionTime, metadata } = parsed.data

    // Verify session exists and belongs to user
    const { data: session, error: sessionError } = await supabase
      .from('game_sessions')
      .select('*, games:game_id(duration)')
      .eq('id', sessionId)
      .single()

    if (sessionError || !session) {
      return errorResponse('Session not found', 404)
    }

    if (session.user_id !== user.id) {
      return errorResponse('Session does not belong to you', 403)
    }

    if (session.status !== 'active') {
      return errorResponse('Session is not active', 400)
    }

    // Check duration hasn't been wildly exceeded (10% buffer)
    const game = session.games as { duration: number }
    const sessionStart = new Date(session.started_at).getTime()
    const now = Date.now()
    const elapsed = (now - sessionStart) / 1000
    const maxDuration = game.duration * 1.1

    if (elapsed > maxDuration) {
      // Mark session as invalidated
      await supabase
        .from('game_sessions')
        .update({ status: 'invalidated' })
        .eq('id', sessionId)

      return errorResponse('Session duration exceeded', 400)
    }

    // Mark session completed
    await supabase
      .from('game_sessions')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', sessionId)

    // Check if personal best
    const { data: existingBest } = await supabase
      .from('scores')
      .select('score')
      .eq('game_id', session.game_id)
      .eq('user_id', user.id)
      .eq('is_personal_best', true)
      .single()

    const isPersonalBest = !existingBest || score > existingBest.score

    // If new personal best, unmark the old one
    if (isPersonalBest && existingBest) {
      await supabase
        .from('scores')
        .update({ is_personal_best: false })
        .eq('game_id', session.game_id)
        .eq('user_id', user.id)
        .eq('is_personal_best', true)
    }

    // Insert score
    const { data: newScore, error: scoreError } = await supabase
      .from('scores')
      .insert({
        user_id: user.id,
        game_id: session.game_id,
        session_id: sessionId,
        score,
        accuracy: accuracy ?? null,
        completion_time: completionTime ?? null,
        metadata: metadata ?? {},
        is_personal_best: isPersonalBest,
      })
      .select()
      .single()

    if (scoreError) {
      return errorResponse(scoreError.message, 500)
    }

    // Calculate and award XP (server-side with service client)
    const serviceClient = await createServiceClient()
    const baseXp = Math.floor(score / 10)
    const personalBestBonus = isPersonalBest ? 50 : 0
    const xpEarned = baseXp + personalBestBonus

    if (xpEarned > 0) {
      // Get current profile XP
      const { data: profile } = await serviceClient
        .from('profiles')
        .select('total_xp, games_played')
        .eq('id', user.id)
        .single()

      if (profile) {
        const newTotalXp = profile.total_xp + xpEarned
        const newRankTier = calculateRankTier(newTotalXp)

        await serviceClient
          .from('profiles')
          .update({
            total_xp: newTotalXp,
            games_played: profile.games_played + 1,
            rank_tier: newRankTier,
          })
          .eq('id', user.id)
      }
    }

    return jsonResponse({ ...newScore, xp_earned: xpEarned }, 201)
  } catch {
    return errorResponse('Internal server error', 500)
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const url = new URL(request.url)
    const gameId = url.searchParams.get('gameId')
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '10', 10), 100)
    const offset = parseInt(url.searchParams.get('offset') || '0', 10)

    if (!gameId) {
      return errorResponse('gameId is required')
    }

    const { data, error, count } = await supabase
      .from('scores')
      .select('*, profiles:user_id(username, display_name, avatar_url)', { count: 'exact' })
      .eq('game_id', gameId)
      .order('score', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      return errorResponse(error.message, 500)
    }

    return jsonResponse({ scores: data, total: count, limit, offset })
  } catch {
    return errorResponse('Internal server error', 500)
  }
}

function calculateRankTier(totalXp: number): string {
  if (totalXp >= 50000) return 'elite'
  if (totalXp >= 25000) return 'diamond'
  if (totalXp >= 10000) return 'platinum'
  if (totalXp >= 5000) return 'gold'
  if (totalXp >= 1000) return 'silver'
  return 'bronze'
}
