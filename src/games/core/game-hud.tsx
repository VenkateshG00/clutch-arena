'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { GameTimer } from './game-timer'

interface GameHUDProps {
  score: number
  combo: number
  timeRemaining: number
  totalTime: number
  extraInfo?: React.ReactNode
}

export function GameHUD({
  score,
  combo,
  timeRemaining,
  totalTime,
  extraInfo,
}: GameHUDProps) {
  return (
    <div className="w-full space-y-3">
      <GameTimer timeRemaining={timeRemaining} totalTime={totalTime} />

      <div className="flex items-center justify-between">
        {/* Score */}
        <div>
          <span className="text-xs font-medium uppercase tracking-wider text-[#F8FAFC]/40">
            Score
          </span>
          <AnimatePresence mode="popLayout">
            <motion.div
              key={score}
              initial={{ y: -8, opacity: 0, scale: 1.2 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              className="text-2xl font-bold tabular-nums text-[#F8FAFC]"
            >
              {score.toLocaleString()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Combo */}
        <AnimatePresence>
          {combo > 1 && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="flex items-center gap-1.5"
            >
              <motion.div
                key={combo}
                initial={{ scale: 1.6 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                className="rounded-lg border border-[#8B5CF6]/30 bg-[#8B5CF6]/15 px-3 py-1"
              >
                <span className="text-lg font-black text-[#8B5CF6]">
                  {combo}x
                </span>
              </motion.div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#8B5CF6]/70">
                Combo
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {extraInfo && (
          <div className="flex items-center gap-3">{extraInfo}</div>
        )}
      </div>
    </div>
  )
}
