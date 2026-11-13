'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { GameConfig, GameCallbacks, GameResult } from '@/types/game'
import {
  generateRound,
  getCircleCount,
  type GameColor,
} from './colors'

interface ColorSnapProps {
  config: GameConfig
  callbacks: GameCallbacks
  isActive: boolean
}

interface RoundState {
  target: GameColor
  options: GameColor[]
  targetIndex: number
  roundNumber: number
}

/** Sound event callbacks for external sound integration */
export interface ColorSnapSoundEvents {
  onCorrect?: () => void
  onWrong?: () => void
  onCombo?: (combo: number) => void
  onGameEnd?: () => void
}

// Optional external sound handler
let soundEvents: ColorSnapSoundEvents = {}
export function setSoundEvents(events: ColorSnapSoundEvents) {
  soundEvents = events
}

const GAME_DURATION = 45
const BASE_POINTS = 100
const SPEED_BONUS_THRESHOLD = 500 // ms - under this gets speed bonus
const MAX_SPEED_MULTIPLIER = 2
const MAX_COMBO = 5
const WRONG_PENALTY = 50

export function ColorSnap({ config, callbacks, isActive }: ColorSnapProps) {
  const duration = config.duration ?? GAME_DURATION

  // Game state
  const [round, setRound] = useState<RoundState | null>(null)
  const [feedback, setFeedback] = useState<{
    type: 'correct' | 'wrong'
    index: number
  } | null>(null)
  const [difficulty, setDifficulty] = useState(0)

  // Tracking refs (don't cause re-renders)
  const scoreRef = useRef(0)
  const comboRef = useRef(0)
  const totalCorrectRef = useRef(0)
  const totalAttemptsRef = useRef(0)
  const reactionTimesRef = useRef<number[]>([])
  const maxComboRef = useRef(0)
  const roundStartRef = useRef(Date.now())
  const gameStartRef = useRef(Date.now())
  const isFinishedRef = useRef(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Generate a new round
  const nextRound = useCallback(
    (currentDifficulty: number, roundNum: number) => {
      const circleCount = getCircleCount(currentDifficulty)
      const data = generateRound(circleCount, currentDifficulty)
      setRound({
        ...data,
        roundNumber: roundNum,
      })
      roundStartRef.current = Date.now()
      setFeedback(null)
    },
    []
  )

  // Initialize game
  useEffect(() => {
    if (!isActive) return

    isFinishedRef.current = false
    scoreRef.current = 0
    comboRef.current = 0
    totalCorrectRef.current = 0
    totalAttemptsRef.current = 0
    reactionTimesRef.current = []
    maxComboRef.current = 0
    gameStartRef.current = Date.now()

    nextRound(0, 1)

    // Timer to check game end
    timerRef.current = setInterval(() => {
      const elapsed = (Date.now() - gameStartRef.current) / 1000
      if (elapsed >= duration && !isFinishedRef.current) {
        isFinishedRef.current = true
        if (timerRef.current) clearInterval(timerRef.current)
        finishGame()
      }
    }, 100)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, duration])

  const finishGame = useCallback(() => {
    const reactionTimes = reactionTimesRef.current
    const totalCorrect = totalCorrectRef.current
    const totalAttempts = totalAttemptsRef.current
    const accuracy = totalAttempts > 0 ? (totalCorrect / totalAttempts) * 100 : 0
    const avgReaction =
      reactionTimes.length > 0
        ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length
        : 0
    const bestReaction =
      reactionTimes.length > 0 ? Math.min(...reactionTimes) : 0

    const result: GameResult = {
      score: scoreRef.current,
      accuracy,
      completionTime: Date.now() - gameStartRef.current,
      metadata: {
        totalCorrect,
        totalAttempts,
        maxCombo: maxComboRef.current,
        avgReactionTime: avgReaction,
        bestReactionTime: bestReaction,
      },
    }

    soundEvents.onGameEnd?.()
    callbacks.onGameEnd(result)
  }, [callbacks])

  const handleTap = useCallback(
    (index: number) => {
      if (!round || feedback || isFinishedRef.current) return

      const reactionTime = Date.now() - roundStartRef.current
      totalAttemptsRef.current++

      if (index === round.targetIndex) {
        // Correct!
        reactionTimesRef.current.push(reactionTime)
        totalCorrectRef.current++

        // Combo
        comboRef.current = Math.min(comboRef.current + 1, MAX_COMBO)
        maxComboRef.current = Math.max(maxComboRef.current, comboRef.current)

        // Speed bonus: faster reaction = higher multiplier (up to 2x)
        const speedFactor = Math.max(
          1,
          MAX_SPEED_MULTIPLIER -
            (reactionTime / SPEED_BONUS_THRESHOLD) *
              (MAX_SPEED_MULTIPLIER - 1)
        )
        const comboMultiplier = comboRef.current
        const points = Math.round(BASE_POINTS * speedFactor * comboMultiplier)

        scoreRef.current += points
        callbacks.onScoreUpdate(scoreRef.current)
        callbacks.onComboChange?.(comboRef.current)

        soundEvents.onCorrect?.()
        if (comboRef.current > 1) soundEvents.onCombo?.(comboRef.current)

        setFeedback({ type: 'correct', index })

        // Increase difficulty gradually
        const newDifficulty = Math.min(1, difficulty + 0.03)
        setDifficulty(newDifficulty)

        // Quick transition to next round
        setTimeout(() => {
          if (!isFinishedRef.current) {
            nextRound(newDifficulty, round.roundNumber + 1)
          }
        }, 250)
      } else {
        // Wrong!
        comboRef.current = 0
        scoreRef.current = Math.max(0, scoreRef.current - WRONG_PENALTY)
        callbacks.onScoreUpdate(scoreRef.current)
        callbacks.onComboChange?.(0)

        soundEvents.onWrong?.()

        setFeedback({ type: 'wrong', index })

        setTimeout(() => {
          setFeedback(null)
        }, 400)
      }
    },
    [round, feedback, difficulty, callbacks, nextRound]
  )

  if (!round) return null

  const circleSize = round.options.length <= 4 ? 'w-24 h-24 md:w-28 md:h-28' : 'w-20 h-20 md:w-24 md:h-24'

  return (
    <div className="flex w-full flex-col items-center gap-8">
      {/* Target Color */}
      <div className="flex flex-col items-center gap-3">
        <span className="text-xs font-bold uppercase tracking-widest text-[#F8FAFC]/40">
          Find this color
        </span>
        <motion.div
          key={`target-${round.roundNumber}`}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="h-20 w-20 rounded-full shadow-lg md:h-24 md:w-24"
          style={{
            backgroundColor: round.target.css,
            boxShadow: `0 0 30px ${round.target.css}44`,
          }}
        />
        <span className="text-sm font-medium text-[#F8FAFC]/50">
          {round.target.label}
        </span>
      </div>

      {/* Options Grid */}
      <div
        className={`grid gap-4 ${
          round.options.length <= 4
            ? 'grid-cols-2'
            : round.options.length <= 6
            ? 'grid-cols-3'
            : 'grid-cols-3'
        }`}
      >
        <AnimatePresence mode="popLayout">
          {round.options.map((color, i) => {
            const isCorrectFeedback =
              feedback?.type === 'correct' && feedback.index === i
            const isWrongFeedback =
              feedback?.type === 'wrong' && feedback.index === i
            const showCorrectHint =
              feedback?.type === 'wrong' && i === round.targetIndex

            return (
              <motion.button
                key={`${round.roundNumber}-${i}`}
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: isCorrectFeedback ? 1.15 : isWrongFeedback ? 1 : 1,
                  opacity: 1,
                  x: isWrongFeedback
                    ? [0, -8, 8, -6, 6, -3, 3, 0]
                    : 0,
                }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{
                  scale: { type: 'spring', stiffness: 400, damping: 20 },
                  opacity: { duration: 0.15 },
                  x: isWrongFeedback
                    ? { duration: 0.4, ease: 'easeOut' }
                    : undefined,
                  delay: i * 0.05,
                }}
                onClick={() => handleTap(i)}
                disabled={!!feedback}
                className={`${circleSize} rounded-full transition-shadow active:scale-95 ${
                  feedback ? 'cursor-default' : 'cursor-pointer'
                }`}
                style={{
                  backgroundColor: color.css,
                  boxShadow: isCorrectFeedback
                    ? '0 0 25px rgba(34, 197, 94, 0.7), inset 0 0 20px rgba(255,255,255,0.2)'
                    : isWrongFeedback
                    ? '0 0 25px rgba(239, 68, 68, 0.7)'
                    : showCorrectHint
                    ? `0 0 20px ${color.css}88`
                    : `0 0 15px ${color.css}33`,
                  border: isCorrectFeedback
                    ? '3px solid #22C55E'
                    : isWrongFeedback
                    ? '3px solid #EF4444'
                    : showCorrectHint
                    ? '3px solid rgba(255,255,255,0.4)'
                    : '3px solid transparent',
                }}
              />
            )
          })}
        </AnimatePresence>
      </div>

      {/* Round indicator */}
      <div className="text-xs text-[#F8FAFC]/30">
        Round {round.roundNumber}
      </div>
    </div>
  )
}
