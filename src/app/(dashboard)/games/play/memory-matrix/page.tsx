'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { GameWrapper } from '@/games/core/game-wrapper'
import MemoryMatrix from '@/games/memory-matrix'
import type { GameDefinition, GameResult } from '@/types/game'
import { useGameStore } from '@/stores/game-store'
import { createClient } from '@/lib/supabase/client'

const GAME_DEFINITION: GameDefinition = {
  id: 'memory-matrix',
  name: 'Memory Matrix',
  slug: 'memory-matrix',
  description: 'Memorize the sequence of glowing tiles and reproduce it. How far can you go?',
  category: 'Memory',
  difficulty: 'Medium',
  defaultDuration: 120,
  instructions: [
    'Watch the tiles light up in sequence -- memorize the order!',
    'After the sequence plays, tap the tiles in the same order.',
    'Each level adds more tiles and the grid grows larger.',
    'You have 3 lives -- a wrong tap costs one life.',
    'Score multiplies with consecutive perfect levels (up to 3x combo).',
    'Complete as many levels as you can in 120 seconds!',
  ],
}

export default function MemoryMatrixPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[100dvh] items-center justify-center bg-[#090B14]"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[#8B5CF6] border-t-transparent" /></div>}>
      <MemoryMatrixInner />
    </Suspense>
  )
}

function MemoryMatrixInner() {
  const searchParams = useSearchParams()
  const challengeId = searchParams.get('challengeId') ?? undefined
  const { setPersonalBest } = useGameStore()
  const [personalBest, setLocalPersonalBest] = useState(0)

  useEffect(() => {
    async function fetchPersonalBest() {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) return

        const { data } = await supabase
          .from('game_sessions')
          .select('score')
          .eq('user_id', user.id)
          .eq('game_id', GAME_DEFINITION.id)
          .order('score', { ascending: false })
          .limit(1)
          .single()

        if (data?.score) {
          setPersonalBest(data.score)
          setLocalPersonalBest(data.score)
        }
      } catch {
        // No personal best yet or not logged in
      }
    }
    fetchPersonalBest()
  }, [setPersonalBest])

  const handleGameEnd = (result: GameResult) => {
    // The wrapper handles score submission and personal best updates
  }

  return (
    <GameWrapper
      gameDefinition={GAME_DEFINITION}
      personalBest={personalBest}
      challengeId={challengeId}
      onGameEnd={handleGameEnd}
    >
      {({ config, callbacks, isActive }) => (
        <MemoryMatrix config={config} callbacks={callbacks} isActive={isActive} />
      )}
    </GameWrapper>
  )
}
