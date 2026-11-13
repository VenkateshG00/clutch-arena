'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'

interface GameTimerProps {
  timeRemaining: number
  totalTime: number
}

export function GameTimer({ timeRemaining, totalTime }: GameTimerProps) {
  const fraction = totalTime > 0 ? Math.max(0, timeRemaining / totalTime) : 0
  const percentage = fraction * 100

  const color = useMemo(() => {
    if (fraction > 0.5) return '#22C55E'
    if (fraction > 0.25) return '#F59E0B'
    return '#EF4444'
  }, [fraction])

  const isLow = fraction <= 0.25

  return (
    <div className="w-full">
      <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-[#181D30]">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            backgroundColor: color,
            boxShadow: `0 0 12px ${color}66`,
          }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.3, ease: 'linear' }}
        />
      </div>
      <div className="mt-1.5 flex justify-end">
        <span
          className={`font-mono text-sm font-bold tabular-nums ${
            isLow ? 'animate-pulse text-[#EF4444]' : 'text-[#F8FAFC]/60'
          }`}
        >
          {Math.ceil(timeRemaining)}s
        </span>
      </div>
    </div>
  )
}
