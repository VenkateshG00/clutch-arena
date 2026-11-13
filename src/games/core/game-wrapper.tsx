'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/stores/game-store'
import type {
  GameDefinition,
  GameResult,
  GameConfig,
  GameCallbacks,
} from '@/types/game'
import { Countdown } from './countdown'
import { GameHUD } from './game-hud'
import { GameOver } from './game-over'

type WrapperPhase = 'info' | 'countdown' | 'playing' | 'finished'

interface GameWrapperProps {
  gameDefinition: GameDefinition
  personalBest: number
  challengeId?: string
  onGameEnd?: (result: GameResult) => void
  children: (props: {
    config: GameConfig
    callbacks: GameCallbacks
    isActive: boolean
  }) => React.ReactNode
}

export function GameWrapper({
  gameDefinition,
  personalBest: initialPersonalBest,
  challengeId,
  onGameEnd,
  children,
}: GameWrapperProps) {
  const [phase, setPhase] = useState<WrapperPhase>('info')
  const [submitting, setSubmitting] = useState(false)
  const startTimeRef = useRef<number>(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const store = useGameStore()

  // Initialize store on mount
  useEffect(() => {
    store.setCurrentGame(gameDefinition.id)
    store.setPersonalBest(initialPersonalBest)
    store.setTimeRemaining(gameDefinition.defaultDuration)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      store.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleStart = useCallback(async () => {
    store.setScore(0)
    store.setCombo(0)
    store.setResult(null)
    store.setTimeRemaining(gameDefinition.defaultDuration)
    store.setGameState('countdown')
    setPhase('countdown')

    // Create a session if one doesn't exist
    if (!store.sessionId) {
      try {
        const res = await fetch('/api/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gameId: gameDefinition.id,
            challengeId: challengeId ?? undefined,
          }),
        })
        if (res.ok) {
          const { data } = await res.json()
          store.setSessionId(data.id)
        }
      } catch {
        // Non-critical — game still works
      }
    }
  }, [store, gameDefinition.defaultDuration, gameDefinition.id, challengeId])

  const handleCountdownComplete = useCallback(() => {
    startTimeRef.current = Date.now()
    store.setGameState('playing')
    setPhase('playing')

    // Start the master timer
    timerRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000
      const remaining = Math.max(0, gameDefinition.defaultDuration - elapsed)
      store.setTimeRemaining(remaining)

      if (remaining <= 0) {
        if (timerRef.current) clearInterval(timerRef.current)
      }
    }, 50) // ~20fps for smooth progress bar
  }, [store, gameDefinition.defaultDuration])

  const handleScoreUpdate = useCallback(
    (score: number) => {
      store.setScore(score)
    },
    [store]
  )

  const handleComboChange = useCallback(
    (combo: number) => {
      store.setCombo(combo)
    },
    [store]
  )

  const handleGameEnd = useCallback(
    async (result: GameResult) => {
      if (timerRef.current) clearInterval(timerRef.current)
      store.setGameState('finished')
      store.setResult(result)
      setPhase('finished')

      // Update personal best locally
      if (result.score > store.personalBest) {
        store.setPersonalBest(result.score)
      }

      // Submit score to API
      setSubmitting(true)
      try {
        await fetch('/api/scores', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gameId: gameDefinition.id,
            sessionId: store.sessionId,
            score: result.score,
            accuracy: result.accuracy,
            completionTime: result.completionTime,
            metadata: result.metadata,
          }),
        })
      } catch {
        // Score submission failure is non-critical
      } finally {
        setSubmitting(false)
      }

      onGameEnd?.(result)
    },
    [store, gameDefinition.id, onGameEnd]
  )

  const handleTimeUpdate = useCallback(
    (time: number) => {
      store.setTimeRemaining(time)
    },
    [store]
  )

  const handlePlayAgain = useCallback(() => {
    store.setScore(0)
    store.setCombo(0)
    store.setResult(null)
    store.setTimeRemaining(gameDefinition.defaultDuration)
    setPhase('countdown')
    store.setGameState('countdown')
  }, [store, gameDefinition.defaultDuration])

  const handleViewLeaderboard = useCallback(() => {
    window.location.href = '/leaderboard'
  }, [])

  const config: GameConfig = {
    id: gameDefinition.id,
    duration: gameDefinition.defaultDuration,
  }

  const callbacks: GameCallbacks = {
    onScoreUpdate: handleScoreUpdate,
    onGameEnd: handleGameEnd,
    onComboChange: handleComboChange,
    onTimeUpdate: handleTimeUpdate,
  }

  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center bg-[#090B14]">
      <AnimatePresence mode="wait">
        {/* Info / Instructions Screen */}
        {phase === 'info' && (
          <motion.div
            key="info"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-1 flex-col items-center justify-center p-6 text-center"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="w-full max-w-md"
            >
              <div className="mb-2 inline-block rounded-full bg-[#8B5CF6]/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#8B5CF6]">
                {gameDefinition.category}
              </div>

              <h1 className="mb-2 text-4xl font-black text-[#F8FAFC] md:text-5xl">
                {gameDefinition.name}
              </h1>
              <p className="mb-8 text-[#F8FAFC]/60">
                {gameDefinition.description}
              </p>

              {/* Difficulty & Duration */}
              <div className="mb-8 flex items-center justify-center gap-4">
                <div className="rounded-lg bg-[#111525] px-3 py-2">
                  <span className="text-xs text-[#F8FAFC]/40">Difficulty</span>
                  <p className="font-bold capitalize text-[#F8FAFC]">
                    {gameDefinition.difficulty}
                  </p>
                </div>
                <div className="rounded-lg bg-[#111525] px-3 py-2">
                  <span className="text-xs text-[#F8FAFC]/40">Duration</span>
                  <p className="font-bold text-[#F8FAFC]">
                    {gameDefinition.defaultDuration}s
                  </p>
                </div>
                {initialPersonalBest > 0 && (
                  <div className="rounded-lg bg-[#111525] px-3 py-2">
                    <span className="text-xs text-[#F8FAFC]/40">Best</span>
                    <p className="font-bold text-[#22C55E]">
                      {initialPersonalBest.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div className="mb-8 rounded-xl border border-[#F8FAFC]/5 bg-[#111525] p-4 text-left">
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-[#F8FAFC]/50">
                  How to Play
                </h3>
                <ul className="space-y-2">
                  {gameDefinition.instructions.map((instruction, i) => (
                    <li
                      key={i}
                      className="flex gap-2 text-sm text-[#F8FAFC]/70"
                    >
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#8B5CF6]/20 text-xs font-bold text-[#8B5CF6]">
                        {i + 1}
                      </span>
                      {instruction}
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={handleStart}
                className="w-full rounded-xl bg-[#8B5CF6] py-4 text-lg font-bold text-white shadow-[0_0_30px_rgba(139,92,246,0.3)] transition-all hover:bg-[#7C3AED] hover:shadow-[0_0_40px_rgba(139,92,246,0.5)] active:scale-[0.98]"
              >
                Start Game
              </button>
            </motion.div>
          </motion.div>
        )}

        {/* Countdown */}
        {phase === 'countdown' && (
          <Countdown key="countdown" onComplete={handleCountdownComplete} />
        )}

        {/* Playing */}
        {phase === 'playing' && (
          <motion.div
            key="playing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex w-full max-w-lg flex-1 flex-col p-4"
          >
            <GameHUD
              score={store.score}
              combo={store.combo}
              timeRemaining={store.timeRemaining}
              totalTime={gameDefinition.defaultDuration}
            />
            <div className="flex flex-1 items-center justify-center py-4">
              {children({ config, callbacks, isActive: true })}
            </div>
          </motion.div>
        )}

        {/* Game Over */}
        {phase === 'finished' && store.result && (
          <GameOver
            key="finished"
            result={store.result}
            personalBest={store.personalBest}
            onPlayAgain={handlePlayAgain}
            onViewLeaderboard={handleViewLeaderboard}
          />
        )}
      </AnimatePresence>

      {/* Score submission indicator */}
      {submitting && (
        <div className="fixed bottom-4 right-4 z-[60] rounded-lg bg-[#111525] px-4 py-2 text-sm text-[#F8FAFC]/60 shadow-lg">
          Saving score...
        </div>
      )}
    </div>
  )
}
