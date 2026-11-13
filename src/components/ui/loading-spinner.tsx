'use client'

import { cn } from '@/lib/utils'

export function LoadingSpinner({ className, size = 'md' }: { className?: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-3',
  }

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-[#8B5CF6] border-t-transparent',
        sizeClasses[size],
        className
      )}
    />
  )
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-[#94A3B8] text-sm">Loading...</p>
      </div>
    </div>
  )
}

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse rounded-xl bg-[#111525] border border-white/[0.06]', className)}>
      <div className="p-6 space-y-4">
        <div className="h-4 bg-[#181D30] rounded w-3/4" />
        <div className="h-3 bg-[#181D30] rounded w-1/2" />
        <div className="h-3 bg-[#181D30] rounded w-2/3" />
      </div>
    </div>
  )
}
