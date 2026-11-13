'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Crown, Check, X, Sparkles, Zap, Star, Loader2, CreditCard } from 'lucide-react'
import { cn } from 'cn'

import { useAuthStore } from '@/stores/auth-store'
import { SUBSCRIPTION_PLANS } from '@/types/game'
import type { SubscriptionPlan } from '@/types/database'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

const planIcons: Record<string, React.ElementType> = {
  free: Star,
  plus: Zap,
  pro: Crown,
}

const planColors: Record<string, string> = {
  free: '#94A3B8',
  plus: '#8B5CF6',
  pro: '#FFD700',
}

const allFeatures = [
  { name: 'Core games', free: true, plus: true, pro: true },
  { name: 'Daily challenges', free: true, plus: true, pro: true },
  { name: 'Basic leaderboards', free: true, plus: true, pro: true },
  { name: 'Basic player profile', free: true, plus: true, pro: true },
  { name: 'Friend challenges', free: true, plus: true, pro: true },
  { name: 'Advanced statistics', free: false, plus: true, pro: true },
  { name: 'Unlimited practice', free: false, plus: true, pro: true },
  { name: 'Additional game modes', free: false, plus: true, pro: true },
  { name: 'Profile themes', free: false, plus: true, pro: true },
  { name: 'Custom challenges', free: false, plus: true, pro: true },
  { name: 'Cosmetic rewards', free: false, plus: true, pro: true },
  { name: 'Private leagues', free: false, plus: false, pro: true },
  { name: 'Custom leaderboards', free: false, plus: false, pro: true },
  { name: 'Advanced historical analytics', free: false, plus: false, pro: true },
  { name: 'Competition management', free: false, plus: false, pro: true },
  { name: 'Priority support', free: false, plus: false, pro: true },
]

export default function PremiumPage() {
  const { subscription, isPremium, isPro } = useAuthStore()
  const [isAnnual, setIsAnnual] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const currentPlan: SubscriptionPlan = subscription?.plan || 'free'

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(t)
    }
  }, [toast])

  const handleUpgrade = (plan: string) => {
    setToast('Coming soon! Payment integration is not available yet.')
  }

  const formatPrice = (amount: number) => {
    if (amount === 0) return 'Free'
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
  }

  return (
    <div className="min-h-screen bg-[#090B14]">
      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Toast */}
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 rounded-lg bg-[#8B5CF6] px-4 py-3 text-sm font-medium text-white shadow-lg"
          >
            {toast}
          </motion.div>
        )}

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center justify-center size-16 rounded-full bg-[#8B5CF6]/10 mb-4">
            <Crown className="size-8 text-[#8B5CF6]" />
          </div>
          <h1 className="text-3xl font-bold text-[#F8FAFC]">Upgrade Your Game</h1>
          <p className="text-[#94A3B8] mt-2 max-w-lg mx-auto">
            Unlock premium features, advanced stats, and exclusive game modes to take your skills to the next level.
          </p>
        </motion.div>

        {/* Current Plan Banner */}
        {isPremium() && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
            <Card className="bg-[#111525] border-[#8B5CF6]/30 mb-8">
              <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${planColors[currentPlan]}20` }}>
                    <Sparkles className="size-5" style={{ color: planColors[currentPlan] }} />
                  </div>
                  <div>
                    <p className="font-medium text-[#F8FAFC]">
                      Current Plan: <span style={{ color: planColors[currentPlan] }}>{SUBSCRIPTION_PLANS[currentPlan].name}</span>
                    </p>
                    {subscription?.current_period_end && (
                      <p className="text-xs text-[#94A3B8]">
                        Billing period ends {new Date(subscription.current_period_end).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <Button variant="outline" className="border-[#181D30] text-[#F8FAFC] hover:bg-[#181D30]">
                  <CreditCard className="size-3.5 mr-1.5" />
                  Manage Subscription
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Billing Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex items-center justify-center gap-3 mb-8"
        >
          <span className={cn('text-sm font-medium', !isAnnual ? 'text-[#F8FAFC]' : 'text-[#94A3B8]')}>Monthly</span>
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className={cn(
              'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
              isAnnual ? 'bg-[#8B5CF6]' : 'bg-[#181D30]'
            )}
          >
            <span
              className={cn(
                'inline-block size-4 rounded-full bg-white transition-transform',
                isAnnual ? 'translate-x-6' : 'translate-x-1'
              )}
            />
          </button>
          <span className={cn('text-sm font-medium', isAnnual ? 'text-[#F8FAFC]' : 'text-[#94A3B8]')}>
            Annual
            <Badge className="ml-1.5 bg-[#22C55E]/10 text-[#22C55E] text-xs">Save 33%</Badge>
          </span>
        </motion.div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {(Object.entries(SUBSCRIPTION_PLANS) as [SubscriptionPlan, typeof SUBSCRIPTION_PLANS[SubscriptionPlan]][]).map(
            ([key, plan], index) => {
              const Icon = planIcons[key]
              const color = planColors[key]
              const isCurrentPlan = currentPlan === key
              const price = isAnnual ? plan.price.annual : plan.price.monthly

              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                >
                  <Card
                    className={cn(
                      'bg-[#111525] relative overflow-hidden h-full flex flex-col',
                      isCurrentPlan ? 'border-[#8B5CF6] ring-1 ring-[#8B5CF6]/20' : 'border-[#181D30]'
                    )}
                  >
                    {isCurrentPlan && (
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6]" />
                    )}
                    {key === 'plus' && !isCurrentPlan && (
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-[#8B5CF6] text-white text-xs">Popular</Badge>
                      </div>
                    )}
                    <CardHeader className="text-center pb-2">
                      <div
                        className="mx-auto size-12 rounded-full flex items-center justify-center mb-2"
                        style={{ backgroundColor: `${color}15` }}
                      >
                        <Icon className="size-6" style={{ color }} />
                      </div>
                      <CardTitle className="text-[#F8FAFC] text-lg">{plan.name}</CardTitle>
                      <div className="mt-2">
                        <span className="text-3xl font-bold text-[#F8FAFC]">{formatPrice(price)}</span>
                        {price > 0 && (
                          <span className="text-[#94A3B8] text-sm">/{isAnnual ? 'year' : 'month'}</span>
                        )}
                      </div>
                      {isAnnual && plan.price.monthly > 0 && (
                        <p className="text-xs text-[#94A3B8] mt-1">
                          {formatPrice(Math.round(plan.price.annual / 12))}/month billed annually
                        </p>
                      )}
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col">
                      <Separator className="bg-[#181D30] mb-4" />
                      <ul className="space-y-3 flex-1">
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-2 text-sm">
                            <Check className="size-4 mt-0.5 shrink-0" style={{ color }} />
                            <span className="text-[#F8FAFC]">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-6">
                        {isCurrentPlan ? (
                          <Button disabled className="w-full bg-[#181D30] text-[#94A3B8] cursor-default">
                            Current Plan
                          </Button>
                        ) : key === 'free' && currentPlan !== 'free' ? (
                          <Button
                            variant="outline"
                            className="w-full border-[#181D30] text-[#F8FAFC] hover:bg-[#181D30]"
                            onClick={() => handleUpgrade(key)}
                          >
                            Downgrade
                          </Button>
                        ) : (
                          <Button
                            className="w-full text-white font-medium"
                            style={{ backgroundColor: color }}
                            onClick={() => handleUpgrade(key)}
                          >
                            <Sparkles className="size-4 mr-1.5" />
                            {currentPlan !== 'free' && key !== 'free'
                              ? key === 'pro'
                                ? 'Upgrade to Pro'
                                : 'Change to Plus'
                              : `Get ${plan.name}`}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            }
          )}
        </div>

        {/* Feature Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-xl font-bold text-[#F8FAFC] mb-6 text-center">Feature Comparison</h2>
          <Card className="bg-[#111525] border-[#181D30] overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#181D30]">
                      <th className="text-left p-4 text-[#94A3B8] font-medium">Feature</th>
                      <th className="text-center p-4 text-[#94A3B8] font-medium w-24">Free</th>
                      <th className="text-center p-4 font-medium w-24" style={{ color: planColors.plus }}>Plus</th>
                      <th className="text-center p-4 font-medium w-24" style={{ color: planColors.pro }}>Pro</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allFeatures.map((feature, i) => (
                      <tr key={feature.name} className={cn('border-b border-[#181D30]/50', i % 2 === 0 && 'bg-[#0D0F1A]/30')}>
                        <td className="p-4 text-[#F8FAFC]">{feature.name}</td>
                        <td className="p-4 text-center">
                          {feature.free ? (
                            <Check className="size-4 mx-auto text-[#22C55E]" />
                          ) : (
                            <X className="size-4 mx-auto text-[#94A3B8]/30" />
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {feature.plus ? (
                            <Check className="size-4 mx-auto text-[#8B5CF6]" />
                          ) : (
                            <X className="size-4 mx-auto text-[#94A3B8]/30" />
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {feature.pro ? (
                            <Check className="size-4 mx-auto text-[#FFD700]" />
                          ) : (
                            <X className="size-4 mx-auto text-[#94A3B8]/30" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
