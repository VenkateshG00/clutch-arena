import { createClient } from '@/lib/supabase/server'
import { jsonResponse, errorResponse, requireAuth } from '@/lib/api-utils'
import { friendChallengeSchema } from '@/lib/validation'

function generateChallengeCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export async function GET() {
  try {
    const supabase = await createClient()
    const { user, response } = await requireAuth(supabase)
    if (response) return response

    const { data, error } = await supabase
      .from('friend_challenges')
      .select('*, games:game_id(name, slug, thumbnail_url), creator:creator_id(username, display_name, avatar_url), opponent:opponent_id(username, display_name, avatar_url)')
      .or(`creator_id.eq.${user.id},opponent_id.eq.${user.id}`)
      .order('created_at', { ascending: false })

    if (error) {
      return errorResponse(error.message, 500)
    }

    return jsonResponse(data)
  } catch {
    return errorResponse('Internal server error', 500)
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { user, response } = await requireAuth(supabase)
    if (response) return response

    const body = await request.json()
    const parsed = friendChallengeSchema.safeParse(body)
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message)
    }

    const { gameId, opponentId } = parsed.data
    const challengeCode = generateChallengeCode()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

    const { data: challenge, error } = await supabase
      .from('friend_challenges')
      .insert({
        creator_id: user.id,
        opponent_id: opponentId ?? null,
        game_id: gameId,
        challenge_code: challengeCode,
        configuration: {},
        status: 'pending',
        expires_at: expiresAt,
      })
      .select()
      .single()

    if (error) {
      return errorResponse(error.message, 500)
    }

    return jsonResponse(challenge, 201)
  } catch {
    return errorResponse('Internal server error', 500)
  }
}
