'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/* ------------------------------------------------------------------ */
/*  Dot patterns for each dice face (1-6)                              */
/*  Positions in a 60x60 coordinate space (centered in 80x80 die)     */
/* ------------------------------------------------------------------ */

const DOT_R = 5.5

const DOT_PATTERNS: Record<number, Array<[number, number]>> = {
  1: [[30, 30]],
  2: [
    [15, 15],
    [45, 45],
  ],
  3: [
    [15, 15],
    [30, 30],
    [45, 45],
  ],
  4: [
    [15, 15],
    [45, 15],
    [15, 45],
    [45, 45],
  ],
  5: [
    [15, 15],
    [45, 15],
    [30, 30],
    [15, 45],
    [45, 45],
  ],
  6: [
    [15, 15],
    [45, 15],
    [15, 30],
    [45, 30],
    [15, 45],
    [45, 45],
  ],
}

/** Render the dots for a given face value */
const DiceFace: React.FC<{ value: number; dotColor?: string }> = React.memo(
  ({ value, dotColor = '#1a1a2e' }) => {
    const dots = DOT_PATTERNS[value] || DOT_PATTERNS[1]
    return (
      <svg
        viewBox="0 0 60 60"
        width={48}
        height={48}
        style={{ display: 'block', margin: 'auto' }}
      >
        {dots.map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r={DOT_R} fill={dotColor} />
        ))}
      </svg>
    )
  },
)
DiceFace.displayName = 'DiceFace'

/* ------------------------------------------------------------------ */
/*  Star burst particles for rolling a 6                               */
/* ------------------------------------------------------------------ */

const PARTICLE_COUNT = 8

const StarBurst: React.FC = () => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      overflow: 'visible',
    }}
  >
    {Array.from({ length: PARTICLE_COUNT }).map((_, i) => {
      const angle = (360 / PARTICLE_COUNT) * i
      const rad = (angle * Math.PI) / 180
      const dist = 50
      return (
        <motion.div
          key={i}
          initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
          animate={{
            opacity: 0,
            x: Math.cos(rad) * dist,
            y: Math.sin(rad) * dist,
            scale: 0.3,
          }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: 8,
            height: 8,
            marginLeft: -4,
            marginTop: -4,
            borderRadius: '50%',
            background: '#ffd700',
          }}
        />
      )
    })}
  </div>
)

/* ------------------------------------------------------------------ */
/*  Main Dice Component                                                */
/* ------------------------------------------------------------------ */

interface DiceProps {
  /** Current dice value (1-6), null if not rolled yet */
  value: number | null
  /** Whether the dice is currently rolling */
  rolling?: boolean
  /** Whether the player can roll right now */
  canRoll: boolean
  /** Handler for roll action */
  onRoll: () => void
  /** Whether interaction is disabled */
  disabled?: boolean
}

const LudoDice: React.FC<DiceProps> = ({
  value,
  rolling = false,
  canRoll,
  onRoll,
  disabled = false,
}) => {
  const [displayValue, setDisplayValue] = useState<number>(value ?? 1)
  const [showCelebration, setShowCelebration] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Cycle through random faces while rolling
  useEffect(() => {
    if (rolling) {
      setShowCelebration(false)
      intervalRef.current = setInterval(() => {
        setDisplayValue(Math.floor(Math.random() * 6) + 1)
      }, 80)
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current)
      }
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      if (value !== null) {
        setDisplayValue(value)
        // Celebrate on a 6
        if (value === 6) {
          setShowCelebration(true)
          const timer = setTimeout(() => setShowCelebration(false), 1500)
          return () => clearTimeout(timer)
        }
      }
    }
  }, [rolling, value])

  const handleClick = useCallback(() => {
    if (canRoll && !disabled && !rolling) {
      onRoll()
    }
  }, [canRoll, disabled, rolling, onRoll])

  const isClickable = canRoll && !disabled && !rolling
  const isSix = !rolling && value === 6

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        userSelect: 'none',
      }}
    >
      <div style={{ position: 'relative' }}>
        {/* Golden glow behind dice for a 6 */}
        <AnimatePresence>
          {isSix && showCelebration && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 0.6, scale: 1.3 }}
              exit={{ opacity: 0, scale: 1.5 }}
              transition={{ duration: 0.4 }}
              style={{
                position: 'absolute',
                inset: -12,
                borderRadius: 20,
                background:
                  'radial-gradient(circle, rgba(255,215,0,0.5) 0%, transparent 70%)',
                pointerEvents: 'none',
              }}
            />
          )}
        </AnimatePresence>

        {/* Star burst particles */}
        <AnimatePresence>
          {isSix && showCelebration && <StarBurst />}
        </AnimatePresence>

        {/* The dice itself */}
        <motion.button
          onClick={handleClick}
          whileHover={isClickable ? { scale: 1.1 } : undefined}
          whileTap={isClickable ? { scale: 0.92 } : undefined}
          animate={
            rolling
              ? {
                  rotate: [0, 15, -15, 10, -10, 0],
                  transition: {
                    duration: 0.4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  },
                }
              : { rotate: 0 }
          }
          style={{
            position: 'relative',
            width: 80,
            height: 80,
            borderRadius: 14,
            border: `3px solid ${
              canRoll && !disabled ? '#f5c542' : '#555'
            }`,
            background: '#ffffff',
            boxShadow: isSix && showCelebration
              ? '0 0 20px rgba(255,215,0,0.6), 0 4px 12px rgba(0,0,0,0.25)'
              : '0 4px 12px rgba(0,0,0,0.25)',
            cursor: isClickable ? 'pointer' : 'default',
            outline: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            transition: 'border-color 0.2s, box-shadow 0.3s',
          }}
          disabled={!isClickable}
          aria-label={
            isClickable
              ? 'Roll dice'
              : rolling
                ? 'Rolling...'
                : `Dice showing ${value ?? 'nothing'}`
          }
        >
          <DiceFace value={displayValue} />
        </motion.button>

        {/* "EXTRA TURN!" text for a 6 */}
        <AnimatePresence>
          {isSix && showCelebration && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: -28, scale: 1 }}
              exit={{ opacity: 0, y: -40, scale: 0.6 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              style={{
                position: 'absolute',
                top: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                whiteSpace: 'nowrap',
                fontSize: 13,
                fontWeight: 800,
                color: '#ffd700',
                textShadow: '0 1px 4px rgba(0,0,0,0.5)',
                pointerEvents: 'none',
                letterSpacing: 0.5,
              }}
            >
              EXTRA TURN!
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* "Tap to roll" hint */}
      <AnimatePresence>
        {canRoll && !disabled && !rolling && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: '#f5c542',
              letterSpacing: 0.3,
            }}
          >
            Tap to roll
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  )
}

export default React.memo(LudoDice)
export type { DiceProps }
