import { createClient } from '@/lib/supabase/server'
import { jsonResponse, errorResponse, requireAuth } from '@/lib/api-utils'
import { z } from 'zod/v4'

const challengeSubmitSchema = z.object({
  scoreId: z.string().uuid().optional(),
})

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params
    const supabase = await createClient()

    const { data: challenge, error } = await supabase
      .from('friend_challenges')
      .select('*, games:game_id(*), creator:creator_id(username, display_name, avatar_url), opponent:opponent_id(username, display_name, avatar_url)')
      .eq('challenge_code', code)
      .single()

    if (error || !challenge) {
      return errorResponse('Challenge not found', 404)
    }

    // Get challenge results
    const { data: results } = await supabase
      .from('challenge_results')
      .select('*, profiles:user_id(username, display_name), scores:score_id(score, accuracy, completion_time)')
      .eq('challenge_id', challenge.id)

    return jsonResponse({ ...challenge, results: results || [] })
  } catch {
    return errorResponse('Internal server error', 500)
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params
    const supabase = await createClient()
    const { user, response } = await requireAuth(supabase)
    if (response) return response

    const body = await request.json()
    const parsed = challengeSubmitSchema.safeParse(body)
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message)
    }

    // Get the challenge
    const { data: challenge, error: challengeError } = await supabase
      .from('friend_challenges')
      .select('*')
      .eq('challenge_code', code)
      .single()

    if (challengeError || !challenge) {
      return errorResponse('Challenge not found', 404)
    }

    // Check if expired
    if (new Date(challenge.expires_at) < new Date()) {
      return errorResponse('This challenge has expired', 410)
    }

    if (challenge.status === 'completed') {
      return errorResponse('This challenge is already completed', 400)
    }

    const { scoreId } = parsed.data

    // If no scoreId, user is joining the challenge
    if (!scoreId) {
      // Set opponent if not already set
      if (!challenge.opponent_id && challenge.creator_id !== user.id) {
        const { data: updated, error: updateError } = await supabase
          .from('friend_challenges')
          .update({ opponent_id: user.id, status: 'active' })
          .eq('id', challenge.id)
          .select()
          .single()

        if (updateError) {
          return errorResponse(updateError.message, 500)
        }

        return jsonResponse(updated)
      }

      return errorResponse('Challenge already has an opponent', 400)
    }

    // Submitting a result
    // Verify user is part of this challenge
    if (challenge.creator_id !== user.id && challenge.opponent_id !== user.id) {
      return errorResponse('You are not part of this challenge', 403)
    }

    // Check user hasn't already submitted
    const { data: existingResult } = await supabase
      .from('challenge_results')
      .select('id')
      .eq('challenge_id', challenge.id)
      .eq('user_id', user.id)
      .single()

    if (existingResult) {
      return errorResponse('You have already submitted a result for this challenge', 409)
    }

    // Insert result
    const { data: result, error: insertError } = await supabase
      .from('challenge_results')
      .insert({
        challenge_id: challenge.id,
        user_id: user.id,
        score_id: scoreId,
      })
      .select()
      .single()

    if (insertError) {
      return errorResponse(insertError.message, 500)
    }

    // Check if both players have submitted - mark challenge as completed
    const { count } = await supabase
      .from('challenge_results')
      .select('*', { count: 'exact', head: true })
      .eq('challenge_id', challenge.id)

    if (count && count >= 2) {
      await supabase
        .from('friend_challenges')
        .update({ status: 'completed' })
        .eq('id', challenge.id)
    }

    return jsonResponse(result, 201)
  } catch {
    return errorResponse('Internal server error', 500)
  }
}
