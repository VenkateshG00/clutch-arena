'use client'

import { motion } from 'framer-motion'
import {
  Gamepad2,
  Target,
  Flame,
  Award,
  Trophy,
  Clock,
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { StatCard } from '@/components/dashboard/stat-card'
import { GameCard } from '@/components/dashboard/game-card'
import { RankCard } from '@/components/dashboard/rank-card'
import { DailyChallengeCard } from '@/components/dashboard/daily-challenge-card'

const featuredGames = [
  {
    name: 'Reaction Blitz',
    category: 'reaction' as const,
    difficulty: 'medium' as const,
    duration: 30,
    bestScore: 4250,
    slug: 'reaction-blitz',
  },
  {
    name: 'Memory Matrix',
    category: 'memory' as const,
    difficulty: 'hard' as const,
    duration: 60,
    bestScore: 1800,
    slug: 'memory-matrix',
  },
  {
    name: 'Speed Typer',
    category: 'typing' as const,
    difficulty: 'easy' as const,
    duration: 60,
    bestScore: 3100,
    slug: 'speed-typer',
  },
]

function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Welcome skeleton */}
      <div className="h-8 w-64 rounded-lg bg-arena-surface" />
      <div className="h-4 w-48 rounded bg-arena-surface" />

      {/* Stats skeleton */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-arena-surface" />
        ))}
      </div>

      {/* Cards skeleton */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-48 rounded-xl bg-arena-surface" />
        <div className="h-48 rounded-xl bg-arena-surface" />
      </div>

      {/* Games skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-64 rounded-xl bg-arena-surface" />
        ))}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { profile, isLoading } = useAuthStore()

  if (isLoading) {
    return <DashboardSkeleton />
  }

  const displayName = profile?.display_name ?? profile?.username ?? 'Player'
  const gamesPlayed = profile?.games_played ?? 0
  const wins = profile?.wins ?? 0
  const winRate = gamesPlayed > 0 ? Math.round((wins / gamesPlayed) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold text-arena-text sm:text-3xl">
          Welcome back, <span className="text-gradient-primary">{displayName}</span>
        </h1>
        <p className="mt-1 text-sm text-arena-text-muted">
          Ready to prove your skills? Here is your arena overview.
        </p>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <StatCard
          icon={Gamepad2}
          label="Games Played"
          value={gamesPlayed}
          iconColor="#8B5CF6"
          delay={0.1}
        />
        <StatCard
          icon={Target}
          label="Win Rate"
          value={`${winRate}%`}
          iconColor="#3B82F6"
          trend={winRate > 50 ? { value: 5, isPositive: true } : undefined}
          delay={0.15}
        />
        <StatCard
          icon={Flame}
          label="Current Streak"
          value={0}
          iconColor="#F59E0B"
          delay={0.2}
        />
        <StatCard
          icon={Award}
          label="Best Rank"
          value={profile?.rank_tier ? profile.rank_tier.charAt(0).toUpperCase() + profile.rank_tier.slice(1) : 'Bronze'}
          iconColor="#22C55E"
          delay={0.25}
        />
      </div>

      {/* Rank + Daily Challenge */}
      <div className="grid gap-4 lg:grid-cols-2">
        <RankCard totalXP={profile?.total_xp ?? 0} delay={0.3} />
        <DailyChallengeCard delay={0.35} />
      </div>

      {/* Featured Games */}
      <div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-between"
        >
          <h2 className="text-lg font-semibold text-arena-text">Featured Games</h2>
          <a
            href="/games"
            className="text-sm text-arena-primary hover:text-arena-primary-light transition-colors"
          >
            View All
          </a>
        </motion.div>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featuredGames.map((game, i) => (
            <GameCard key={game.slug} {...game} delay={0.45 + i * 0.05} />
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-lg font-semibold text-arena-text"
        >
          Recent Activity
        </motion.h2>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="mt-3 flex flex-col items-center justify-center rounded-xl border border-dashed border-arena-border bg-arena-surface/50 py-12"
        >
          <div className="flex size-12 items-center justify-center rounded-full bg-arena-surface-2">
            <Clock className="size-6 text-arena-text-muted" />
          </div>
          <p className="mt-3 text-sm font-medium text-arena-text-muted">No recent activity</p>
          <p className="mt-1 text-xs text-arena-text-muted/70">
            Play some games to see your activity here
          </p>
        </motion.div>
      </div>
    </div>
  )
}
