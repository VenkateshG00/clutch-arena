'use client'

import { useState, useCallback, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { GameWrapper } from '@/games/core/game-wrapper'
import { ColorSnap } from '@/games/color-snap'
import { useGameSession } from '@/hooks/use-game-session'
import { GAMES } from '@/lib/constants'
import type { GameDefinition, GameResult } from '@/types/game'

const GAME_INFO = GAMES[0]

const COLOR_SNAP_DEFINITION: GameDefinition = {
  id: GAME_INFO.id,
  name: GAME_INFO.name,
  slug: GAME_INFO.slug,
  description: GAME_INFO.description,
  category: GAME_INFO.category,
  difficulty: GAME_INFO.difficulty,
  defaultDuration: GAME_INFO.duration,
  instructions: [...GAME_INFO.instructions],
}

export default function ColorSnapPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[100dvh] items-center justify-center bg-[#090B14]"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[#8B5CF6] border-t-transparent" /></div>}>
      <ColorSnapInner />
    </Suspense>
  )
}

function ColorSnapInner() {
  const searchParams = useSearchParams()
  const challengeId = searchParams.get('challengeId') ?? undefined
  const [personalBest, setPersonalBest] = useState(0)
  const [loading, setLoading] = useState(true)
  const { createSession } = useGameSession()

  useEffect(() => {
    async function init() {
      try {
        // Create game session
        await createSession(GAME_INFO.id, challengeId)

        // Fetch personal best
        const res = await fetch('/api/scores?gameId=color-snap&best=true')
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

  const handleGameEnd = useCallback((result: GameResult) => {
    if (result.score > 0) {
      setPersonalBest((prev) => Math.max(prev, result.score))
    }
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-[#090B14]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#8B5CF6] border-t-transparent" />
      </div>
    )
  }

  return (
    <GameWrapper
      gameDefinition={COLOR_SNAP_DEFINITION}
      personalBest={personalBest}
      challengeId={challengeId}
      onGameEnd={handleGameEnd}
    >
      {({ config, callbacks, isActive }) => (
        <ColorSnap config={config} callbacks={callbacks} isActive={isActive} />
      )}
    </GameWrapper>
  )
}
