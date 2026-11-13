import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'
import { jsonResponse, errorResponse } from '@/lib/api-utils'

export async function GET() {
  try {
    const supabase = await createClient()
    const today = new Date().toISOString().split('T')[0] // UTC date

    // Try to get today's challenge
    let { data: challenge, error } = await supabase
      .from('daily_challenges')
      .select('*, games:game_id(*)')
      .eq('challenge_date', today)
      .single()

    // Auto-create if none exists
    if (!challenge) {
      const serviceClient = await createServiceClient()

      // Pick a random active game
      const { data: games } = await serviceClient
        .from('games')
        .select('id')
        .eq('is_active', true)

      if (!games || games.length === 0) {
        return errorResponse('No active games available', 404)
      }

      const randomGame = games[Math.floor(Math.random() * games.length)]

      const { data: newChallenge, error: createError } = await serviceClient
        .from('daily_challenges')
        .insert({
          game_id: randomGame.id,
          challenge_date: today,
          configuration: {},
          status: 'active',
        })
        .select('*, games:game_id(*)')
        .single()

      if (createError) {
        return errorResponse(createError.message, 500)
      }

      challenge = newChallenge
    }

    if (error && !challenge) {
      return errorResponse(error.message, 500)
    }

    // Check if user has played today's challenge
    let userResult = null
    const { data: { user } } = await supabase.auth.getUser()

    if (user && challenge) {
      const { data: result } = await supabase
        .from('daily_challenge_results')
        .select('*, scores:score_id(score, accuracy, completion_time)')
        .eq('challenge_id', challenge.id)
        .eq('user_id', user.id)
        .single()

      userResult = result
    }

    return jsonResponse({ challenge, user_result: userResult })
  } catch {
    return errorResponse('Internal server error', 500)
  }
}
