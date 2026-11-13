import { createClient } from '@/lib/supabase/server'
import { jsonResponse, errorResponse } from '@/lib/api-utils'

export async function GET() {
  try {
    const supabase = await createClient()

    // Get all achievements
    const { data: achievements, error } = await supabase
      .from('achievements')
      .select('*')
      .order('category')
      .order('xp_reward')

    if (error) {
      return errorResponse(error.message, 500)
    }

    // Get user's unlocked achievements if authenticated
    let unlockedIds: string[] = []
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { data: unlocked } = await supabase
        .from('user_achievements')
        .select('achievement_id, unlocked_at')
        .eq('user_id', user.id)

      unlockedIds = (unlocked || []).map(u => u.achievement_id)

      const achievementsWithStatus = (achievements || []).map(a => ({
        ...a,
        unlocked: unlockedIds.includes(a.id),
        unlocked_at: unlocked?.find(u => u.achievement_id === a.id)?.unlocked_at ?? null,
      }))

      return jsonResponse(achievementsWithStatus)
    }

    return jsonResponse(achievements)
  } catch {
    return errorResponse('Internal server error', 500)
  }
}
