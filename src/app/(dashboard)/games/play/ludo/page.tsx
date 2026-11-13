'use client'

import { useState, useCallback, useEffect } from 'react'
import { LudoGame } from '@/games/ludo'
import { useGameSession } from '@/hooks/use-game-session'
import type { PlayerColor } from '@/games/ludo/engine/types'

type GamePhase = 'setup' | 'playing'

const INSTRUCTIONS = [
  'Roll a 6 to bring tokens out of base',
  'Move tokens clockwise around the board',
  'Land on opponent tokens to send them back',
  'Get all 4 tokens to the finish to win',
  'Rolling a 6 gives you an extra turn',
]

const PLAYER_COUNT_OPTIONS = [2, 3, 4] as const

export default function LudoPage() {
  const [phase, setPhase] = useState<GamePhase>('setup')
  const [playerCount, setPlayerCount] = useState<2 | 3 | 4>(4)
  const [playerName, setPlayerName] = useState('You')
  const [personalBest, setPersonalBest] = useState(0)
  const [loading, setLoading] = useState(true)
  const { createSession, submitScore } = useGameSession()

  useEffect(() => {
    async function init() {
      try {
        await createSession('ludo')

        const res = await fetch('/api/scores?gameId=ludo&best=true')
        if (res.ok) {
          const data = await res.json()
          setPersonalBest(data.bestScore ?? data.data?.bestScore ?? 0)
        }
      } catch {
        // Non-critical - game still works without session/personal best
      } finally {
        setLoading(false)
      }
    }

    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleStartGame = useCallback(() => {
    setPhase('playing')
  }, [])

  const handleGameEnd = useCallback(
    async (winner: PlayerColor, isPlayerWin: boolean) => {
      const score = isPlayerWin ? 1000 : 100
      setPersonalBest((prev) => Math.max(prev, score))

      try {
        await fetch('/api/scores', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gameId: 'ludo',
            score,
            accuracy: isPlayerWin ? 100 : 0,
            metadata: { winner, isPlayerWin },
          }),
        })
      } catch {
        // Score submission failed silently
      }
    },
    []
  )

  if (loading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-[#090B14]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#8B5CF6] border-t-transparent" />
      </div>
    )
  }

  if (phase === 'playing') {
    return (
      <LudoGame
        playerName={playerName}
        playerCount={playerCount}
        onGameEnd={handleGameEnd}
      />
    )
  }

  // Setup phase
  return (
    <div className="flex min-h-[100dvh] flex-col items-center bg-[#090B14] px-4 py-8">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex items-center justify-center rounded-xl bg-[#1A1D2E] px-4 py-2 text-2xl">
            🎲
          </div>
          <h1 className="mb-2 text-4xl font-bold tracking-tight text-white">
            LUDO
          </h1>
          <p className="text-sm leading-relaxed text-gray-400">
            The classic board game of strategy and luck. Race your tokens home
            before your opponents!
          </p>
        </div>

        {/* Personal Best */}
        {personalBest > 0 && (
          <div className="mb-6 rounded-xl border border-[#1E2035] bg-[#12141F] p-4 text-center">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
              Personal Best
            </p>
            <p className="mt-1 text-2xl font-bold text-[#8B5CF6]">
              {personalBest.toLocaleString()}
            </p>
          </div>
        )}

        {/* Player Count */}
        <div className="mb-6">
          <label className="mb-3 block text-sm font-medium text-gray-300">
            Number of Players
          </label>
          <div className="grid grid-cols-3 gap-3">
            {PLAYER_COUNT_OPTIONS.map((count) => (
              <button
                key={count}
                onClick={() => setPlayerCount(count)}
                className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-all ${
                  playerCount === count
                    ? 'border-[#8B5CF6] bg-[#8B5CF6]/15 text-[#8B5CF6]'
                    : 'border-[#1E2035] bg-[#12141F] text-gray-400 hover:border-[#2A2D45] hover:text-gray-300'
                }`}
              >
                {count} Players
              </button>
            ))}
          </div>
        </div>

        {/* Player Name */}
        <div className="mb-6">
          <label
            htmlFor="player-name"
            className="mb-3 block text-sm font-medium text-gray-300"
          >
            Your Name
          </label>
          <input
            id="player-name"
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value || 'You')}
            placeholder="You"
            maxLength={20}
            className="w-full rounded-xl border border-[#1E2035] bg-[#12141F] px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition-colors focus:border-[#8B5CF6]"
          />
        </div>

        {/* Instructions */}
        <div className="mb-8 rounded-xl border border-[#1E2035] bg-[#12141F] p-5">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">
            How to Play
          </h3>
          <ol className="space-y-2">
            {INSTRUCTIONS.map((instruction, i) => (
              <li key={i} className="flex gap-3 text-sm text-gray-400">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#8B5CF6]/15 text-xs font-bold text-[#8B5CF6]">
                  {i + 1}
                </span>
                <span className="leading-5">{instruction}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Start Button */}
        <button
          onClick={handleStartGame}
          className="w-full rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] px-6 py-4 text-base font-bold text-white shadow-lg shadow-[#8B5CF6]/20 transition-all hover:shadow-xl hover:shadow-[#8B5CF6]/30 active:scale-[0.98]"
        >
          Start Game
        </button>
      </div>
    </div>
  )
}
