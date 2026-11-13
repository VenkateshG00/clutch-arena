import { createClient } from '@/lib/supabase/server'
import { jsonResponse, errorResponse } from '@/lib/api-utils'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url, total_xp, overall_rank, rank_tier, games_played, wins, created_at')
      .eq('id', id)
      .single()

    if (error || !profile) {
      return errorResponse('Profile not found', 404)
    }

    return jsonResponse(profile)
  } catch {
    return errorResponse('Internal server error', 500)
  }
}
