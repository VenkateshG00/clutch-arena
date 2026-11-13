'use client'

import { motion } from 'framer-motion'
import { RANK_TIERS, getRankTier, getXPForNextRank } from '@/types/game'

interface RankCardProps {
  totalXP: number
  delay?: number
}

export function RankCard({ totalXP, delay = 0 }: RankCardProps) {
  const currentTier = getRankTier(totalXP)
  const tierData = RANK_TIERS[currentTier]
  const xpInfo = getXPForNextRank(totalXP)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="overflow-hidden rounded-xl border border-arena-border bg-arena-surface"
    >
      <div className="p-5">
        <div className="flex items-center gap-4">
          {/* Tier icon */}
          <div
            className="flex size-16 items-center justify-center rounded-2xl text-3xl"
            style={{ backgroundColor: `${tierData.color}15` }}
          >
            {tierData.icon}
          </div>

          <div className="flex-1">
            <p className="text-xs uppercase tracking-wider text-arena-text-muted">Current Rank</p>
            <p className="text-xl font-bold" style={{ color: tierData.color }}>
              {tierData.name}
            </p>
            <p className="text-sm text-arena-text-muted">
              {totalXP.toLocaleString()} XP
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-arena-text-muted">Progress to {xpInfo.nextRank}</span>
            <span className="font-medium text-arena-text">{Math.round(xpInfo.progress)}%</span>
          </div>
          <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-arena-surface-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${xpInfo.progress}%` }}
              transition={{ duration: 1, delay: delay + 0.3, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{
                background: `linear-gradient(90deg, ${tierData.color}, ${tierData.color}88)`,
              }}
            />
          </div>
          <p className="mt-1 text-[11px] text-arena-text-muted">
            {xpInfo.xpNeeded.toLocaleString()} XP remaining
          </p>
        </div>
      </div>
    </motion.div>
  )
}
