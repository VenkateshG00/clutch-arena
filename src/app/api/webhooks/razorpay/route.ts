import { NextResponse } from 'next/server'
import { RazorpayAdapter } from '@/lib/payments/razorpay'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-razorpay-signature')

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    const adapter = new RazorpayAdapter()

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
          provider: 'razorpay',
          provider_subscription_id: event.subscriptionId,
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        }, { onConflict: 'user_id' })
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
          provider: 'razorpay',
          provider_transaction_id: event.transactionId || '',
          amount: (event.amount || 0) / 100,
          currency: event.currency || 'INR',
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
    console.error('Razorpay webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
