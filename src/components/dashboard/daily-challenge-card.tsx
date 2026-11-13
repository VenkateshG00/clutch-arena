'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface DailyChallengeCardProps {
  gameName?: string
  description?: string
  attempted?: boolean
  delay?: number
}

function useCountdown() {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    function calc() {
      const now = new Date()
      const tomorrow = new Date(now)
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0)
      const diff = tomorrow.getTime() - now.getTime()
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
      setTimeLeft(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      )
    }
    calc()
    const interval = setInterval(calc, 1000)
    return () => clearInterval(interval)
  }, [])

  return timeLeft
}

export function DailyChallengeCard({
  gameName = 'Speed Typer',
  description = 'Type as many words as possible in 60 seconds. Beat the community average!',
  attempted = false,
  delay = 0,
}: DailyChallengeCardProps) {
  const countdown = useCountdown()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="overflow-hidden rounded-xl border border-arena-border bg-arena-surface"
    >
      {/* Header stripe */}
      <div className="h-1 w-full bg-gradient-primary" />

      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="flex size-10 items-center justify-center rounded-lg bg-arena-primary/15">
              <Calendar className="size-5 text-arena-primary" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-arena-text-muted">Daily Challenge</p>
              <h3 className="text-sm font-semibold text-arena-text">{gameName}</h3>
            </div>
          </div>
          {attempted ? (
            <Badge className="bg-arena-success/15 text-arena-success border-0">Completed</Badge>
          ) : (
            <Badge className="bg-arena-warning/15 text-arena-warning border-0">New</Badge>
          )}
        </div>

        <p className="mt-3 text-sm text-arena-text-muted leading-relaxed">{description}</p>

        <div className="mt-4 flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs text-arena-text-muted">
            <Clock className="size-3.5" />
            <span>Resets in {countdown}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-arena-primary">
            <Zap className="size-3.5" />
            <span>+50 XP</span>
          </div>
        </div>

        <Button
          className="mt-4 w-full gap-2 bg-gradient-primary text-white"
          disabled={attempted}
        >
          {attempted ? 'Challenge Completed' : 'Play Now'}
        </Button>
      </div>
    </motion.div>
  )
}
