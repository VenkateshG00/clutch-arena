'use client'

import { useEffect, useState } from 'react'
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
    >
      {({ config, callbacks, isActive }) => (
        <TypeClash config={config} callbacks={callbacks} />
      )}
    </GameWrapper>
  )
}
