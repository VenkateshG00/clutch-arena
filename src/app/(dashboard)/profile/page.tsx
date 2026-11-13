'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Trophy,
  Gamepad2,
  Target,
  Flame,
  Star,
  Award,
  Clock,
  Settings,
  Lock,
  Camera,
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { createClient } from '@/lib/supabase/client'
import { GAMES } from '@/lib/constants'
import { RANK_TIERS, getXPForNextRank } from '@/types/game'
import type { Achievement, UserAchievement } from '@/types/database'

interface RecentScore {
  id: string
  score: number
  game_id: string
  is_personal_best: boolean
  created_at: string
}
import { cn } from 'cn'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Progress, ProgressLabel, ProgressValue } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'

interface AchievementWithStatus extends Achievement {
  unlocked: boolean
  unlocked_at?: string
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07 },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

function formatTimeAgo(dateStr: string): string {
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

function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-[#090B14] p-4 md:p-8 animate-pulse">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header skeleton */}
        <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
          <div className="size-24 rounded-full bg-[#181D30]" />
          <div className="flex-1 space-y-3 text-center md:text-left">
            <div className="h-7 w-48 rounded bg-[#181D30]" />
            <div className="h-5 w-32 rounded bg-[#181D30]" />
            <div className="h-5 w-24 rounded bg-[#181D30]" />
          </div>
        </div>
        {/* Stats skeleton */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-[#111525]" />
          ))}
        </div>
        {/* Achievements skeleton */}
        <div className="space-y-4">
          <div className="h-6 w-40 rounded bg-[#181D30]" />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-28 rounded-xl bg-[#111525]" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const { profile, isLoading: authLoading } = useAuthStore()
  const [achievements, setAchievements] = useState<AchievementWithStatus[]>([])
  const [gameStats, setGameStats] = useState<Record<string, number>>({})
  const [recentScores, setRecentScores] = useState<RecentScore[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const supabase = createClient()
      const [achievementsRes, statsRes, scoresRes] = await Promise.allSettled([
        fetch('/api/achievements'),
        fetch('/api/profile/stats'),
        supabase.auth.getUser().then(async ({ data: { user } }) => {
          if (!user) return null
          const { data } = await supabase
            .from('scores')
            .select('id, score, game_id, is_personal_best, created_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(8)
          return data
        }),
      ])

      if (achievementsRes.status === 'fulfilled' && achievementsRes.value.ok) {
        const data = await achievementsRes.value.json()
        setAchievements(data.achievements ?? [])
      }

      if (statsRes.status === 'fulfilled' && statsRes.value.ok) {
        const data = await statsRes.value.json()
        setGameStats(data.stats ?? {})
      }

      if (scoresRes.status === 'fulfilled' && scoresRes.value) {
        setRecentScores(scoresRes.value as RecentScore[])
      }
    } catch {
      setError('Failed to load profile data. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (authLoading || loading) return <ProfileSkeleton />

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#090B14]">
        <div className="text-center">
          <p className="text-[#94A3B8]">No profile found. Please sign in.</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#090B14]">
        <div className="text-center space-y-4">
          <p className="text-red-400">{error}</p>
          <Button onClick={fetchData} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  const tierInfo = RANK_TIERS[profile.rank_tier]
  const xpInfo = getXPForNextRank(profile.total_xp)
  const winRate = profile.games_played > 0
    ? ((profile.wins / profile.games_played) * 100).toFixed(1)
    : '0.0'

  const stats = [
    { label: 'Games Played', value: profile.games_played, icon: Gamepad2, color: '#3B82F6' },
    { label: 'Wins', value: profile.wins, icon: Trophy, color: '#22C55E' },
    { label: 'Win Rate', value: `${winRate}%`, icon: Target, color: '#8B5CF6' },
    { label: 'Total XP', value: profile.total_xp.toLocaleString(), icon: Star, color: '#FFD700' },
    { label: 'Best Rank', value: tierInfo.name, icon: Award, color: tierInfo.color },
    { label: 'Current Streak', value: gameStats.current_streak ?? 0, icon: Flame, color: '#F97316' },
  ]

  const initials = (profile.display_name || profile.username || '?')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="min-h-screen bg-[#090B14] p-4 md:p-8">
      <motion.div
        className="mx-auto max-w-4xl space-y-8"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* Profile Header */}
        <motion.div variants={item} className="flex flex-col items-center gap-6 md:flex-row md:items-start">
          <div className="relative group">
            <Avatar className="size-24 text-2xl">
              {profile.avatar_url ? (
                <AvatarImage src={profile.avatar_url} alt={profile.username} />
              ) : null}
              <AvatarFallback className="bg-[#181D30] text-[#F8FAFC]">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100 cursor-pointer">
              <Camera className="size-6 text-white" />
            </div>
          </div>

          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex flex-col items-center gap-2 md:flex-row md:items-center">
              <h1 className="text-2xl font-bold text-[#F8FAFC]">{profile.display_name || profile.username}</h1>
              <Badge
                className="text-xs font-semibold"
                style={{ backgroundColor: `${tierInfo.color}20`, color: tierInfo.color }}
              >
                {tierInfo.icon} {tierInfo.name}
              </Badge>
            </div>
            {profile.display_name && (
              <p className="text-[#94A3B8]">@{profile.username}</p>
            )}
            <p className="text-xs text-[#94A3B8]">
              Rank #{profile.overall_rank.toLocaleString()}
            </p>

            {/* XP Progress */}
            <div className="mt-4 max-w-sm mx-auto md:mx-0">
              <Progress value={xpInfo.progress} className="w-full">
                <ProgressLabel className="text-xs text-[#94A3B8]">
                  Next: {xpInfo.nextRank}
                </ProgressLabel>
                <ProgressValue className="text-xs text-[#94A3B8]">
                  {() => xpInfo.xpNeeded > 0 ? `${xpInfo.xpNeeded.toLocaleString()} XP to go` : 'Max Rank!'}
                </ProgressValue>
              </Progress>
            </div>
          </div>

          <Link href="/settings">
            <Button variant="outline" size="sm" className="gap-1.5 border-[#181D30] text-[#94A3B8] hover:text-[#F8FAFC]">
              <Settings className="size-4" />
              Edit Profile
            </Button>
          </Link>
        </motion.div>

        <Separator className="bg-[#181D30]" />

        {/* Stats Grid */}
        <motion.div variants={item}>
          <h2 className="mb-4 text-lg font-semibold text-[#F8FAFC]">Statistics</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {stats.map((stat) => (
              <motion.div key={stat.label} variants={item}>
                <Card className="border-0 bg-[#111525]">
                  <CardContent className="flex items-center gap-3 p-4">
                    <div
                      className="flex size-10 shrink-0 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `${stat.color}15` }}
                    >
                      <stat.icon className="size-5" style={{ color: stat.color }} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-[#94A3B8]">{stat.label}</p>
                      <p className="text-lg font-bold text-[#F8FAFC] truncate">{stat.value}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Achievements */}
        <motion.div variants={item}>
          <h2 className="mb-4 text-lg font-semibold text-[#F8FAFC]">Achievements</h2>
          {achievements.length === 0 ? (
            <Card className="border-0 bg-[#111525]">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Award className="mb-3 size-12 text-[#94A3B8]/30" />
                <p className="text-[#94A3B8]">No achievements yet</p>
                <p className="text-xs text-[#94A3B8]/60">Play games to unlock achievements!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {achievements.map((ach) => (
                <motion.div key={ach.id} variants={item}>
                  <Card
                    className={cn(
                      'border-0 transition-colors',
                      ach.unlocked ? 'bg-[#111525]' : 'bg-[#111525]/50 opacity-60'
                    )}
                  >
                    <CardContent className="relative p-4">
                      {!ach.unlocked && (
                        <Lock className="absolute top-3 right-3 size-4 text-[#94A3B8]/40" />
                      )}
                      <div className="mb-2 text-2xl">{ach.icon}</div>
                      <p className="text-sm font-medium text-[#F8FAFC]">{ach.name}</p>
                      <p className="mt-1 text-xs text-[#94A3B8]">{ach.description}</p>
                      {ach.unlocked && ach.unlocked_at && (
                        <p className="mt-2 text-[10px] text-[#22C55E]">
                          Unlocked {new Date(ach.unlocked_at).toLocaleDateString()}
                        </p>
                      )}
                      {!ach.unlocked && (
                        <p className="mt-2 text-[10px] text-[#94A3B8]/50">
                          +{ach.xp_reward} XP
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={item}>
          <h2 className="mb-4 text-lg font-semibold text-[#F8FAFC]">Recent Activity</h2>
          {recentScores.length === 0 ? (
            <Card className="border-0 bg-[#111525]">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Clock className="mb-3 size-12 text-[#94A3B8]/30" />
                <p className="text-[#94A3B8]">No recent activity</p>
                <p className="text-xs text-[#94A3B8]/60">Play some games to see your activity here.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {recentScores.map((entry) => {
                const game = GAMES.find((g) => g.id === entry.game_id)
                const timeAgo = formatTimeAgo(entry.created_at)
                return (
                  <Card key={entry.id} className="border-0 bg-[#111525]">
                    <CardContent className="flex items-center gap-3 py-3">
                      <div className="text-2xl">{game?.icon ?? '🎮'}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#F8FAFC] truncate">{game?.name ?? 'Game'}</p>
                        <p className="text-xs text-[#94A3B8]">{timeAgo}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {entry.is_personal_best && (
                          <Badge className="bg-amber-400/10 text-amber-400 border-0 text-[10px]">PB</Badge>
                        )}
                        <span className="flex items-center gap-1 text-sm font-semibold text-[#F8FAFC]">
                          <Star className="size-3.5 text-amber-400" />
                          {entry.score.toLocaleString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  )
}
