'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Gamepad2,
  Target,
  Flame,
  Award,
  Trophy,
  Clock,
  Star,
  Zap,
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { createClient } from '@/lib/supabase/client'
import { GAMES } from '@/lib/constants'
import { StatCard } from '@/components/dashboard/stat-card'
import { GameCard } from '@/components/dashboard/game-card'
import { RankCard } from '@/components/dashboard/rank-card'
import { DailyChallengeCard } from '@/components/dashboard/daily-challenge-card'

interface RecentScore {
  id: string
  score: number
  game_id: string
  is_personal_best: boolean
  created_at: string
}

const featuredGames = GAMES.slice(0, 3).map((g) => ({
  name: g.name,
  category: g.category,
  difficulty: g.difficulty,
  duration: g.duration,
  slug: g.slug,
}))

function getTimeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (seconds < 60) return 'Just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

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
  const [recentScores, setRecentScores] = useState<RecentScore[]>([])
  const [activityLoading, setActivityLoading] = useState(true)

  useEffect(() => {
    async function fetchRecentActivity() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data } = await supabase
          .from('scores')
          .select('id, score, game_id, is_personal_best, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5)

        if (data) setRecentScores(data)
      } catch {
        // silently fail
      } finally {
        setActivityLoading(false)
      }
    }
    fetchRecentActivity()
  }, [])

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

        {activityLoading ? (
          <div className="mt-3 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-arena-surface" />
            ))}
          </div>
        ) : recentScores.length === 0 ? (
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
        ) : (
          <div className="mt-3 space-y-2">
            {recentScores.map((entry, i) => {
              const game = GAMES.find((g) => g.id === entry.game_id)
              const timeAgo = getTimeAgo(entry.created_at)
              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.65 + i * 0.05 }}
                  className="flex items-center gap-3 rounded-xl border border-arena-border bg-arena-surface px-4 py-3"
                >
                  <div className="text-2xl">{game?.icon ?? '🎮'}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-arena-text truncate">
                      {game?.name ?? 'Unknown Game'}
                    </p>
                    <p className="text-xs text-arena-text-muted">{timeAgo}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {entry.is_personal_best && (
                      <span className="flex items-center gap-0.5 rounded-full bg-arena-warning/15 px-2 py-0.5 text-[10px] font-semibold text-arena-warning">
                        <Zap className="size-3" /> PB
                      </span>
                    )}
                    <div className="flex items-center gap-1 text-sm font-semibold text-arena-text">
                      <Star className="size-3.5 text-arena-warning" />
                      {entry.score.toLocaleString()}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
