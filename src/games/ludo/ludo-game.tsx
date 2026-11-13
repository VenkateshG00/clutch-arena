'use client'

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import type { GameState, PlayerColor, LegalMove } from './engine/types'
import { COLOR_HEX } from './engine/constants'
import {
  createInitialState,
  applyRoll,
  applyMove,
  canRoll as engineCanRoll,
  getActivePlayer,
} from './engine/rules'

import { detectAnimations } from './animations/detector'
import { useAnimationQueue } from './animations/use-animation-queue'
import { AnimationController } from './animations/animation-controller'

import LudoBoard from './components/board'
import LudoDice from './components/dice'
import PlayerPanel from './components/player-panel'
import WinnerOverlay from './components/winner-overlay'

import { pickAIMove, getAIDelay } from './ai'

interface LudoGameProps {
  playerName: string
  playerCount: 2 | 3 | 4
  onGameEnd?: (winner: PlayerColor, isPlayerWin: boolean) => void
}

const AI_NAMES = ['Bot Green', 'Bot Yellow', 'Bot Blue']
const MY_ID = 'human'

function rollDiceValue(): number {
  return Math.ceil(Math.random() * 6)
}

export function LudoGame({ playerName, playerCount, onGameEnd }: LudoGameProps) {
  const aiPlayerIds = useMemo(() => {
    const ids = new Set<string>()
    for (let i = 1; i < playerCount; i++) ids.add(`ai-${i}`)
    return ids
  }, [playerCount])

  const [game, setGame] = useState<GameState>(() => {
    const players = [{ id: MY_ID, name: playerName }]
    for (let i = 1; i < playerCount; i++) {
      players.push({ id: `ai-${i}`, name: AI_NAMES[i - 1] ?? `Bot ${i}` })
    }
    const state = createInitialState('local', players, { playerCount })
    // Start immediately
    return { ...state, phase: 'playing' as const }
  })

  const [rolling, setRolling] = useState(false)
  const [showWinner, setShowWinner] = useState(false)

  const prevGameRef = useRef<GameState>(game)
  const aiTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const animQueue = useAnimationQueue()
  const isAnimating = animQueue.current !== null

  const activePlayer = getActivePlayer(game)
  const isMyTurn = activePlayer?.id === MY_ID
  const playerCanRoll = engineCanRoll(game, MY_ID) && !rolling && !isAnimating

  const legalTokenIds = useMemo(() => {
    if (!isMyTurn || game.dice.used || game.dice.value === null) return new Set<string>()
    return new Set(game.legalMoves.map((m) => m.tokenId))
  }, [isMyTurn, game.dice.used, game.dice.value, game.legalMoves])

  // Detect animations on state change
  useEffect(() => {
    if (prevGameRef.current !== game) {
      const events = detectAnimations(prevGameRef.current, game, MY_ID)
      if (events.length > 0) {
        animQueue.enqueue(events)
      }
      prevGameRef.current = game
    }
  }, [game, animQueue])

  // Check for winner
  useEffect(() => {
    if (game.winner && !showWinner) {
      const timer = setTimeout(() => {
        setShowWinner(true)
        const isPlayerWin = game.players.find((p) => p.color === game.winner)?.id === MY_ID
        onGameEnd?.(game.winner!, isPlayerWin ?? false)
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [game.winner, showWinner, onGameEnd, game.players])

  // Human roll
  const handleRoll = useCallback(() => {
    if (!playerCanRoll) return

    setRolling(true)
    const value = rollDiceValue()

    setTimeout(() => {
      setRolling(false)
      setGame((prev) => applyRoll(prev, value))
    }, 500)
  }, [playerCanRoll])

  // Human move
  const handleTokenClick = useCallback(
    (tokenId: string) => {
      if (!isMyTurn || isAnimating || game.dice.used || game.dice.value === null) return
      if (!game.legalMoves.some((m) => m.tokenId === tokenId)) return

      setGame((prev) => applyMove(prev, tokenId))
    },
    [isMyTurn, isAnimating, game.dice.used, game.dice.value, game.legalMoves],
  )

  // AI turn logic
  useEffect(() => {
    if (isMyTurn || game.winner || game.phase !== 'playing') return
    if (!aiPlayerIds.has(activePlayer?.id ?? '')) return

    const aiId = activePlayer.id

    // Can the AI roll?
    if (engineCanRoll(game, aiId)) {
      if (isAnimating) return // wait for animations

      aiTimeoutRef.current = setTimeout(() => {
        const value = rollDiceValue()
        setGame((prev) => applyRoll(prev, value))
      }, getAIDelay())

      return () => {
        if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current)
      }
    }

    // Can the AI move?
    if (!game.dice.used && game.dice.value !== null && game.legalMoves.length > 0) {
      if (isAnimating) return

      aiTimeoutRef.current = setTimeout(() => {
        const move = pickAIMove(game)
        if (move) {
          setGame((prev) => applyMove(prev, move.tokenId))
        }
      }, getAIDelay())

      return () => {
        if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current)
      }
    }
  }, [game, isMyTurn, isAnimating, aiPlayerIds, activePlayer])

  // Play again
  const handlePlayAgain = useCallback(() => {
    setShowWinner(false)
    setRolling(false)
    animQueue.clear()

    const players = [{ id: MY_ID, name: playerName }]
    for (let i = 1; i < playerCount; i++) {
      players.push({ id: `ai-${i}`, name: AI_NAMES[i - 1] ?? `Bot ${i}` })
    }
    const newState = createInitialState('local', players, { playerCount })
    const playing = { ...newState, phase: 'playing' as const }
    prevGameRef.current = playing
    setGame(playing)
  }, [playerCount, playerName, animQueue])

  const handleLeave = useCallback(() => {
    window.history.back()
  }, [])

  // Turn indicator text
  const turnText = useMemo(() => {
    if (game.winner) return 'Game Over!'
    if (!activePlayer) return ''
    if (isMyTurn) {
      if (playerCanRoll) return 'Your turn! Roll the dice.'
      if (rolling) return 'Rolling...'
      if (legalTokenIds.size > 0) return 'Click a highlighted token to move.'
      return 'No moves available...'
    }
    return `${activePlayer.name} is thinking...`
  }, [game.winner, activePlayer, isMyTurn, playerCanRoll, rolling, legalTokenIds.size])

  const hintText = useMemo(() => {
    if (game.winner || !isMyTurn) return null
    if (playerCanRoll) return 'Click the dice to roll'
    if (legalTokenIds.size > 0) return 'Click a highlighted token to move'
    return null
  }, [game.winner, isMyTurn, playerCanRoll, legalTokenIds.size])

  return (
    <div
      id="game-root"
      className="flex min-h-[100dvh] flex-col lg:flex-row lg:flex-wrap items-center lg:items-start justify-center gap-4 lg:gap-6 bg-[#090B14] p-3 sm:p-4 text-[#F8FAFC]"
    >
      {/* Board */}
      <div className="w-full max-w-[min(580px,100%)] flex-shrink-0">
        <LudoBoard
          game={game}
          myPlayerId={MY_ID}
          onTokenClick={handleTokenClick}
          legalTokenIds={legalTokenIds}
          animationLayer={
            <AnimationController
              event={animQueue.current}
              onComplete={animQueue.onComplete}
            />
          }
        />

        <AnimatePresence>
          {isAnimating && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-2 flex justify-center"
            >
              <button
                onClick={animQueue.skip}
                className="rounded-lg border border-[#334155] bg-[#334155]/40 px-4 py-1 text-xs text-[#94A3B8] transition hover:bg-[#334155]/70"
              >
                Skip animation
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Side panel */}
      <div className="flex w-full max-w-[min(580px,100%)] lg:max-w-[280px] flex-col gap-3 lg:gap-4">
        {/* Turn indicator */}
        <div className="rounded-xl border border-[#1E293B] bg-[#111525] px-4 py-3">
          <div className="flex items-center gap-2">
            {activePlayer && (
              <div
                className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                style={{
                  background: COLOR_HEX[activePlayer.color],
                  boxShadow: `0 0 6px ${COLOR_HEX[activePlayer.color]}`,
                }}
              />
            )}
            <span
              className="text-sm font-semibold"
              style={{ color: isMyTurn ? '#facc15' : '#F8FAFC' }}
            >
              {turnText}
            </span>
          </div>
        </div>

        {/* Players */}
        <div className="rounded-xl border border-[#1E293B] bg-[#111525] py-1">
          <PlayerPanel
            players={game.players}
            activePlayerIndex={game.activePlayerIndex}
            myPlayerId={MY_ID}
            aiPlayerIds={aiPlayerIds}
          />
        </div>

        {/* Dice */}
        <div className="flex flex-col items-center gap-2 rounded-xl border border-[#1E293B] bg-[#111525] p-4">
          <LudoDice
            value={game.dice.value}
            rolling={rolling}
            canRoll={playerCanRoll && !game.winner}
            onRoll={handleRoll}
            disabled={!isMyTurn || isAnimating || !!game.winner}
          />
        </div>

        {/* Hint */}
        <AnimatePresence>
          {hintText && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 0.8, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center text-xs italic text-[#64748B]"
            >
              {hintText}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Turn counter */}
        <div className="text-center text-xs text-[#475569]">
          Turn {game.turnNumber + 1}
        </div>

        {/* Leave */}
        {!game.winner && (
          <button
            onClick={handleLeave}
            className="self-center rounded-lg border border-[#334155] bg-transparent px-4 py-2 text-xs font-medium text-[#64748B] transition hover:border-red-500 hover:text-red-500"
          >
            Leave Game
          </button>
        )}
      </div>

      {/* Winner overlay */}
      {showWinner && game.winner && (
        <WinnerOverlay
          game={game}
          winner={game.winner}
          myPlayerId={MY_ID}
          onPlayAgain={handlePlayAgain}
          onLeave={handleLeave}
        />
      )}
    </div>
  )
}

export default LudoGame
