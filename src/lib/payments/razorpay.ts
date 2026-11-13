import type { PaymentProviderAdapter, WebhookEvent } from './index'
import type { SubscriptionPlan } from '@/types/database'
import { getPlanPricing } from './index'
import crypto from 'crypto'

export class RazorpayAdapter implements PaymentProviderAdapter {
  private keyId: string
  private keySecret: string
  private webhookSecret: string

  constructor() {
    this.keyId = process.env.RAZORPAY_KEY_ID!
    this.keySecret = process.env.RAZORPAY_KEY_SECRET!
    this.webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET!
  }

  async createSubscription(params: {
    userId: string
    email: string
    plan: SubscriptionPlan
    interval: 'monthly' | 'annual'
  }) {
    const { amount, currency } = getPlanPricing(params.plan, params.interval)
    const auth = Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64')

    const res = await fetch('https://api.razorpay.com/v1/subscriptions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        plan_id: `plan_${params.plan}_${params.interval}`,
        total_count: params.interval === 'annual' ? 1 : 12,
        notes: {
          user_id: params.userId,
          plan: params.plan,
        },
      }),
    })

    const data = await res.json()
    return {
      sessionUrl: data.short_url || '',
      subscriptionId: data.id || '',
    }
  }

  async cancelSubscription(subscriptionId: string) {
    const auth = Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64')
    await fetch(`https://api.razorpay.com/v1/subscriptions/${subscriptionId}/cancel`, {
      method: 'POST',
      headers: { Authorization: `Basic ${auth}` },
    })
  }

  verifyWebhookSignature(body: string, signature: string): boolean {
    const expectedSignature = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(body)
      .digest('hex')
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    )
  }

  async parseWebhookEvent(body: string): Promise<WebhookEvent> {
    const event = JSON.parse(body)
    const payload = event.payload

    return {
      type: this.mapEventType(event.event),
      provider: 'razorpay',
      subscriptionId: payload?.subscription?.entity?.id,
      transactionId: payload?.payment?.entity?.id,
      userId: payload?.subscription?.entity?.notes?.user_id,
      plan: payload?.subscription?.entity?.notes?.plan as SubscriptionPlan,
      amount: payload?.payment?.entity?.amount,
      currency: payload?.payment?.entity?.currency,
      status: payload?.subscription?.entity?.status,
    }
  }

  private mapEventType(event: string): WebhookEvent['type'] {
    const map: Record<string, WebhookEvent['type']> = {
      'subscription.activated': 'subscription.created',
      'subscription.updated': 'subscription.updated',
      'subscription.cancelled': 'subscription.cancelled',
      'payment.captured': 'payment.completed',
      'payment.failed': 'payment.failed',
    }
    return map[event] || 'subscription.updated'
  }
}
