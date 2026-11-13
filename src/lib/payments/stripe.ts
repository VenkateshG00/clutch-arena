import type { PaymentProviderAdapter, WebhookEvent } from './index'
import type { SubscriptionPlan } from '@/types/database'
import { getPlanPricing } from './index'
import crypto from 'crypto'

export class StripeAdapter implements PaymentProviderAdapter {
  private secretKey: string
  private webhookSecret: string

  constructor() {
    this.secretKey = process.env.STRIPE_SECRET_KEY!
    this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!
  }

  async createSubscription(params: {
    userId: string
    email: string
    plan: SubscriptionPlan
    interval: 'monthly' | 'annual'
  }) {
    const { amount, currency } = getPlanPricing(params.plan, params.interval)

    const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        mode: 'subscription',
        'line_items[0][price]': `price_${params.plan}_${params.interval}`,
        'line_items[0][quantity]': '1',
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/premium?success=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/premium?cancelled=true`,
        customer_email: params.email,
        'metadata[user_id]': params.userId,
        'metadata[plan]': params.plan,
      }),
    })

    const data = await res.json()
    return {
      sessionUrl: data.url || '',
      subscriptionId: data.subscription || '',
    }
  }

  async cancelSubscription(subscriptionId: string) {
    await fetch(`https://api.stripe.com/v1/subscriptions/${subscriptionId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${this.secretKey}` },
    })
  }

  verifyWebhookSignature(body: string, signature: string): boolean {
    const parts = signature.split(',').reduce((acc, part) => {
      const [key, value] = part.split('=')
      acc[key] = value
      return acc
    }, {} as Record<string, string>)

    const timestamp = parts['t']
    const sig = parts['v1']
    if (!timestamp || !sig) return false

    const expectedSignature = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(`${timestamp}.${body}`)
      .digest('hex')

    return crypto.timingSafeEqual(
      Buffer.from(sig),
      Buffer.from(expectedSignature)
    )
  }

  async parseWebhookEvent(body: string): Promise<WebhookEvent> {
    const event = JSON.parse(body)
    const obj = event.data?.object

    return {
      type: this.mapEventType(event.type),
      provider: 'stripe',
      subscriptionId: obj?.id || obj?.subscription,
      transactionId: obj?.latest_invoice,
      userId: obj?.metadata?.user_id,
      plan: obj?.metadata?.plan as SubscriptionPlan,
      amount: obj?.amount_total,
      currency: obj?.currency?.toUpperCase(),
      status: obj?.status,
      periodStart: obj?.current_period_start ? new Date(obj.current_period_start * 1000).toISOString() : undefined,
      periodEnd: obj?.current_period_end ? new Date(obj.current_period_end * 1000).toISOString() : undefined,
    }
  }

  private mapEventType(event: string): WebhookEvent['type'] {
    const map: Record<string, WebhookEvent['type']> = {
      'customer.subscription.created': 'subscription.created',
      'customer.subscription.updated': 'subscription.updated',
      'customer.subscription.deleted': 'subscription.cancelled',
      'invoice.payment_succeeded': 'payment.completed',
      'invoice.payment_failed': 'payment.failed',
    }
    return map[event] || 'subscription.updated'
  }
}
