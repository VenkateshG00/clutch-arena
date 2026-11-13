// ─── AI Opponent ────────────────────────────────────────────────────────
// Simple AI that picks moves from the legal moves list with basic strategy.
import type { GameState, LegalMove } from './engine/types'

/**
 * Pick the best move for the AI player from the current legal moves.
 * Priority order: finish > capture > enter home lane > exit base > random
 */
export function pickAIMove(state: GameState): LegalMove | null {
  const moves = state.legalMoves
  if (moves.length === 0) return null

  // Highest priority: finish a token (reach home)
  const finish = moves.find((m) => m.toStatus === 'finished')
  if (finish) return finish

  // Second: capture an opponent token
  const capture = moves.find((m) => m.captures.length > 0)
  if (capture) return capture

  // Third: enter home lane from track (safe progress)
  const enterHome = moves.find(
    (m) => m.toStatus === 'home_lane' && m.fromStatus === 'track',
  )
  if (enterHome) return enterHome

  // Fourth: exit base (get a new token on the board)
  const exitBase = moves.find((m) => m.fromStatus === 'base')
  if (exitBase) return exitBase

  // Fallback: pick a random legal move
  return moves[Math.floor(Math.random() * moves.length)]
}

/**
 * Returns a random delay in ms (300-800) before the AI executes,
 * so it feels like the AI is "thinking".
 */
export function getAIDelay(): number {
  return 300 + Math.random() * 500
}
