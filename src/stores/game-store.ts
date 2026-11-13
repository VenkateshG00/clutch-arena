'use client'

import { create } from 'zustand'
import type { GameState, GameResult } from '@/types/game'

interface GameStoreState {
  currentGame: string | null
  gameState: GameState
  score: number
  combo: number
  timeRemaining: number
  sessionId: string | null
  result: GameResult | null
  personalBest: number
  setCurrentGame: (gameId: string | null) => void
  setGameState: (state: GameState) => void
  setScore: (score: number) => void
  setCombo: (combo: number) => void
  setTimeRemaining: (time: number) => void
  setSessionId: (id: string | null) => void
  setResult: (result: GameResult | null) => void
  setPersonalBest: (score: number) => void
  reset: () => void
}

export const useGameStore = create<GameStoreState>((set) => ({
  currentGame: null,
  gameState: 'idle',
  score: 0,
  combo: 0,
  timeRemaining: 0,
  sessionId: null,
  result: null,
  personalBest: 0,
  setCurrentGame: (gameId) => set({ currentGame: gameId }),
  setGameState: (gameState) => set({ gameState }),
  setScore: (score) => set({ score }),
  setCombo: (combo) => set({ combo }),
  setTimeRemaining: (timeRemaining) => set({ timeRemaining }),
  setSessionId: (sessionId) => set({ sessionId }),
  setResult: (result) => set({ result }),
  setPersonalBest: (personalBest) => set({ personalBest }),
  reset: () => set({
    currentGame: null,
    gameState: 'idle',
    score: 0,
    combo: 0,
    timeRemaining: 0,
    sessionId: null,
    result: null,
    personalBest: 0,
  }),
}))
