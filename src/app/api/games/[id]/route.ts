import { createClient } from '@/lib/supabase/server'
import { jsonResponse, errorResponse } from '@/lib/api-utils'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: game, error } = await supabase
      .from('games')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !game) {
      return errorResponse('Game not found', 404)
    }

    // Check if user is authenticated and get their personal best
    let personalBest = null
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { data: best } = await supabase
        .from('scores')
        .select('score, accuracy, completion_time, created_at')
        .eq('game_id', id)
        .eq('user_id', user.id)
        .eq('is_personal_best', true)
        .single()

      personalBest = best
    }

    return jsonResponse({ ...game, personal_best: personalBest })
  } catch {
    return errorResponse('Internal server error', 500)
  }
}
