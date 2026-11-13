'use client'

import React, { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { GameState, PlayerColor } from '../engine/types'
import { COLOR_HEX } from '../engine/constants'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface WinnerOverlayProps {
  game: GameState
  winner: PlayerColor
  myPlayerId: string | null
  onPlayAgain: () => void
  onLeave: () => void
}

/* ------------------------------------------------------------------ */
/*  Fireworks effect                                                    */
/* ------------------------------------------------------------------ */

const BURST_COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#facc15', '#a855f7', '#ec4899']

interface FireworkBurst {
  id: number
  x: number
  y: number
  color: string
  delay: number
}

const Fireworks: React.FC = React.memo(() => {
  const bursts = useMemo<FireworkBurst[]>(
    () =>
      Array.from({ length: 6 }, (_, i) => ({
        id: i,
        x: 10 + Math.random() * 80,
        y: 10 + Math.random() * 60,
        color: BURST_COLORS[i % BURST_COLORS.length],
        delay: Math.random() * 1.5,
      })),
    [],
  )

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {bursts.map((burst) => (
        <div
          key={burst.id}
          style={{
            position: 'absolute',
            left: `${burst.x}%`,
            top: `${burst.y}%`,
          }}
        >
          {Array.from({ length: 8 }, (_, j) => {
            const angle = (360 / 8) * j
            const rad = (angle * Math.PI) / 180
            const dist = 30 + Math.random() * 40
            return (
              <motion.div
                key={j}
                initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
                animate={{
                  opacity: [0, 1, 1, 0],
                  x: Math.cos(rad) * dist,
                  y: Math.sin(rad) * dist,
                  scale: [0, 1.2, 1, 0.3],
                }}
                transition={{
                  duration: 1.2,
                  delay: burst.delay,
                  repeat: Infinity,
                  repeatDelay: 2,
                  ease: 'easeOut',
                }}
                style={{
                  position: 'absolute',
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: burst.color,
                  boxShadow: `0 0 6px ${burst.color}`,
                }}
              />
            )
          })}
        </div>
      ))}
    </div>
  )
})
Fireworks.displayName = 'Fireworks'

/* ------------------------------------------------------------------ */
/*  Bouncing token circles                                             */
/* ------------------------------------------------------------------ */

const BouncingTokens: React.FC<{ color: PlayerColor }> = React.memo(
  ({ color }) => {
    const hex = COLOR_HEX[color]
    return (
      <div
        style={{
          display: 'flex',
          gap: 12,
          justifyContent: 'center',
          margin: '16px 0',
        }}
      >
        {Array.from({ length: 4 }, (_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -12, 0],
            }}
            transition={{
              duration: 0.6,
              delay: i * 0.15,
              repeat: Infinity,
              repeatDelay: 0.3,
              ease: 'easeInOut',
            }}
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: hex,
              border: '2px solid #ffffff',
              boxShadow: `0 2px 8px ${hex}55`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 700,
              color: '#ffffff',
            }}
          >
            {i + 1}
          </motion.div>
        ))}
      </div>
    )
  },
)
BouncingTokens.displayName = 'BouncingTokens'

/* ------------------------------------------------------------------ */
/*  Main overlay                                                       */
/* ------------------------------------------------------------------ */

const WinnerOverlay: React.FC<WinnerOverlayProps> = ({
  game,
  winner,
  myPlayerId,
  onPlayAgain,
  onLeave,
}) => {
  const winnerPlayer = game.players.find((p) => p.color === winner)
  const isMyWin = winnerPlayer?.id === myPlayerId
  const winnerHex = COLOR_HEX[winner]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(8px)',
        }}
      >
        {/* Fireworks */}
        <Fireworks />

        {/* Winner card */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{
            type: 'spring',
            stiffness: 200,
            damping: 18,
            delay: 0.2,
          }}
          style={{
            position: 'relative',
            background: '#111525',
            borderRadius: 20,
            padding: '32px 40px',
            maxWidth: 380,
            width: '90%',
            textAlign: 'center',
            border: `2px solid ${winnerHex}44`,
            boxShadow: `0 0 40px ${winnerHex}22, 0 20px 60px rgba(0,0,0,0.5)`,
          }}
        >
          {/* Color ring */}
          <div
            style={{
              position: 'absolute',
              top: -2,
              left: -2,
              right: -2,
              bottom: -2,
              borderRadius: 22,
              background: `linear-gradient(135deg, ${winnerHex}33, transparent 50%, ${winnerHex}22)`,
              pointerEvents: 'none',
            }}
          />

          {/* Trophy / crown */}
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 15,
              delay: 0.5,
            }}
            style={{ fontSize: 56, lineHeight: 1, marginBottom: 8 }}
          >
            {isMyWin ? '\u{1F3C6}' : '\u{1F451}'}
          </motion.div>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: '#F8FAFC',
              margin: '8px 0 4px',
              letterSpacing: -0.5,
            }}
          >
            {isMyWin ? 'CHAMPION!' : `${winnerPlayer?.name ?? winner} wins!`}
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            style={{
              fontSize: 14,
              color: '#94A3B8',
              margin: '0 0 12px',
            }}
          >
            {isMyWin
              ? 'All four tokens home. Well played!'
              : 'Better luck next time!'}
          </motion.p>

          {/* Bouncing tokens */}
          <BouncingTokens color={winner} />

          {/* Match summary */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 24,
              margin: '12px 0 20px',
              fontSize: 12,
              color: '#64748B',
            }}
          >
            <div>
              <span style={{ fontWeight: 700, color: '#94A3B8' }}>
                {game.turnNumber ?? '-'}
              </span>{' '}
              turns
            </div>
            <div>
              <span style={{ fontWeight: 700, color: '#94A3B8' }}>
                {game.players.length}
              </span>{' '}
              players
            </div>
          </motion.div>

          {/* Action buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            style={{
              display: 'flex',
              gap: 10,
              justifyContent: 'center',
            }}
          >
            <button
              onClick={onPlayAgain}
              style={{
                padding: '10px 24px',
                borderRadius: 10,
                border: 'none',
                background: winnerHex,
                color: '#ffffff',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: `0 4px 14px ${winnerHex}44`,
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              Play Again
            </button>
            <button
              onClick={onLeave}
              style={{
                padding: '10px 24px',
                borderRadius: 10,
                border: `1.5px solid ${winnerHex}44`,
                background: 'transparent',
                color: '#94A3B8',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'transform 0.15s, border-color 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)'
                e.currentTarget.style.borderColor = `${winnerHex}88`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.borderColor = `${winnerHex}44`
              }}
            >
              Leave
            </button>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default React.memo(WinnerOverlay)
export type { WinnerOverlayProps }
