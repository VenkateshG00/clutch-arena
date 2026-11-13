import type { SubscriptionPlan, PaymentProvider } from '@/types/database'

export interface PaymentProviderAdapter {
  createSubscription(params: {
    userId: string
    email: string
    plan: SubscriptionPlan
    interval: 'monthly' | 'annual'
  }): Promise<{ sessionUrl: string; subscriptionId: string }>

  cancelSubscription(subscriptionId: string): Promise<void>

  verifyWebhookSignature(body: string, signature: string): boolean

  parseWebhookEvent(body: string): Promise<WebhookEvent>
}

export interface WebhookEvent {
  type: 'subscription.created' | 'subscription.updated' | 'subscription.cancelled' | 'payment.completed' | 'payment.failed'
  provider: PaymentProvider
  subscriptionId?: string
  transactionId?: string
  userId?: string
  plan?: SubscriptionPlan
  amount?: number
  currency?: string
  status?: string
  periodStart?: string
  periodEnd?: string
}

export function getPaymentProvider(): PaymentProvider {
  return (process.env.PAYMENT_PROVIDER as PaymentProvider) || 'razorpay'
}

export function getPlanPricing(plan: SubscriptionPlan, interval: 'monthly' | 'annual'): { amount: number; currency: string } {
  const pricing: Record<string, Record<string, { amount: number; currency: string }>> = {
    plus: {
      monthly: { amount: 14900, currency: 'INR' },
      annual: { amount: 119900, currency: 'INR' },
    },
    pro: {
      monthly: { amount: 29900, currency: 'INR' },
      annual: { amount: 239900, currency: 'INR' },
    },
  }
  return pricing[plan]?.[interval] || { amount: 0, currency: 'INR' }
}
