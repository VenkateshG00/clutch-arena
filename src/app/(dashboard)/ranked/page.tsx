'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Medal, ChevronDown, Loader2, Crown, Users, Calendar, Gamepad2 } from 'lucide-react'
import { cn } from 'cn'

import { useAuthStore } from '@/stores/auth-store'
import { RANK_TIERS } from '@/types/game'
import type { LeaderboardEntry, RankTier, Game } from '@/types/database'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'

const LIMIT = 20

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

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="h-4 w-8 animate-pulse rounded bg-[#181D30]" />
      <div className="size-8 animate-pulse rounded-full bg-[#181D30]" />
      <div className="flex-1 space-y-1">
        <div className="h-4 w-28 animate-pulse rounded bg-[#181D30]" />
      </div>
      <div className="h-4 w-16 animate-pulse rounded bg-[#181D30]" />
      <div className="h-5 w-16 animate-pulse rounded-full bg-[#181D30]" />
    </div>
  )
}

function LeaderboardSkeleton() {
  return (
    <div className="space-y-1">
      {Array.from({ length: 8 }).map((_, i) => (
        <SkeletonRow key={i} />
      ))}
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Trophy className="mb-3 size-12 text-[#94A3B8]/40" />
      <p className="text-sm text-[#94A3B8]">{message}</p>
    </div>
  )
}

function TopRankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <Crown className="size-5 text-yellow-400" />
  if (rank === 2) return <Medal className="size-5 text-gray-300" />
  if (rank === 3) return <Medal className="size-5 text-amber-600" />
  return <span className="w-5 text-center text-sm font-medium text-[#94A3B8]">{rank}</span>
}

export default function RankedPage() {
  const { user, profile } = useAuthStore()
  const [activeTab, setActiveTab] = useState('global')
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [myRank, setMyRank] = useState<LeaderboardEntry | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [games, setGames] = useState<Game[]>([])
  const [selectedGameId, setSelectedGameId] = useState<string>('')

  // Fetch games for the per-game dropdown
  useEffect(() => {
    fetch('/api/games')
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data.games ?? []
        setGames(list)
        if (list.length > 0 && !selectedGameId) {
          setSelectedGameId(list[0].id)
        }
      })
      .catch(() => {})
  }, [])

  const fetchLeaderboard = useCallback(
    async (offset = 0) => {
      if (offset === 0) {
        setLoading(true)
        setError(null)
      } else {
        setLoadingMore(true)
      }

      try {
        let url = `/api/leaderboard?limit=${LIMIT}&offset=${offset}`
        if (activeTab === 'global') url += '&type=global'
        else if (activeTab === 'weekly') url += '&type=weekly'
        else if (activeTab === 'game' && selectedGameId) url += `&type=game&gameId=${selectedGameId}`

        const res = await fetch(url)
        if (!res.ok) throw new Error('Failed to load leaderboard')
        const data = await res.json()

        const rows: LeaderboardEntry[] = Array.isArray(data) ? data : data.entries ?? []
        if (offset === 0) {
          setEntries(rows)
        } else {
          setEntries((prev) => [...prev, ...rows])
        }
        setHasMore(rows.length >= LIMIT)

        // try to find current user rank
        if (data.myRank) {
          setMyRank(data.myRank)
        } else if (user) {
          const me = rows.find((e: LeaderboardEntry) => e.user_id === user.id)
          if (me) setMyRank(me)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    },
    [activeTab, selectedGameId, user],
  )

  useEffect(() => {
    setEntries([])
    setMyRank(null)
    setHasMore(true)
    if (activeTab === 'game' && !selectedGameId) return
    fetchLeaderboard(0)
  }, [activeTab, selectedGameId, fetchLeaderboard])

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      fetchLeaderboard(entries.length)
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-8">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold text-[#F8FAFC]">Leaderboard</h1>
        <p className="mt-1 text-sm text-[#94A3B8]">See how you stack up against the competition.</p>
      </motion.div>

      {/* Your rank card */}
      {profile && myRank && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="border-[#8B5CF6]/30 bg-[#111525]">
            <CardContent className="flex items-center gap-4 py-4">
              <div className="flex size-12 items-center justify-center rounded-full bg-[#8B5CF6]/20 text-lg font-bold text-[#8B5CF6]">
                #{myRank.rank}
              </div>
              <div className="flex-1">
                <p className="font-medium text-[#F8FAFC]">Your Ranking</p>
                <p className="text-sm text-[#94A3B8]">
                  {myRank.score.toLocaleString()} points
                </p>
              </div>
              <RankBadge tier={profile.rank_tier} />
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        <Tabs defaultValue="global" onValueChange={(val: string | null) => val && setActiveTab(val)}>
          <div className="flex flex-wrap items-center gap-3">
            <TabsList>
              <TabsTrigger value="global">
                <Users className="size-3.5" />
                Global
              </TabsTrigger>
              <TabsTrigger value="weekly">
                <Calendar className="size-3.5" />
                Weekly
              </TabsTrigger>
              <TabsTrigger value="game">
                <Gamepad2 className="size-3.5" />
                Per-Game
              </TabsTrigger>
            </TabsList>

            {activeTab === 'game' && games.length > 0 && (
              <Select
                defaultValue={selectedGameId}
                onValueChange={(val: string | null) => val && setSelectedGameId(val)}
              >
                <SelectTrigger className="w-44 bg-[#111525]">
                  <SelectValue placeholder="Select game" />
                </SelectTrigger>
                <SelectContent>
                  {games.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Shared content for all tabs */}
          {['global', 'weekly', 'game'].map((tab) => (
            <TabsContent key={tab} value={tab}>
              <Card className="mt-4 border-none bg-[#111525]">
                {/* Table header */}
                <div className="flex items-center gap-3 border-b border-[#181D30] px-4 py-2 text-xs font-medium uppercase tracking-wider text-[#94A3B8]">
                  <span className="w-8 text-center">#</span>
                  <span className="flex-1">Player</span>
                  <span className="w-20 text-right">Score</span>
                  <span className="w-20 text-right">Rank</span>
                </div>

                {loading ? (
                  <LeaderboardSkeleton />
                ) : error ? (
                  <div className="flex flex-col items-center py-12">
                    <p className="text-sm text-red-400">{error}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={() => fetchLeaderboard(0)}
                    >
                      Retry
                    </Button>
                  </div>
                ) : entries.length === 0 ? (
                  <EmptyState message="No entries yet. Be the first on the leaderboard!" />
                ) : (
                  <div>
                    {entries.map((entry, idx) => {
                      const isMe = user?.id === entry.user_id
                      return (
                        <motion.div
                          key={`${entry.user_id}-${idx}`}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.25, delay: Math.min(idx * 0.03, 0.5) }}
                          className={cn(
                            'flex items-center gap-3 px-4 py-3 transition-colors hover:bg-[#181D30]/60',
                            isMe && 'bg-[#8B5CF6]/10 ring-1 ring-inset ring-[#8B5CF6]/20',
                            idx !== entries.length - 1 && 'border-b border-[#181D30]/50',
                          )}
                        >
                          <div className="flex w-8 items-center justify-center">
                            <TopRankIcon rank={entry.rank} />
                          </div>
                          <Avatar size="default">
                            {entry.avatar_url ? (
                              <AvatarImage src={entry.avatar_url} alt={entry.username} />
                            ) : null}
                            <AvatarFallback>
                              {entry.username?.slice(0, 2).toUpperCase() ?? '??'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 truncate">
                            <span className={cn('text-sm font-medium', isMe ? 'text-[#8B5CF6]' : 'text-[#F8FAFC]')}>
                              {entry.display_name || entry.username}
                            </span>
                            {isMe && (
                              <span className="ml-2 text-xs text-[#8B5CF6]">(You)</span>
                            )}
                          </div>
                          <span className="w-20 text-right text-sm font-semibold tabular-nums text-[#F8FAFC]">
                            {entry.score.toLocaleString()}
                          </span>
                          <div className="flex w-20 justify-end">
                            <RankBadge tier={entry.rank_tier} />
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                )}

                {/* Load more */}
                {!loading && !error && hasMore && entries.length > 0 && (
                  <div className="flex justify-center border-t border-[#181D30] py-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={loadMore}
                      disabled={loadingMore}
                      className="gap-1.5"
                    >
                      {loadingMore ? (
                        <>
                          <Loader2 className="size-3.5 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <ChevronDown className="size-3.5" />
                          Load More
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </motion.div>
    </div>
  )
}
