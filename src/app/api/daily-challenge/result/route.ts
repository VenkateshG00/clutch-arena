import { createClient } from '@/lib/supabase/server'
import { jsonResponse, errorResponse, requireAuth } from '@/lib/api-utils'
import { z } from 'zod/v4'

const dailyChallengeResultSchema = z.object({
  scoreId: z.string().uuid(),
})

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { user, response } = await requireAuth(supabase)
    if (response) return response

    const body = await request.json()
    const parsed = dailyChallengeResultSchema.safeParse(body)
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message)
    }

    const { scoreId } = parsed.data
    const today = new Date().toISOString().split('T')[0]

    // Verify challenge exists for today
    const { data: challenge, error: challengeError } = await supabase
      .from('daily_challenges')
      .select('id')
      .eq('challenge_date', today)
      .single()

    if (challengeError || !challenge) {
      return errorResponse('No daily challenge found for today', 404)
    }

    // Check user hasn't already submitted
    const { data: existing } = await supabase
      .from('daily_challenge_results')
      .select('id')
      .eq('challenge_id', challenge.id)
      .eq('user_id', user.id)
      .single()

    if (existing) {
      return errorResponse('You have already submitted a result for today\'s challenge', 409)
    }

    // Verify score belongs to user
    const { data: score } = await supabase
      .from('scores')
      .select('id')
      .eq('id', scoreId)
      .eq('user_id', user.id)
      .single()

    if (!score) {
      return errorResponse('Score not found or does not belong to you', 404)
    }

    // Insert result
    const { data: result, error: insertError } = await supabase
      .from('daily_challenge_results')
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

    return jsonResponse(result, 201)
  } catch {
    return errorResponse('Internal server error', 500)
  }
}
