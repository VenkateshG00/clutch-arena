'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { GameConfig, GameResult, GameCallbacks } from '@/types/game'

// ---------------------------------------------------------------------------
// Level configuration
// ---------------------------------------------------------------------------

interface LevelConfig {
  gridSize: number
  sequenceLength: number
  displayTime: number // ms per tile highlight
}

function getLevelConfig(level: number): LevelConfig {
  if (level <= 2) {
    return { gridSize: 3, sequenceLength: level + 2, displayTime: 800 }
  }
  if (level <= 4) {
    return { gridSize: 4, sequenceLength: level + 2, displayTime: 700 }
  }
  // Level 5+
  return {
    gridSize: 5,
    sequenceLength: Math.min(level + 2, 12),
    displayTime: Math.max(400, 700 - (level - 5) * 50),
  }
}

// ---------------------------------------------------------------------------
// Tile visual state
// ---------------------------------------------------------------------------

type TileVisual = 'idle' | 'highlight' | 'correct' | 'wrong'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface MemoryMatrixProps {
  config: GameConfig
  callbacks: GameCallbacks
  isActive: boolean
}

const MAX_LIVES = 3

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function MemoryMatrix({ config, callbacks, isActive }: MemoryMatrixProps) {
  // Game state
  const [level, setLevel] = useState(1)
  const [lives, setLives] = useState(MAX_LIVES)
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(1)

  // Phase: watching = sequence playback, input = player tapping, feedback = brief pause
  const [phase, setPhase] = useState<'watching' | 'input' | 'feedback' | 'level-transition'>('watching')
  const [phaseLabel, setPhaseLabel] = useState('Watch...')

  // Sequence & input tracking
  const [sequence, setSequence] = useState<number[]>([])
  const [playerIndex, setPlayerIndex] = useState(0)
  const [tileStates, setTileStates] = useState<Map<number, TileVisual>>(new Map())

  // Tracks whether a mistake was made in the current level attempt
  const levelMistakeRef = useRef(false)

  // Stats
  const statsRef = useRef({
    totalTaps: 0,
    correctTaps: 0,
    highestLevel: 1,
    longestSequence: 0,
    levelsCompleted: 0,
    maxCombo: 1,
    perfectRounds: 0,
  })

  // Timing refs
  const levelStartTimeRef = useRef(Date.now())
  const gameOverCalledRef = useRef(false)
  const sequenceTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([])
  const startedRef = useRef(false)

  // ---------------------------------------------------------------------------
  // Generate a random sequence for a level
  // ---------------------------------------------------------------------------
  const generateSequence = useCallback((lvl: number): number[] => {
    const cfg = getLevelConfig(lvl)
    const totalTiles = cfg.gridSize * cfg.gridSize
    const seq: number[] = []
    while (seq.length < cfg.sequenceLength) {
      const tile = Math.floor(Math.random() * totalTiles)
      // Avoid repeating the immediately previous tile for visual clarity
      if (seq.length === 0 || seq[seq.length - 1] !== tile) {
        seq.push(tile)
      }
    }
    return seq
  }, [])

  // ---------------------------------------------------------------------------
  // End the game
  // ---------------------------------------------------------------------------
  const endGame = useCallback(
    (reason: 'time' | 'lives') => {
      if (gameOverCalledRef.current) return
      gameOverCalledRef.current = true

      sequenceTimeoutsRef.current.forEach(clearTimeout)

      const stats = statsRef.current
      const accuracy = stats.totalTaps > 0 ? (stats.correctTaps / stats.totalTaps) * 100 : 0

      const result: GameResult = {
        score,
        accuracy,
        completionTime: config.duration ?? 120,
        metadata: {
          highestLevel: stats.highestLevel,
          longestSequence: stats.longestSequence,
          levelsCompleted: stats.levelsCompleted,
          maxCombo: stats.maxCombo,
          perfectRounds: stats.perfectRounds,
          endReason: reason,
        },
      }

      callbacks.onGameEnd(result)
    },
    [score, config.duration, callbacks],
  )

  // ---------------------------------------------------------------------------
  // Play the sequence animation for the current level
  // ---------------------------------------------------------------------------
  const playSequence = useCallback(
    (seq: number[], lvl: number) => {
      const cfg = getLevelConfig(lvl)
      setPhase('watching')
      setPhaseLabel('Watch...')
      setPlayerIndex(0)
      setTileStates(new Map())
      levelMistakeRef.current = false

      // Clear any pending sequence timeouts
      sequenceTimeoutsRef.current.forEach(clearTimeout)
      sequenceTimeoutsRef.current = []

      const startDelay = 500
      const gapTime = 200 // ms between tiles going dark and next tile lighting up

      seq.forEach((tile, i) => {
        // Light up tile
        const onTimeout = setTimeout(() => {
          setTileStates(new Map([[tile, 'highlight']]))
        }, startDelay + i * (cfg.displayTime + gapTime))
        sequenceTimeoutsRef.current.push(onTimeout)

        // Turn tile off
        const offTimeout = setTimeout(() => {
          setTileStates(new Map())
        }, startDelay + i * (cfg.displayTime + gapTime) + cfg.displayTime)
        sequenceTimeoutsRef.current.push(offTimeout)
      })

      // Switch to input phase
      const totalDuration = startDelay + seq.length * (cfg.displayTime + gapTime) + 300
      const inputTimeout = setTimeout(() => {
        setPhase('input')
        setPhaseLabel('Your turn!')
        setTileStates(new Map())
        levelStartTimeRef.current = Date.now()
      }, totalDuration)
      sequenceTimeoutsRef.current.push(inputTimeout)
    },
    [],
  )

  // ---------------------------------------------------------------------------
  // Start a new level
  // ---------------------------------------------------------------------------
  const startLevel = useCallback(
    (lvl: number) => {
      const seq = generateSequence(lvl)
      setSequence(seq)
      setLevel(lvl)
      playSequence(seq, lvl)
    },
    [generateSequence, playSequence],
  )

  // Start level 1 when the game becomes active
  useEffect(() => {
    if (isActive && !startedRef.current) {
      startedRef.current = true
      startLevel(1)
    }
  }, [isActive, startLevel])

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      sequenceTimeoutsRef.current.forEach(clearTimeout)
    }
  }, [])

  // ---------------------------------------------------------------------------
  // Handle tile click
  // ---------------------------------------------------------------------------
  const handleTileClick = useCallback(
    (tileIndex: number) => {
      if (phase !== 'input' || gameOverCalledRef.current || !isActive) return

      const stats = statsRef.current
      stats.totalTaps += 1

      const expectedTile = sequence[playerIndex]
      const isCorrect = tileIndex === expectedTile

      if (isCorrect) {
        stats.correctTaps += 1

        // Brief green flash
        setTileStates(new Map([[tileIndex, 'correct']]))
        setTimeout(() => {
          setTileStates((prev) => {
            const next = new Map(prev)
            if (next.get(tileIndex) === 'correct') next.delete(tileIndex)
            return next
          })
        }, 250)

        const nextIndex = playerIndex + 1

        if (nextIndex >= sequence.length) {
          // Level complete
          setPhase('feedback')

          const timeTaken = (Date.now() - levelStartTimeRef.current) / 1000
          const cfg = getLevelConfig(level)
          const basePoints = level * 100
          const speedBonus = Math.max(0, Math.round((cfg.sequenceLength * 2 - timeTaken) * 10))
          const hadNoMistakes = !levelMistakeRef.current
          const perfectBonus = hadNoMistakes ? 50 : 0
          const comboMultiplier = Math.min(combo, 3)
          const levelScore = (basePoints + speedBonus + perfectBonus) * comboMultiplier

          const newScore = score + levelScore
          const newCombo = combo + 1
          setScore(newScore)
          setCombo(newCombo)
          callbacks.onScoreUpdate(newScore)
          callbacks.onComboChange?.(newCombo)

          stats.levelsCompleted += 1
          stats.highestLevel = Math.max(stats.highestLevel, level)
          stats.longestSequence = Math.max(stats.longestSequence, sequence.length)
          stats.maxCombo = Math.max(stats.maxCombo, newCombo)
          if (hadNoMistakes) stats.perfectRounds += 1

          setPhaseLabel('Nice!')
          setTimeout(() => {
            setPhase('level-transition')
            setPhaseLabel(`Level ${level + 1}`)
            setTimeout(() => {
              startLevel(level + 1)
            }, 800)
          }, 600)
        } else {
          setPlayerIndex(nextIndex)
        }
      } else {
        // Wrong tile
        levelMistakeRef.current = true

        setTileStates(new Map([[tileIndex, 'wrong']]))
        setTimeout(() => {
          setTileStates((prev) => {
            const next = new Map(prev)
            if (next.get(tileIndex) === 'wrong') next.delete(tileIndex)
            return next
          })
        }, 400)

        // Reset combo on mistake
        setCombo(1)
        callbacks.onComboChange?.(1)

        const newLives = lives - 1
        setLives(newLives)

        if (newLives <= 0) {
          endGame('lives')
        } else {
          // Replay the same sequence
          setPhase('feedback')
          setPhaseLabel('Try again...')
          setTimeout(() => {
            playSequence(sequence, level)
          }, 1000)
        }
      }
    },
    [phase, isActive, sequence, playerIndex, level, score, combo, lives, callbacks, startLevel, playSequence, endGame],
  )

  // ---------------------------------------------------------------------------
  // Derived
  // ---------------------------------------------------------------------------
  const cfg = getLevelConfig(level)
  const gridSize = cfg.gridSize
  const totalTiles = gridSize * gridSize

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="flex w-full flex-col items-center select-none">
      {/* Game-specific info bar: level, lives, phase */}
      <div className="mb-4 flex w-full items-center justify-between">
        {/* Level + Lives */}
        <div className="flex items-center gap-4">
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-[#F8FAFC]/40">Level</span>
            <div className="text-xl font-bold text-[#3B82F6]">{level}</div>
          </div>
          <div className="flex gap-1">
            {Array.from({ length: MAX_LIVES }).map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  scale: i < lives ? 1 : 0.6,
                  opacity: i < lives ? 1 : 0.2,
                }}
                className="h-5 w-5 rounded-full"
                style={{
                  backgroundColor: i < lives ? '#EF4444' : '#181D30',
                  boxShadow: i < lives ? '0 0 8px rgba(239, 68, 68, 0.4)' : 'none',
                }}
              />
            ))}
          </div>
        </div>

        {/* Phase label */}
        <AnimatePresence mode="wait">
          <motion.div
            key={phaseLabel}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
          >
            <span
              className="rounded-full px-4 py-1.5 text-sm font-bold"
              style={{
                color: phase === 'input' ? '#22C55E' : '#8B5CF6',
                backgroundColor:
                  phase === 'input'
                    ? 'rgba(34, 197, 94, 0.12)'
                    : 'rgba(139, 92, 246, 0.12)',
              }}
            >
              {phaseLabel}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Sequence progress dots during input */}
      {phase === 'input' && (
        <div className="mb-4 flex gap-1.5">
          {sequence.map((_, i) => (
            <motion.div
              key={i}
              initial={i === playerIndex ? { scale: 0.8 } : false}
              animate={{ scale: 1 }}
              className="h-2.5 w-2.5 rounded-full transition-colors duration-200"
              style={{
                backgroundColor:
                  i < playerIndex
                    ? '#22C55E'
                    : i === playerIndex
                      ? '#8B5CF6'
                      : '#181D30',
                boxShadow:
                  i === playerIndex
                    ? '0 0 6px rgba(139, 92, 246, 0.5)'
                    : 'none',
              }}
            />
          ))}
        </div>
      )}

      {/* Grid */}
      <div
        className="grid w-full gap-2 sm:gap-3"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          aspectRatio: '1',
          maxWidth: `${Math.min(420, gridSize * 84)}px`,
        }}
      >
        {Array.from({ length: totalTiles }).map((_, i) => {
          const visual = tileStates.get(i) ?? 'idle'
          return (
            <MemoryTile
              key={`${gridSize}-${i}`}
              index={i}
              visual={visual}
              interactive={phase === 'input' && isActive}
              onClick={handleTileClick}
            />
          )
        })}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Individual tile component
// ---------------------------------------------------------------------------

interface MemoryTileProps {
  index: number
  visual: TileVisual
  interactive: boolean
  onClick: (index: number) => void
}

function MemoryTile({ index, visual, interactive, onClick }: MemoryTileProps) {
  const isHighlight = visual === 'highlight'
  const isCorrect = visual === 'correct'
  const isWrong = visual === 'wrong'

  const bgColor = isHighlight
    ? '#8B5CF6'
    : isCorrect
      ? '#22C55E'
      : isWrong
        ? '#EF4444'
        : '#181D30'

  const glowShadow = isHighlight
    ? '0 0 20px rgba(139, 92, 246, 0.6), 0 0 40px rgba(139, 92, 246, 0.25), inset 0 0 12px rgba(139, 92, 246, 0.15)'
    : isCorrect
      ? '0 0 16px rgba(34, 197, 94, 0.5), 0 0 32px rgba(34, 197, 94, 0.2)'
      : isWrong
        ? '0 0 16px rgba(239, 68, 68, 0.5), 0 0 32px rgba(239, 68, 68, 0.2)'
        : 'none'

  const borderColor = isHighlight
    ? 'rgba(139, 92, 246, 0.6)'
    : isCorrect
      ? 'rgba(34, 197, 94, 0.5)'
      : isWrong
        ? 'rgba(239, 68, 68, 0.5)'
        : 'rgba(255, 255, 255, 0.06)'

  return (
    <motion.button
      onClick={() => interactive && onClick(index)}
      disabled={!interactive}
      animate={
        isWrong
          ? {
              backgroundColor: bgColor,
              boxShadow: glowShadow,
              borderColor,
              x: [0, -6, 6, -4, 4, 0],
            }
          : {
              backgroundColor: bgColor,
              boxShadow: glowShadow,
              borderColor,
              scale: isHighlight ? 1.06 : 1,
            }
      }
      whileTap={interactive ? { scale: 0.92 } : undefined}
      whileHover={interactive ? { backgroundColor: '#1e2440' } : undefined}
      transition={{
        duration: isWrong ? 0.4 : 0.2,
        ease: 'easeOut',
      }}
      className="aspect-square min-h-[50px] cursor-pointer rounded-xl border-2 disabled:cursor-default"
      style={{ WebkitTapHighlightColor: 'transparent' }}
    />
  )
}
