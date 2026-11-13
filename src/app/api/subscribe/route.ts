import { createClient } from '@/lib/supabase/server'
import { jsonResponse, errorResponse, requireAuth } from '@/lib/api-utils'
import { getPaymentProvider } from '@/lib/payments'
import { RazorpayAdapter } from '@/lib/payments/razorpay'
import { StripeAdapter } from '@/lib/payments/stripe'
import type { SubscriptionPlan } from '@/types/database'

const VALID_PLANS: SubscriptionPlan[] = ['plus', 'pro']
const VALID_INTERVALS = ['monthly', 'annual'] as const

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { user, response } = await requireAuth(supabase)
    if (response) return response

    const body = await request.json()
    const { plan, interval } = body

    if (!VALID_PLANS.includes(plan)) {
      return errorResponse('Invalid plan. Choose plus or pro.')
    }

    if (!VALID_INTERVALS.includes(interval)) {
      return errorResponse('Invalid interval. Choose monthly or annual.')
    }

    const provider = getPaymentProvider()
    const adapter = provider === 'stripe' ? new StripeAdapter() : new RazorpayAdapter()

    const result = await adapter.createSubscription({
      userId: user.id,
      email: user.email!,
      plan,
      interval,
    })

    return jsonResponse({
      sessionUrl: result.sessionUrl,
      subscriptionId: result.subscriptionId,
    })
  } catch (error) {
    console.error('Subscribe error:', error)
    return errorResponse('Failed to create subscription', 500)
  }
}
