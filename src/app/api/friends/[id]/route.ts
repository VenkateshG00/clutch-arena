import { createClient } from '@/lib/supabase/server'
import { jsonResponse, errorResponse, requireAuth } from '@/lib/api-utils'
import { z } from 'zod/v4'

const friendshipUpdateSchema = z.object({
  status: z.enum(['accepted', 'declined']),
})

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { user, response } = await requireAuth(supabase)
    if (response) return response

    const body = await request.json()
    const parsed = friendshipUpdateSchema.safeParse(body)
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message)
    }

    // Get the friendship
    const { data: friendship, error: fetchError } = await supabase
      .from('friendships')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !friendship) {
      return errorResponse('Friendship not found', 404)
    }

    // Only the addressee can accept/decline
    if (friendship.addressee_id !== user.id) {
      return errorResponse('Only the recipient can accept or decline a friend request', 403)
    }

    if (friendship.status !== 'pending') {
      return errorResponse('This friend request is no longer pending', 400)
    }

    const { data: updated, error } = await supabase
      .from('friendships')
      .update({ status: parsed.data.status })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return errorResponse(error.message, 500)
    }

    return jsonResponse(updated)
  } catch {
    return errorResponse('Internal server error', 500)
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { user, response } = await requireAuth(supabase)
    if (response) return response

    // Verify user is part of this friendship
    const { data: friendship, error: fetchError } = await supabase
      .from('friendships')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !friendship) {
      return errorResponse('Friendship not found', 404)
    }

    if (friendship.requester_id !== user.id && friendship.addressee_id !== user.id) {
      return errorResponse('You are not part of this friendship', 403)
    }

    const { error } = await supabase
      .from('friendships')
      .delete()
      .eq('id', id)

    if (error) {
      return errorResponse(error.message, 500)
    }

    return jsonResponse({ message: 'Friendship removed' })
  } catch {
    return errorResponse('Internal server error', 500)
  }
}
