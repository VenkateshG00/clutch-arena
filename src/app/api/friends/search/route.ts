import { createClient } from '@/lib/supabase/server'
import { jsonResponse, errorResponse, requireAuth } from '@/lib/api-utils'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    const { response } = await requireAuth(supabase)
    if (response) return response

    const url = new URL(request.url)
    const query = url.searchParams.get('q')

    if (!query || query.length < 2) {
      return errorResponse('Search query must be at least 2 characters')
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url, rank_tier')
      .ilike('username', `%${query}%`)
      .limit(10)

    if (error) {
      return errorResponse(error.message, 500)
    }

    return jsonResponse(data)
  } catch {
    return errorResponse('Internal server error', 500)
  }
}
