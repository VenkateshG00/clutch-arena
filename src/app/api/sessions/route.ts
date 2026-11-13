import { createClient } from '@/lib/supabase/server'
import { jsonResponse, errorResponse, requireAuth } from '@/lib/api-utils'
import { gameSessionSchema } from '@/lib/validation'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { user, response } = await requireAuth(supabase)
    if (response) return response

    const body = await request.json()
    const parsed = gameSessionSchema.safeParse(body)
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message)
    }

    const { gameId, challengeId } = parsed.data
    const sessionToken = crypto.randomUUID()

    const { data: session, error } = await supabase
      .from('game_sessions')
      .insert({
        user_id: user.id,
        game_id: gameId,
        challenge_id: challengeId ?? null,
        session_token: sessionToken,
        status: 'active',
        started_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      return errorResponse(error.message, 500)
    }

    return jsonResponse(session, 201)
  } catch {
    return errorResponse('Internal server error', 500)
  }
}
