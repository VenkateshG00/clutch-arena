'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Users, Search, UserPlus, SendHorizontal, Clock, Swords, UserX, Check, X, Loader2 } from 'lucide-react'
import { cn } from 'cn'

import { useAuthStore } from '@/stores/auth-store'
import { RANK_TIERS, getRankTier } from '@/types/game'
import type { Profile, Friendship } from '@/types/database'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'

interface FriendWithProfile {
  friendship: Friendship
  profile: Profile
}

interface SearchResult {
  profile: Profile
  isFriend: boolean
  isPending: boolean
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-lg bg-[#181D30]', className)} />
}

function FriendCard({ friend, onAction }: { friend: FriendWithProfile; onAction?: (type: string, id: string) => void }) {
  const tier = RANK_TIERS[friend.profile.rank_tier]

  return (
    <motion.div variants={item}>
      <Card className="bg-[#111525] border-[#181D30]">
        <CardContent className="flex items-center gap-4 py-3">
          <Link href={`/profile/${friend.profile.id}`}>
            <Avatar size="lg">
              {friend.profile.avatar_url ? (
                <AvatarImage src={friend.profile.avatar_url} alt={friend.profile.username} />
              ) : null}
              <AvatarFallback className="bg-[#181D30] text-[#94A3B8]">
                {friend.profile.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex-1 min-w-0">
            <Link href={`/profile/${friend.profile.id}`} className="hover:underline">
              <p className="font-medium text-[#F8FAFC] truncate">{friend.profile.display_name || friend.profile.username}</p>
            </Link>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge variant="outline" className="text-xs border-[#181D30]" style={{ color: tier.color }}>
                {tier.icon} {tier.name}
              </Badge>
              <span className="text-xs text-[#94A3B8]">{friend.profile.total_xp.toLocaleString()} XP</span>
            </div>
          </div>
          <Link href={`/challenge/create?friend=${friend.profile.id}`}>
            <Button variant="outline" size="sm" className="border-[#8B5CF6]/30 text-[#8B5CF6] hover:bg-[#8B5CF6]/10">
              <Swords className="size-3.5 mr-1" />
              Challenge
            </Button>
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function PendingCard({ friend, onAccept, onDecline, loading }: {
  friend: FriendWithProfile
  onAccept: () => void
  onDecline: () => void
  loading: boolean
}) {
  const tier = RANK_TIERS[friend.profile.rank_tier]

  return (
    <motion.div variants={item}>
      <Card className="bg-[#111525] border-[#181D30]">
        <CardContent className="flex items-center gap-4 py-3">
          <Avatar size="lg">
            {friend.profile.avatar_url ? (
              <AvatarImage src={friend.profile.avatar_url} alt={friend.profile.username} />
            ) : null}
            <AvatarFallback className="bg-[#181D30] text-[#94A3B8]">
              {friend.profile.username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-[#F8FAFC] truncate">{friend.profile.display_name || friend.profile.username}</p>
            <Badge variant="outline" className="text-xs mt-0.5 border-[#181D30]" style={{ color: tier.color }}>
              {tier.icon} {tier.name}
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={onAccept} disabled={loading} className="bg-[#22C55E] hover:bg-[#22C55E]/80 text-white">
              <Check className="size-3.5" />
            </Button>
            <Button variant="destructive" size="sm" onClick={onDecline} disabled={loading}>
              <X className="size-3.5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function SentCard({ friend, onCancel, loading }: {
  friend: FriendWithProfile
  onCancel: () => void
  loading: boolean
}) {
  return (
    <motion.div variants={item}>
      <Card className="bg-[#111525] border-[#181D30]">
        <CardContent className="flex items-center gap-4 py-3">
          <Avatar size="lg">
            {friend.profile.avatar_url ? (
              <AvatarImage src={friend.profile.avatar_url} alt={friend.profile.username} />
            ) : null}
            <AvatarFallback className="bg-[#181D30] text-[#94A3B8]">
              {friend.profile.username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-[#F8FAFC] truncate">{friend.profile.display_name || friend.profile.username}</p>
            <p className="text-xs text-[#94A3B8] mt-0.5 flex items-center gap-1">
              <Clock className="size-3" /> Request pending
            </p>
          </div>
          <Button variant="destructive" size="sm" onClick={onCancel} disabled={loading}>
            <UserX className="size-3.5 mr-1" />
            Cancel
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function EmptyState({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="size-16 rounded-full bg-[#181D30] flex items-center justify-center mb-4">
        <Icon className="size-8 text-[#94A3B8]" />
      </div>
      <h3 className="text-lg font-medium text-[#F8FAFC] mb-1">{title}</h3>
      <p className="text-sm text-[#94A3B8] max-w-sm">{description}</p>
    </motion.div>
  )
}

export default function FriendsPage() {
  const { user, profile } = useAuthStore()
  const [friends, setFriends] = useState<FriendWithProfile[]>([])
  const [pendingRequests, setPendingRequests] = useState<FriendWithProfile[]>([])
  const [sentRequests, setSentRequests] = useState<FriendWithProfile[]>([])
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(t)
    }
  }, [toast])

  const fetchFriends = useCallback(async () => {
    if (!user) return
    setIsLoading(true)
    setError(null)
    try {
      const [friendsRes, pendingRes, sentRes] = await Promise.all([
        fetch('/api/friends?status=accepted'),
        fetch('/api/friends?status=pending&type=received'),
        fetch('/api/friends?status=pending&type=sent'),
      ])
      if (friendsRes.ok) setFriends(await friendsRes.json())
      if (pendingRes.ok) setPendingRequests(await pendingRes.json())
      if (sentRes.ok) setSentRequests(await sentRes.json())
    } catch {
      setError('Failed to load friends')
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchFriends()
  }, [fetchFriends])

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }
    const timeout = setTimeout(async () => {
      setIsSearching(true)
      try {
        const res = await fetch(`/api/friends/search?q=${encodeURIComponent(searchQuery)}`)
        if (res.ok) setSearchResults(await res.json())
      } catch {
        // ignore search errors
      } finally {
        setIsSearching(false)
      }
    }, 400)
    return () => clearTimeout(timeout)
  }, [searchQuery])

  const handleAccept = async (friendshipId: string) => {
    setActionLoading(friendshipId)
    try {
      const res = await fetch('/api/friends/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendshipId }),
      })
      if (res.ok) {
        setToast({ message: 'Friend request accepted!', type: 'success' })
        fetchFriends()
      } else {
        setToast({ message: 'Failed to accept request', type: 'error' })
      }
    } catch {
      setToast({ message: 'Something went wrong', type: 'error' })
    } finally {
      setActionLoading(null)
    }
  }

  const handleDecline = async (friendshipId: string) => {
    setActionLoading(friendshipId)
    try {
      const res = await fetch('/api/friends/decline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendshipId }),
      })
      if (res.ok) {
        setToast({ message: 'Request declined', type: 'success' })
        fetchFriends()
      } else {
        setToast({ message: 'Failed to decline request', type: 'error' })
      }
    } catch {
      setToast({ message: 'Something went wrong', type: 'error' })
    } finally {
      setActionLoading(null)
    }
  }

  const handleCancel = async (friendshipId: string) => {
    setActionLoading(friendshipId)
    try {
      const res = await fetch('/api/friends/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendshipId }),
      })
      if (res.ok) {
        setToast({ message: 'Request cancelled', type: 'success' })
        fetchFriends()
      } else {
        setToast({ message: 'Failed to cancel request', type: 'error' })
      }
    } catch {
      setToast({ message: 'Something went wrong', type: 'error' })
    } finally {
      setActionLoading(null)
    }
  }

  const handleAddFriend = async (userId: string) => {
    setActionLoading(userId)
    try {
      const res = await fetch('/api/friends/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addresseeId: userId }),
      })
      if (res.ok) {
        setToast({ message: 'Friend request sent!', type: 'success' })
        setSearchQuery('')
        setSearchResults([])
        fetchFriends()
      } else {
        setToast({ message: 'Failed to send request', type: 'error' })
      }
    } catch {
      setToast({ message: 'Something went wrong', type: 'error' })
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#090B14]">
      <div className="mx-auto max-w-3xl px-4 py-8">
        {/* Toast */}
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={cn(
              'fixed top-4 right-4 z-50 rounded-lg px-4 py-3 text-sm font-medium shadow-lg',
              toast.type === 'success' ? 'bg-[#22C55E] text-white' : 'bg-red-500 text-white'
            )}
          >
            {toast.message}
          </motion.div>
        )}

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-[#F8FAFC] flex items-center gap-3">
            <Users className="size-8 text-[#8B5CF6]" />
            Friends
          </h1>
          <p className="text-[#94A3B8] mt-1">Manage your friends and challenge them to games</p>
        </motion.div>

        {/* Search */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#94A3B8]" />
            <Input
              placeholder="Search players by username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery((e.target as HTMLInputElement).value)}
              className="pl-10 bg-[#111525] border-[#181D30] text-[#F8FAFC] placeholder:text-[#94A3B8]/60 h-10"
            />
            {isSearching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-[#94A3B8] animate-spin" />}
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="mt-2">
              <Card className="bg-[#111525] border-[#181D30]">
                <CardContent className="p-2">
                  {searchResults.map((result) => (
                    <div key={result.profile.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#181D30] transition-colors">
                      <Avatar>
                        {result.profile.avatar_url ? (
                          <AvatarImage src={result.profile.avatar_url} alt={result.profile.username} />
                        ) : null}
                        <AvatarFallback className="bg-[#181D30] text-[#94A3B8]">
                          {result.profile.username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#F8FAFC] truncate">{result.profile.username}</p>
                        <p className="text-xs text-[#94A3B8]">{result.profile.total_xp.toLocaleString()} XP</p>
                      </div>
                      {result.isFriend ? (
                        <Badge variant="secondary" className="text-xs">Already Friends</Badge>
                      ) : result.isPending ? (
                        <Badge variant="outline" className="text-xs border-[#181D30] text-[#94A3B8]">Pending</Badge>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleAddFriend(result.profile.id)}
                          disabled={actionLoading === result.profile.id}
                          className="bg-[#8B5CF6] hover:bg-[#8B5CF6]/80"
                        >
                          {actionLoading === result.profile.id ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <>
                              <UserPlus className="size-3.5 mr-1" />
                              Add
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>

        <Separator className="bg-[#181D30] mb-6" />

        {/* Tabs */}
        <Tabs defaultValue="friends">
          <TabsList variant="line" className="mb-6">
            <TabsTrigger value="friends" className="text-[#F8FAFC]">
              <Users className="size-4 mr-1.5" />
              Friends
              {friends.length > 0 && (
                <Badge variant="secondary" className="ml-1.5 text-xs h-4 px-1.5">{friends.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="pending" className="text-[#F8FAFC]">
              <Clock className="size-4 mr-1.5" />
              Pending
              {pendingRequests.length > 0 && (
                <Badge className="ml-1.5 text-xs h-4 px-1.5 bg-[#8B5CF6]">{pendingRequests.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="sent" className="text-[#F8FAFC]">
              <SendHorizontal className="size-4 mr-1.5" />
              Sent
              {sentRequests.length > 0 && (
                <Badge variant="outline" className="ml-1.5 text-xs h-4 px-1.5 border-[#181D30] text-[#94A3B8]">{sentRequests.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Friends Tab */}
          <TabsContent value="friends">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-[72px] w-full" />
                ))}
              </div>
            ) : error ? (
              <Card className="bg-[#111525] border-[#181D30]">
                <CardContent className="py-8 text-center">
                  <p className="text-red-400">{error}</p>
                  <Button variant="outline" size="sm" onClick={fetchFriends} className="mt-3 border-[#181D30] text-[#F8FAFC]">
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            ) : friends.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No friends yet"
                description="Search for players above to add friends and start challenging them to games!"
              />
            ) : (
              <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
                {friends.map((friend) => (
                  <FriendCard key={friend.friendship.id} friend={friend} />
                ))}
              </motion.div>
            )}
          </TabsContent>

          {/* Pending Tab */}
          <TabsContent value="pending">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-[72px] w-full" />
                ))}
              </div>
            ) : pendingRequests.length === 0 ? (
              <EmptyState
                icon={Clock}
                title="No pending requests"
                description="When someone sends you a friend request, it will appear here."
              />
            ) : (
              <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
                {pendingRequests.map((friend) => (
                  <PendingCard
                    key={friend.friendship.id}
                    friend={friend}
                    onAccept={() => handleAccept(friend.friendship.id)}
                    onDecline={() => handleDecline(friend.friendship.id)}
                    loading={actionLoading === friend.friendship.id}
                  />
                ))}
              </motion.div>
            )}
          </TabsContent>

          {/* Sent Tab */}
          <TabsContent value="sent">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-[72px] w-full" />
                ))}
              </div>
            ) : sentRequests.length === 0 ? (
              <EmptyState
                icon={SendHorizontal}
                title="No sent requests"
                description="Friend requests you send will appear here until they are accepted."
              />
            ) : (
              <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
                {sentRequests.map((friend) => (
                  <SentCard
                    key={friend.friendship.id}
                    friend={friend}
                    onCancel={() => handleCancel(friend.friendship.id)}
                    loading={actionLoading === friend.friendship.id}
                  />
                ))}
              </motion.div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
