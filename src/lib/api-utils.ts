import { SupabaseClient } from '@supabase/supabase-js'

export function jsonResponse(data: unknown, status = 200) {
  return Response.json({ data }, { status })
}

export function errorResponse(message: string, status = 400) {
  return Response.json({ error: message }, { status })
}

export async function requireAuth(supabase: SupabaseClient) {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    return { user: null, response: errorResponse('Unauthorized', 401) }
  }
  return { user, response: null }
}
