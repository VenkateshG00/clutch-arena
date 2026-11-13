'use client'

import { cn } from '@/lib/utils'
import { RANK_TIERS } from '@/types/game'
import type { RankTier } from '@/types/database'

const tierStyles: Record<RankTier, string> = {
  bronze: 'bg-orange-900/30 text-orange-400 border-orange-800/50',
  silver: 'bg-gray-800/30 text-gray-300 border-gray-600/50',
  gold: 'bg-yellow-900/30 text-yellow-400 border-yellow-700/50',
  platinum: 'bg-cyan-900/30 text-cyan-300 border-cyan-700/50',
  diamond: 'bg-blue-900/30 text-blue-300 border-blue-700/50',
  elite: 'bg-red-900/30 text-red-400 border-red-700/50',
}

export function RankBadge({ tier, size = 'sm' }: { tier: RankTier; size?: 'sm' | 'md' | 'lg' }) {
  const info = RANK_TIERS[tier]
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border font-medium',
        tierStyles[tier],
        sizeClasses[size]
      )}
    >
      <span>{info.icon}</span>
      <span>{info.name}</span>
    </span>
  )
}
