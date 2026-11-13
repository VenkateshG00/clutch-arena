'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import type { GameResult } from '@/types/game'

interface GameOverProps {
  result: GameResult
  personalBest: number
  onPlayAgain: () => void
  onViewLeaderboard?: () => void
  xpEarned?: number
  isNewRecord?: boolean
  gameSlug?: string
  children?: React.ReactNode
}

function AnimatedNumber({ value, duration = 1000 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const start = performance.now()
    let raf: number

    function tick(now: number) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(eased * value))
      if (progress < 1) {
        raf = requestAnimationFrame(tick)
      }
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value, duration])

  return <>{display.toLocaleString()}</>
}

export function GameOver({
  result,
  personalBest,
  onPlayAgain,
  onViewLeaderboard,
  xpEarned,
  isNewRecord,
  gameSlug,
  children,
}: GameOverProps) {
  const isNewBest = isNewRecord ?? result.score > personalBest

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#090B14]/95 backdrop-blur-md p-4"
    >
      <motion.div
        initial={{ scale: 0.8, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 200 }}
        className="w-full max-w-md rounded-2xl border border-[#8B5CF6]/20 bg-[#111525] p-6 md:p-8"
      >
        {/* Header */}
        <div className="mb-6 text-center">
          <h2 className="mb-1 text-3xl font-black text-[#F8FAFC]">
            Game Over
          </h2>
          {isNewBest && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: 'spring', stiffness: 300 }}
              className="inline-block rounded-full bg-[#22C55E]/15 px-4 py-1"
            >
              <span className="text-sm font-bold text-[#22C55E]">
                NEW PERSONAL BEST!
              </span>
            </motion.div>
          )}
        </div>

        {/* Final Score */}
        <div className="mb-6 text-center">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="text-5xl font-black text-[#8B5CF6] md:text-6xl"
          >
            <AnimatedNumber value={result.score} duration={1200} />
          </motion.div>
          <p className="mt-1 text-sm text-[#F8FAFC]/40">points</p>
        </div>

        {/* Stats */}
        <div className="mb-6 space-y-2">
          {result.accuracy !== undefined && (
            <StatRow
              label="Accuracy"
              value={`${Math.round(result.accuracy)}%`}
              delay={0.3}
            />
          )}
          {result.completionTime !== undefined && (
            <StatRow
              label="Time"
              value={`${(result.completionTime / 1000).toFixed(1)}s`}
              delay={0.4}
            />
          )}
          <StatRow
            label="Personal Best"
            value={
              isNewBest
                ? result.score.toLocaleString()
                : personalBest.toLocaleString()
            }
            delay={0.5}
            highlight={isNewBest}
          />
          {result.metadata?.maxCombo !== undefined && (
            <StatRow
              label="Max Combo"
              value={`${result.metadata.maxCombo}x`}
              delay={0.6}
            />
          )}
          {result.metadata?.avgReactionTime !== undefined && (
            <StatRow
              label="Avg Reaction"
              value={`${Math.round(result.metadata.avgReactionTime as number)}ms`}
              delay={0.7}
            />
          )}
          {result.metadata?.bestReactionTime !== undefined && (
            <StatRow
              label="Best Reaction"
              value={`${Math.round(result.metadata.bestReactionTime as number)}ms`}
              delay={0.8}
            />
          )}
          {xpEarned !== undefined && xpEarned > 0 && (
            <StatRow
              label="XP Earned"
              value={`+${xpEarned}`}
              delay={0.9}
              highlight
            />
          )}
          {children}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onViewLeaderboard || (() => {
              if (typeof window !== 'undefined') {
                window.location.href = gameSlug ? `/ranked?game=${gameSlug}` : '/ranked'
              }
            })}
            className="flex-1 rounded-xl bg-[#181D30] py-3 font-semibold text-[#F8FAFC]/70 transition-colors hover:bg-[#1e2440]"
          >
            Leaderboard
          </button>
          <button
            onClick={onPlayAgain}
            className="flex-1 rounded-xl bg-[#8B5CF6] py-3 font-semibold text-white transition-colors hover:bg-[#7C3AED]"
          >
            Play Again
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function StatRow({
  label,
  value,
  delay = 0,
  highlight = false,
}: {
  label: string
  value: string
  delay?: number
  highlight?: boolean
}) {
  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay }}
      className="flex items-center justify-between rounded-lg bg-[#090B14] p-3"
    >
      <span className="text-sm text-[#F8FAFC]/50">{label}</span>
      <span
        className={`font-bold tabular-nums ${
          highlight ? 'text-[#22C55E]' : 'text-[#F8FAFC]'
        }`}
      >
        {value}
      </span>
    </motion.div>
  )
}
