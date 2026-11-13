import { createClient } from '@/lib/supabase/server'
import { jsonResponse, errorResponse } from '@/lib/api-utils'

export async function GET() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (error) {
      return errorResponse(error.message, 500)
    }

    return jsonResponse(data)
  } catch {
    return errorResponse('Internal server error', 500)
  }
}
