import { NextResponse } from 'next/server'
import { StripeAdapter } from '@/lib/payments/stripe'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    const adapter = new StripeAdapter()

    if (!adapter.verifyWebhookSignature(body, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const event = await adapter.parseWebhookEvent(body)
    const supabase = await createServiceClient()

    switch (event.type) {
      case 'subscription.created': {
        if (!event.userId || !event.plan) break
        await supabase.from('subscriptions').upsert({
          user_id: event.userId,
          plan: event.plan,
          status: 'active',
          provider: 'stripe',
          provider_subscription_id: event.subscriptionId,
          current_period_start: event.periodStart,
          current_period_end: event.periodEnd,
        }, { onConflict: 'user_id' })
        break
      }
      case 'subscription.updated': {
        if (!event.subscriptionId) break
        const update: Record<string, unknown> = { status: event.status === 'active' ? 'active' : 'past_due' }
        if (event.periodStart) update.current_period_start = event.periodStart
        if (event.periodEnd) update.current_period_end = event.periodEnd
        if (event.plan) update.plan = event.plan
        await supabase.from('subscriptions')
          .update(update)
          .eq('provider_subscription_id', event.subscriptionId)
        break
      }
      case 'subscription.cancelled': {
        if (!event.subscriptionId) break
        await supabase.from('subscriptions')
          .update({ status: 'cancelled' })
          .eq('provider_subscription_id', event.subscriptionId)
        break
      }
      case 'payment.completed': {
        if (!event.userId) break
        await supabase.from('transactions').insert({
          user_id: event.userId,
          provider: 'stripe',
          provider_transaction_id: event.transactionId || '',
          amount: (event.amount || 0) / 100,
          currency: event.currency || 'USD',
          status: 'completed',
        })
        break
      }
      case 'payment.failed': {
        if (!event.subscriptionId) break
        await supabase.from('subscriptions')
          .update({ status: 'past_due' })
          .eq('provider_subscription_id', event.subscriptionId)
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Stripe webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
