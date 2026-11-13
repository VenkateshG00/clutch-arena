'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Trophy,
  Gamepad2,
  Target,
  Star,
  Award,
  UserPlus,
  UserCheck,
  Clock as ClockIcon,
  Lock,
  Loader2,
  ArrowLeft,
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { RANK_TIERS, getXPForNextRank } from '@/types/game'
import type { Profile, Achievement, FriendshipStatus } from '@/types/database'
import { cn } from 'cn'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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

function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-[#090B14] p-4 md:p-8 animate-pulse">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
          <div className="size-24 rounded-full bg-[#181D30]" />
          <div className="flex-1 space-y-3 text-center md:text-left">
            <div className="h-7 w-48 rounded bg-[#181D30]" />
            <div className="h-5 w-32 rounded bg-[#181D30]" />
            <div className="h-5 w-24 rounded bg-[#181D30]" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-[#111525]" />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function PublicProfilePageWrapper() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[#8B5CF6] border-t-transparent" /></div>}>
      <PublicProfilePage />
    </Suspense>
  )
}

function PublicProfilePage() {
  const params = useParams()
  const id = params.id as string
  const { user } = useAuthStore()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [achievements, setAchievements] = useState<AchievementWithStatus[]>([])
  const [friendshipStatus, setFriendshipStatus] = useState<FriendshipStatus | 'none'>('none')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [friendLoading, setFriendLoading] = useState(false)

  const isOwnProfile = user?.id === id

  const fetchProfile = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [profileRes, achievementsRes, friendRes] = await Promise.allSettled([
        fetch(`/api/profile/${id}`),
        fetch(`/api/achievements?user_id=${id}`),
        user ? fetch(`/api/friends/status?user_id=${id}`) : Promise.resolve(null),
      ])

      if (profileRes.status === 'fulfilled' && profileRes.value.ok) {
        const data = await profileRes.value.json()
        setProfile(data.profile)
      } else {
        setError('Player not found.')
        return
      }

      if (achievementsRes.status === 'fulfilled' && achievementsRes.value.ok) {
        const data = await achievementsRes.value.json()
        setAchievements(data.achievements ?? [])
      }

      if (
        friendRes.status === 'fulfilled' &&
        friendRes.value &&
        friendRes.value.ok
      ) {
        const data = await friendRes.value.json()
        setFriendshipStatus(data.status ?? 'none')
      }
    } catch {
      setError('Failed to load profile.')
    } finally {
      setLoading(false)
    }
  }, [id, user])

  useEffect(() => {
    if (id) fetchProfile()
  }, [id, fetchProfile])

  const handleAddFriend = async () => {
    setFriendLoading(true)
    try {
      const res = await fetch('/api/friends/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addressee_id: id }),
      })
      if (res.ok) {
        setFriendshipStatus('pending')
      }
    } catch {
      // silently fail
    } finally {
      setFriendLoading(false)
    }
  }

  if (loading) return <ProfileSkeleton />

  if (error || !profile) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#090B14]">
        <p className="text-red-400">{error || 'Player not found.'}</p>
        <div className="flex gap-3">
          <Link href="/ranked">
            <Button variant="outline" size="sm" className="border-[#181D30]">
              <ArrowLeft className="mr-1 size-4" />
              Leaderboard
            </Button>
          </Link>
          <Button onClick={fetchProfile} variant="outline" size="sm" className="border-[#181D30]">
            Retry
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

  const initials = (profile.display_name || profile.username || '?')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const stats = [
    { label: 'Games Played', value: profile.games_played, icon: Gamepad2, color: '#3B82F6' },
    { label: 'Wins', value: profile.wins, icon: Trophy, color: '#22C55E' },
    { label: 'Win Rate', value: `${winRate}%`, icon: Target, color: '#8B5CF6' },
    { label: 'Total XP', value: profile.total_xp.toLocaleString(), icon: Star, color: '#FFD700' },
  ]

  const friendButtonContent = () => {
    if (isOwnProfile) return null
    switch (friendshipStatus) {
      case 'accepted':
        return (
          <Badge className="gap-1 bg-[#22C55E]/15 text-[#22C55E]">
            <UserCheck className="size-3" />
            Friends
          </Badge>
        )
      case 'pending':
        return (
          <Badge className="gap-1 bg-[#F59E0B]/15 text-[#F59E0B]">
            <ClockIcon className="size-3" />
            Request Pending
          </Badge>
        )
      case 'blocked':
        return null
      default:
        return (
          <Button
            onClick={handleAddFriend}
            disabled={friendLoading}
            size="sm"
            className="gap-1.5 bg-[#8B5CF6] hover:bg-[#8B5CF6]/80"
          >
            {friendLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <UserPlus className="size-4" />
            )}
            Add Friend
          </Button>
        )
    }
  }

  return (
    <div className="min-h-screen bg-[#090B14] p-4 md:p-8">
      <motion.div
        className="mx-auto max-w-4xl space-y-8"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* Back link */}
        <motion.div variants={item}>
          <Link href="/ranked" className="inline-flex items-center gap-1 text-sm text-[#94A3B8] hover:text-[#F8FAFC] transition-colors">
            <ArrowLeft className="size-4" />
            Back to Leaderboard
          </Link>
        </motion.div>

        {/* Profile Header */}
        <motion.div variants={item} className="flex flex-col items-center gap-6 md:flex-row md:items-start">
          <Avatar className="size-24 text-2xl">
            {profile.avatar_url ? (
              <AvatarImage src={profile.avatar_url} alt={profile.username} />
            ) : null}
            <AvatarFallback className="bg-[#181D30] text-[#F8FAFC]">
              {initials}
            </AvatarFallback>
          </Avatar>

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

          <div className="flex items-center gap-2">
            {friendButtonContent()}
          </div>
        </motion.div>

        <Separator className="bg-[#181D30]" />

        {/* Stats Grid */}
        <motion.div variants={item}>
          <h2 className="mb-4 text-lg font-semibold text-[#F8FAFC]">Statistics</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
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
                <p className="text-[#94A3B8]">No achievements unlocked yet</p>
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
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Member since */}
        <motion.div variants={item}>
          <p className="text-center text-xs text-[#94A3B8]/60">
            Member since {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}
