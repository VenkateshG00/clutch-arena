'use client'

import type { LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  trend?: { value: number; isPositive: boolean }
  iconColor?: string
  delay?: number
}

export function StatCard({ icon: Icon, label, value, trend, iconColor = '#8B5CF6', delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="rounded-xl border border-arena-border bg-arena-surface p-4 transition-all hover:border-arena-primary/20"
    >
      <div className="flex items-center gap-3">
        <div
          className="flex size-10 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${iconColor}15` }}
        >
          <Icon className="size-5" style={{ color: iconColor }} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-arena-text-muted">{label}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-xl font-bold text-arena-text">{value}</p>
            {trend && (
              <span
                className={`flex items-center gap-0.5 text-xs font-medium ${
                  trend.isPositive ? 'text-arena-success' : 'text-arena-danger'
                }`}
              >
                {trend.isPositive ? (
                  <TrendingUp className="size-3" />
                ) : (
                  <TrendingDown className="size-3" />
                )}
                {trend.value}%
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
