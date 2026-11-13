'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Trophy,
  Clock,
  Play,
  CheckCircle2,
  Calendar,
  Star,
  Loader2,
  ChevronRight,
  Flame,
} from 'lucide-react'
import { cn } from 'cn'

import { useAuthStore } from '@/stores/auth-store'
import { RANK_TIERS } from '@/types/game'
import type { RankTier, LeaderboardEntry } from '@/types/database'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'

// ---------- Types ----------

interface TodayChallenge {
  id: string
  game_id: string
  game_name: string
  game_slug: string
  description: string
  special_rules: string | null
  challenge_date: string
  configuration: Record<string, unknown>
}

interface MyResult {
  score: number
  rank: number
  completed_at: string
}

interface PastChallenge {
  id: string
  game_name: string
  challenge_date: string
  participants: number
  top_score: number
  my_score: number | null
}

// ---------- Countdown hook ----------

function useCountdown() {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    function calc() {
      const now = new Date()
      const tomorrow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1))
      const diff = tomorrow.getTime() - now.getTime()

      const h = Math.floor(diff / 3_600_000)
      const m = Math.floor((diff % 3_600_000) / 60_000)
      const s = Math.floor((diff % 60_000) / 1000)

      setTimeLeft(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`)
    }

    calc()
    const id = setInterval(calc, 1000)
    return () => clearInterval(id)
  }, [])

  return timeLeft
}

// ---------- Sub-components ----------

function RankBadge({ tier }: { tier: RankTier }) {
  const info = RANK_TIERS[tier]
  return (
    <Badge
      variant="outline"
      className="gap-1 border-transparent text-xs"
      style={{ color: info.color, backgroundColor: `${info.color}18` }}
    >
      <span>{info.icon}</span>
      {info.name}
    </Badge>
  )
}

function CardSkeleton() {
  return (
    <Card className="border-none bg-[#111525]">
      <CardContent className="space-y-4 py-6">
        <div className="h-5 w-40 animate-pulse rounded bg-[#181D30]" />
        <div className="h-4 w-full animate-pulse rounded bg-[#181D30]" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-[#181D30]" />
        <div className="h-9 w-28 animate-pulse rounded-lg bg-[#181D30]" />
      </CardContent>
    </Card>
  )
}

function LeaderboardSkeleton() {
  return (
    <div className="space-y-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3">
          <div className="h-4 w-6 animate-pulse rounded bg-[#181D30]" />
          <div className="size-8 animate-pulse rounded-full bg-[#181D30]" />
          <div className="h-4 flex-1 animate-pulse rounded bg-[#181D30]" />
          <div className="h-4 w-16 animate-pulse rounded bg-[#181D30]" />
        </div>
      ))}
    </div>
  )
}

// ---------- Main ----------

export default function DailyChallengePage() {
  const { user } = useAuthStore()
  const countdown = useCountdown()

  const [challenge, setChallenge] = useState<TodayChallenge | null>(null)
  const [myResult, setMyResult] = useState<MyResult | null>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [history, setHistory] = useState<PastChallenge[]>([])
  const [loading, setLoading] = useState(true)
  const [lbLoading, setLbLoading] = useState(true)
  const [historyLoading, setHistoryLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch today's challenge
  useEffect(() => {
    setLoading(true)
    setError(null)
    fetch('/api/daily-challenge')
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load daily challenge')
        return r.json()
      })
      .then((data) => {
        setChallenge(data.challenge ?? data)
        setMyResult(data.myResult ?? null)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  // Fetch daily leaderboard
  useEffect(() => {
    setLbLoading(true)
    fetch('/api/daily-challenge/leaderboard')
      .then((r) => r.json())
      .then((data) => setLeaderboard(Array.isArray(data) ? data : data.entries ?? []))
      .catch(() => {})
      .finally(() => setLbLoading(false))
  }, [])

  // Fetch history
  useEffect(() => {
    setHistoryLoading(true)
    fetch('/api/daily-challenge/history')
      .then((r) => r.json())
      .then((data) => setHistory(Array.isArray(data) ? data : data.challenges ?? []))
      .catch(() => {})
      .finally(() => setHistoryLoading(false))
  }, [])

  const hasPlayed = myResult !== null

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold text-[#F8FAFC]">Daily Challenge</h1>
        <p className="mt-1 text-sm text-[#94A3B8]">
          A new challenge every day. Compete for the top spot!
        </p>
      </motion.div>

      {/* Countdown */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.08 }}
      >
        <Card className="border-none bg-[#111525]">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="flex size-10 items-center justify-center rounded-full bg-[#3B82F6]/20">
              <Clock className="size-5 text-[#3B82F6]" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium uppercase tracking-wider text-[#94A3B8]">
                Next challenge in
              </p>
              <p className="text-xl font-bold tabular-nums text-[#F8FAFC]">{countdown}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Today's challenge */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        {loading ? (
          <CardSkeleton />
        ) : error ? (
          <Card className="border-none bg-[#111525]">
            <CardContent className="py-10 text-center">
              <p className="text-sm text-red-400">{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        ) : challenge ? (
          <Card className="border-none bg-[#111525]">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-[#F8FAFC]">
                    <Flame className="size-5 text-orange-400" />
                    {challenge.game_name}
                  </CardTitle>
                  <CardDescription className="mt-1 text-[#94A3B8]">
                    {challenge.description}
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="shrink-0">
                  {new Date(challenge.challenge_date).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  })}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {challenge.special_rules && (
                <div className="rounded-lg bg-[#181D30] px-3 py-2">
                  <p className="text-xs font-medium uppercase tracking-wider text-[#94A3B8]">
                    Special Rules
                  </p>
                  <p className="mt-1 text-sm text-[#F8FAFC]">{challenge.special_rules}</p>
                </div>
              )}

              {hasPlayed ? (
                <div className="rounded-lg border border-[#22C55E]/30 bg-[#22C55E]/10 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-5 text-[#22C55E]" />
                    <span className="font-medium text-[#22C55E]">Challenge Completed!</span>
                  </div>
                  <div className="mt-2 flex gap-6">
                    <div>
                      <p className="text-xs text-[#94A3B8]">Your Score</p>
                      <p className="text-lg font-bold text-[#F8FAFC]">
                        {myResult.score.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[#94A3B8]">Your Rank</p>
                      <p className="text-lg font-bold text-[#F8FAFC]">#{myResult.rank}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <Link href={`/games/${challenge.game_slug}?challenge=${challenge.id}`}>
                  <Button className="gap-2 bg-[#8B5CF6] hover:bg-[#8B5CF6]/80">
                    <Play className="size-4" />
                    Play Challenge
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="border-none bg-[#111525]">
            <CardContent className="flex flex-col items-center py-12">
              <Calendar className="mb-3 size-12 text-[#94A3B8]/40" />
              <p className="text-sm text-[#94A3B8]">No challenge available today. Check back soon!</p>
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Daily leaderboard */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.22 }}
      >
        <Card className="border-none bg-[#111525]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#F8FAFC]">
              <Trophy className="size-5 text-yellow-400" />
              Today&apos;s Leaderboard
            </CardTitle>
          </CardHeader>
          <Separator className="bg-[#181D30]" />
          <CardContent className="p-0">
            {lbLoading ? (
              <LeaderboardSkeleton />
            ) : leaderboard.length === 0 ? (
              <div className="flex flex-col items-center py-10">
                <Trophy className="mb-2 size-8 text-[#94A3B8]/30" />
                <p className="text-sm text-[#94A3B8]">No entries yet. Be the first!</p>
              </div>
            ) : (
              <div>
                {leaderboard.map((entry, idx) => {
                  const isMe = user?.id === entry.user_id
                  return (
                    <motion.div
                      key={entry.user_id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: idx * 0.04 }}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3',
                        isMe && 'bg-[#8B5CF6]/10',
                        idx !== leaderboard.length - 1 && 'border-b border-[#181D30]/50',
                      )}
                    >
                      <span
                        className={cn(
                          'w-6 text-center text-sm font-bold',
                          idx === 0 && 'text-yellow-400',
                          idx === 1 && 'text-gray-300',
                          idx === 2 && 'text-amber-600',
                          idx > 2 && 'text-[#94A3B8]',
                        )}
                      >
                        {entry.rank}
                      </span>
                      <Avatar size="default">
                        {entry.avatar_url ? (
                          <AvatarImage src={entry.avatar_url} alt={entry.username} />
                        ) : null}
                        <AvatarFallback>
                          {entry.username?.slice(0, 2).toUpperCase() ?? '??'}
                        </AvatarFallback>
                      </Avatar>
                      <span
                        className={cn(
                          'flex-1 truncate text-sm font-medium',
                          isMe ? 'text-[#8B5CF6]' : 'text-[#F8FAFC]',
                        )}
                      >
                        {entry.display_name || entry.username}
                        {isMe && <span className="ml-1 text-xs text-[#8B5CF6]">(You)</span>}
                      </span>
                      <span className="text-sm font-semibold tabular-nums text-[#F8FAFC]">
                        {entry.score.toLocaleString()}
                      </span>
                      <RankBadge tier={entry.rank_tier} />
                    </motion.div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Past challenges */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <Card className="border-none bg-[#111525]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#F8FAFC]">
              <Calendar className="size-5 text-[#3B82F6]" />
              Past Challenges
            </CardTitle>
          </CardHeader>
          <Separator className="bg-[#181D30]" />
          <CardContent className="p-0">
            {historyLoading ? (
              <div className="space-y-1 p-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 py-2">
                    <div className="h-4 w-20 animate-pulse rounded bg-[#181D30]" />
                    <div className="h-4 flex-1 animate-pulse rounded bg-[#181D30]" />
                    <div className="h-4 w-16 animate-pulse rounded bg-[#181D30]" />
                  </div>
                ))}
              </div>
            ) : history.length === 0 ? (
              <div className="flex flex-col items-center py-10">
                <Calendar className="mb-2 size-8 text-[#94A3B8]/30" />
                <p className="text-sm text-[#94A3B8]">No past challenges yet.</p>
              </div>
            ) : (
              <div>
                {history.map((item, idx) => (
                  <div
                    key={item.id}
                    className={cn(
                      'flex items-center gap-4 px-4 py-3',
                      idx !== history.length - 1 && 'border-b border-[#181D30]/50',
                    )}
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[#F8FAFC]">{item.game_name}</p>
                      <p className="text-xs text-[#94A3B8]">
                        {new Date(item.challenge_date).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                        {' · '}
                        {item.participants} players
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-[#94A3B8]">Top Score</p>
                      <p className="text-sm font-semibold tabular-nums text-[#F8FAFC]">
                        {item.top_score.toLocaleString()}
                      </p>
                    </div>
                    {item.my_score !== null && (
                      <div className="text-right">
                        <p className="text-xs text-[#94A3B8]">Your Score</p>
                        <p className="text-sm font-semibold tabular-nums text-[#8B5CF6]">
                          {item.my_score.toLocaleString()}
                        </p>
                      </div>
                    )}
                    <ChevronRight className="size-4 text-[#94A3B8]" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
