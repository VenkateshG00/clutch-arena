'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { GameWrapper } from '@/games/core/game-wrapper'
import TypeClash from '@/games/typeclash'
import type { GameDefinition } from '@/types/game'
import { useGameStore } from '@/stores/game-store'
import { createClient } from '@/lib/supabase/client'

const GAME_DEFINITION: GameDefinition = {
  id: 'typeclash',
  name: 'TypeClash',
  slug: 'typeclash',
  description: 'Race against the clock to type sentences with speed and precision. Every keystroke counts!',
  category: 'Speed',
  difficulty: 'Medium',
  defaultDuration: 60,
  instructions: [
    'Type the displayed sentence as fast and accurately as you can.',
    'Characters turn green when correct and red when wrong.',
    'After completing a sentence, the next one appears automatically.',
    'Your score depends on WPM, accuracy, and perfect sentences.',
    'The timer starts when you begin typing. You have 60 seconds!',
  ],
}

export default function TypeClashPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[100dvh] items-center justify-center bg-[#090B14]"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[#8B5CF6] border-t-transparent" /></div>}>
      <TypeClashInner />
    </Suspense>
  )
}

function TypeClashInner() {
  const searchParams = useSearchParams()
  const challengeId = searchParams.get('challengeId') ?? undefined
  const { setPersonalBest } = useGameStore()
  const [personalBest, setLocalPB] = useState(0)

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
          .eq('game_id', 'typeclash')
          .order('score', { ascending: false })
          .limit(1)
          .single()

        if (data?.score) {
          setLocalPB(data.score)
          setPersonalBest(data.score)
        }
      } catch {
        // No personal best yet or not logged in
      }
    }
    fetchPersonalBest()
  }, [setPersonalBest])

  return (
    <GameWrapper
      gameDefinition={GAME_DEFINITION}
      personalBest={personalBest}
      challengeId={challengeId}
    >
      {({ config, callbacks, isActive }) => (
        <TypeClash config={config} callbacks={callbacks} />
      )}
    </GameWrapper>
  )
}
