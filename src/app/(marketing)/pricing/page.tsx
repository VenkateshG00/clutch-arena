"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Check,
  X,
  Sparkles,
  Crown,
  Zap,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const plans = [
  {
    name: "Free",
    price: { monthly: 0, annual: 0 },
    description: "Jump in and start competing. No strings attached.",
    icon: Zap,
    color: "arena-text-muted",
    borderColor: "border-arena-border",
    features: [
      { text: "All core games", included: true },
      { text: "Daily challenges", included: true },
      { text: "Basic leaderboards", included: true },
      { text: "Basic profile", included: true },
      { text: "Friend challenges (3/day)", included: true },
      { text: "Advanced statistics", included: false },
      { text: "Unlimited practice mode", included: false },
      { text: "Profile themes & cosmetics", included: false },
      { text: "Private leagues", included: false },
      { text: "Competition management", included: false },
    ],
    cta: "Start Free",
    ctaVariant: "outline" as const,
    popular: false,
  },
  {
    name: "Clutch Plus",
    price: { monthly: 149, annual: 1199 },
    description: "For serious competitors who want the edge.",
    icon: Sparkles,
    color: "arena-primary",
    borderColor: "border-arena-primary/50",
    features: [
      { text: "All core games", included: true },
      { text: "Daily challenges", included: true },
      { text: "Full leaderboards", included: true },
      { text: "Customizable profile", included: true },
      { text: "Unlimited friend challenges", included: true },
      { text: "Advanced statistics", included: true },
      { text: "Unlimited practice mode", included: true },
      { text: "Profile themes & cosmetics", included: true },
      { text: "Private leagues", included: false },
      { text: "Competition management", included: false },
    ],
    cta: "Get Clutch Plus",
    ctaVariant: "default" as const,
    popular: true,
  },
  {
    name: "Clutch Pro",
    price: { monthly: 299, annual: 2399 },
    description: "The ultimate toolkit for competitive organizers.",
    icon: Crown,
    color: "amber-400",
    borderColor: "border-amber-400/50",
    features: [
      { text: "All core games", included: true },
      { text: "Daily challenges", included: true },
      { text: "Full leaderboards", included: true },
      { text: "Premium profile", included: true },
      { text: "Unlimited friend challenges", included: true },
      { text: "Advanced statistics", included: true },
      { text: "Unlimited practice mode", included: true },
      { text: "All themes & cosmetics", included: true },
      { text: "Private leagues & custom leaderboards", included: true },
      { text: "Competition management & analytics", included: true },
    ],
    cta: "Get Clutch Pro",
    ctaVariant: "outline" as const,
    popular: false,
  },
];

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);

  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <Badge
            variant="outline"
            className="mb-4 border-arena-primary/30 bg-arena-primary/10 text-arena-primary-light"
          >
            Pricing
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-arena-text">
            Level Up Your <span className="text-gradient-primary">Game</span>
          </h1>
          <p className="mt-4 text-lg text-arena-text-muted max-w-xl mx-auto">
            Start free, upgrade when you're ready. Cancel anytime.
          </p>
        </motion.div>

        {/* Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex items-center justify-center gap-4 mb-12"
        >
          <span
            className={`text-sm font-medium ${!annual ? "text-arena-text" : "text-arena-text-muted"}`}
          >
            Monthly
          </span>
          <button
            onClick={() => setAnnual(!annual)}
            className={`relative h-7 w-12 rounded-full transition-colors ${
              annual ? "bg-arena-primary" : "bg-arena-surface-2"
            }`}
          >
            <div
              className={`absolute top-0.5 h-6 w-6 rounded-full bg-white transition-transform ${
                annual ? "translate-x-[22px]" : "translate-x-0.5"
              }`}
            />
          </button>
          <span
            className={`text-sm font-medium ${annual ? "text-arena-text" : "text-arena-text-muted"}`}
          >
            Annual
          </span>
          {annual && (
            <Badge className="bg-arena-success/10 text-arena-success border-arena-success/30 text-xs">
              Save up to 33%
            </Badge>
          )}
        </motion.div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 + i * 0.1 }}
              className={`relative flex flex-col rounded-2xl border ${plan.borderColor} bg-arena-surface p-6 sm:p-8 ${
                plan.popular ? "ring-2 ring-arena-primary shadow-lg shadow-arena-primary/10" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-gradient-primary text-white px-4 py-1 text-xs font-semibold">
                    Most Popular
                  </Badge>
                </div>
              )}

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <plan.icon className={`h-5 w-5 text-${plan.color}`} />
                  <h3 className="text-xl font-bold text-arena-text">{plan.name}</h3>
                </div>
                <p className="text-sm text-arena-text-muted">{plan.description}</p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-arena-text">
                    {plan.price.monthly === 0
                      ? "Free"
                      : `₹${annual ? plan.price.annual : plan.price.monthly}`}
                  </span>
                  {plan.price.monthly > 0 && (
                    <span className="text-sm text-arena-text-muted">
                      /{annual ? "year" : "month"}
                    </span>
                  )}
                </div>
                {annual && plan.price.monthly > 0 && (
                  <p className="mt-1 text-xs text-arena-text-muted">
                    ₹{Math.round(plan.price.annual / 12)}/mo billed annually
                  </p>
                )}
              </div>

              <ul className="mb-8 flex-1 space-y-3">
                {plan.features.map((feat) => (
                  <li key={feat.text} className="flex items-start gap-2.5">
                    {feat.included ? (
                      <Check className="h-4 w-4 mt-0.5 text-arena-success shrink-0" />
                    ) : (
                      <X className="h-4 w-4 mt-0.5 text-arena-text-muted/40 shrink-0" />
                    )}
                    <span
                      className={`text-sm ${
                        feat.included ? "text-arena-text" : "text-arena-text-muted/50"
                      }`}
                    >
                      {feat.text}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                className={
                  plan.popular
                    ? "w-full h-11 bg-gradient-primary hover:opacity-90 text-white font-semibold"
                    : "w-full h-11 border-arena-border text-arena-text hover:bg-white/5 font-semibold"
                }
                variant={plan.ctaVariant}
                render={<Link href="/signup" />}
              >
                {plan.cta}
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
