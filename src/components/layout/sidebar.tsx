'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Gamepad2,
  Trophy,
  Calendar,
  Users,
  User,
  Settings,
  Crown,
  LogOut,
} from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useAuthStore } from '@/stores/auth-store'
import { RANK_TIERS, getRankTier, getXPForNextRank } from '@/types/game'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Games', href: '/games', icon: Gamepad2 },
  { label: 'Ranked', href: '/ranked', icon: Trophy },
  { label: 'Daily Challenge', href: '/daily-challenge', icon: Calendar },
  { label: 'Friends', href: '/friends', icon: Users },
  { label: 'Profile', href: '/profile', icon: User },
  { label: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, profile, subscription, isPremium } = useAuthStore()

  const currentTier = profile ? getRankTier(profile.total_xp) : 'bronze'
  const tierData = RANK_TIERS[currentTier]
  const xpProgress = profile ? getXPForNextRank(profile.total_xp) : { nextRank: 'Silver', xpNeeded: 1000, progress: 0 }

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[280px] flex-col border-r border-arena-border bg-[#0D1020] lg:flex">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 px-6">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-gradient-primary flex items-center justify-center">
            <Gamepad2 className="size-4 text-white" />
          </div>
          <span className="text-lg font-bold tracking-wider text-gradient-primary">
            CLUTCH ARENA
          </span>
        </div>
      </div>

      <Separator className="bg-arena-border" />

      {/* User Info */}
      <div className="px-4 py-4">
        <div className="flex items-center gap-3 rounded-lg bg-arena-surface p-3">
          <Avatar size="lg">
            {profile?.avatar_url && <AvatarImage src={profile.avatar_url} />}
            <AvatarFallback className="bg-arena-surface-2 text-arena-text">
              {profile?.display_name?.[0] ?? profile?.username?.[0] ?? '?'}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-arena-text">
              {profile?.display_name ?? profile?.username ?? 'Player'}
            </p>
            <Badge
              variant="outline"
              className="mt-0.5 border-transparent text-xs"
              style={{ color: tierData.color, backgroundColor: `${tierData.color}20` }}
            >
              {tierData.icon} {tierData.name}
            </Badge>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3">
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-arena-primary/15 text-arena-primary-light'
                    : 'text-arena-text-muted hover:bg-arena-surface hover:text-arena-text'
                }`}
              >
                <Icon
                  className={`size-5 transition-colors ${
                    isActive ? 'text-arena-primary' : 'text-arena-text-muted group-hover:text-arena-text'
                  }`}
                />
                {item.label}
                {isActive && (
                  <div className="ml-auto size-1.5 rounded-full bg-arena-primary" />
                )}
              </Link>
            )
          })}

          {/* Premium item */}
          <Link
            href="/premium"
            className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
              pathname === '/premium'
                ? 'bg-arena-primary/15 text-arena-primary-light'
                : isPremium()
                  ? 'text-arena-text-muted hover:bg-arena-surface hover:text-arena-text'
                  : 'text-arena-warning hover:bg-arena-warning/10'
            }`}
          >
            <Crown
              className={`size-5 transition-colors ${
                pathname === '/premium'
                  ? 'text-arena-primary'
                  : isPremium()
                    ? 'text-arena-text-muted group-hover:text-arena-text'
                    : 'text-arena-warning'
              }`}
            />
            Premium
            {!isPremium() && (
              <Badge className="ml-auto bg-arena-warning/20 text-arena-warning text-[10px] px-1.5">
                UPGRADE
              </Badge>
            )}
          </Link>
        </nav>
      </ScrollArea>

      {/* XP Progress */}
      <div className="px-4 pb-2">
        <div className="rounded-lg bg-arena-surface p-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-arena-text-muted">XP Progress</span>
            <span className="font-medium text-arena-text">
              {profile?.total_xp?.toLocaleString() ?? 0} XP
            </span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-arena-surface-2">
            <div
              className="h-full rounded-full bg-gradient-primary transition-all duration-500"
              style={{ width: `${xpProgress.progress}%` }}
            />
          </div>
          <p className="mt-1.5 text-[11px] text-arena-text-muted">
            {xpProgress.xpNeeded.toLocaleString()} XP to {xpProgress.nextRank}
          </p>
        </div>
      </div>

      {/* Sign Out */}
      <div className="border-t border-arena-border p-3">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-arena-text-muted hover:text-arena-danger hover:bg-arena-danger/10"
          onClick={handleSignOut}
        >
          <LogOut className="size-4" />
          Sign Out
        </Button>
      </div>
    </aside>
  )
}
