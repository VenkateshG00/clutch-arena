'use client'

import { useState, useCallback } from 'react'
import type { GameResult } from '@/types/game'

interface UseGameSessionReturn {
  sessionId: string | null
  isCreating: boolean
  isSubmitting: boolean
  error: string | null
  createSession: (gameId: string, challengeId?: string) => Promise<string | null>
  submitScore: (result: GameResult) => Promise<{ score: number; xpEarned: number; isPersonalBest: boolean } | null>
}

export function useGameSession(): UseGameSessionReturn {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createSession = useCallback(async (gameId: string, challengeId?: string) => {
    setIsCreating(true)
    setError(null)
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId, challengeId }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create session')
      }
      const { data } = await res.json()
      setSessionId(data.id)
      return data.id as string
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create session')
      return null
    } finally {
      setIsCreating(false)
    }
  }, [])

  const submitScore = useCallback(async (result: GameResult) => {
    if (!sessionId) {
      setError('No active session')
      return null
    }
    setIsSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          score: result.score,
          accuracy: result.accuracy,
          completionTime: result.completionTime,
          metadata: result.metadata,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to submit score')
      }
      const { data } = await res.json()
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit score')
      return null
    } finally {
      setIsSubmitting(false)
    }
  }, [sessionId])

  return { sessionId, isCreating, isSubmitting, error, createSession, submitScore }
}
