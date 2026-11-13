'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Gamepad2,
  Trophy,
  Users,
  User,
} from 'lucide-react'

const mobileNavItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Games', href: '/games', icon: Gamepad2 },
  { label: 'Ranked', href: '/ranked', icon: Trophy },
  { label: 'Friends', href: '/friends', icon: Users },
  { label: 'Profile', href: '/profile', icon: User },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-arena-border bg-[#0D1020]/95 backdrop-blur-lg lg:hidden">
      <div className="flex items-center justify-around px-2 py-1">
        {mobileNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 rounded-lg px-3 py-2 text-[10px] font-medium transition-colors ${
                isActive
                  ? 'text-arena-primary'
                  : 'text-arena-text-muted'
              }`}
            >
              <Icon className={`size-5 ${isActive ? 'text-arena-primary' : ''}`} />
              <span>{item.label}</span>
              {isActive && (
                <div className="absolute top-0 h-0.5 w-8 rounded-full bg-arena-primary" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
