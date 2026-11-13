'use client'

import { Suspense } from 'react'
import { AuthProvider } from '@/components/providers/auth-provider'
import { Sidebar } from '@/components/layout/sidebar'
import { MobileNav } from '@/components/layout/mobile-nav'

function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-arena-bg">
        <Sidebar />
        <main className="min-h-screen pb-20 lg:pl-[280px] lg:pb-0">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
        <MobileNav />
      </div>
    </AuthProvider>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#090B14] flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#8B5CF6] border-t-transparent" />
      </div>
    }>
      <DashboardShell>{children}</DashboardShell>
    </Suspense>
  )
}
