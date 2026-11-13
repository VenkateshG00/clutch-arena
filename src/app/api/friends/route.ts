import { createClient } from '@/lib/supabase/server'
import { jsonResponse, errorResponse, requireAuth } from '@/lib/api-utils'
import { friendRequestSchema } from '@/lib/validation'

export async function GET() {
  try {
    const supabase = await createClient()
    const { user, response } = await requireAuth(supabase)
    if (response) return response

    // Get accepted friendships where user is either requester or addressee
    const { data: asRequester } = await supabase
      .from('friendships')
      .select('*, profiles:addressee_id(id, username, display_name, avatar_url, rank_tier)')
      .eq('requester_id', user.id)
      .eq('status', 'accepted')

    const { data: asAddressee } = await supabase
      .from('friendships')
      .select('*, profiles:requester_id(id, username, display_name, avatar_url, rank_tier)')
      .eq('addressee_id', user.id)
      .eq('status', 'accepted')

    const friends = [
      ...(asRequester || []).map(f => ({ friendship_id: f.id, friend: f.profiles, created_at: f.created_at })),
      ...(asAddressee || []).map(f => ({ friendship_id: f.id, friend: f.profiles, created_at: f.created_at })),
    ]

    return jsonResponse(friends)
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
    const parsed = friendRequestSchema.safeParse(body)
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message)
    }

    const { addresseeId } = parsed.data

    if (addresseeId === user.id) {
      return errorResponse('You cannot send a friend request to yourself')
    }

    // Check no existing friendship in either direction
    const { data: existing } = await supabase
      .from('friendships')
      .select('id, status')
      .or(
        `and(requester_id.eq.${user.id},addressee_id.eq.${addresseeId}),and(requester_id.eq.${addresseeId},addressee_id.eq.${user.id})`
      )
      .single()

    if (existing) {
      return errorResponse(`Friendship already exists (status: ${existing.status})`, 409)
    }

    const { data: friendship, error } = await supabase
      .from('friendships')
      .insert({
        requester_id: user.id,
        addressee_id: addresseeId,
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      return errorResponse(error.message, 500)
    }

    return jsonResponse(friendship, 201)
  } catch {
    return errorResponse('Internal server error', 500)
  }
}
