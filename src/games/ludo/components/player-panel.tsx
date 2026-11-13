'use client'

import React from 'react'
import type { Player, PlayerColor } from '../engine/types'
import { COLOR_HEX } from '../engine/constants'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface PlayerPanelProps {
  players: Player[]
  activePlayerIndex: number
  myPlayerId: string | null
  aiPlayerIds?: Set<string>
}

/* ------------------------------------------------------------------ */
/*  Token progress dots                                                */
/* ------------------------------------------------------------------ */

const TokenDots: React.FC<{ player: Player }> = React.memo(({ player }) => {
  const hex = COLOR_HEX[player.color]
  return (
    <div style={{ display: 'flex', gap: 4, marginTop: 2 }}>
      {player.tokens.map((token) => {
        const isFinished = token.status === 'finished'
        return (
          <div
            key={token.id}
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: isFinished ? hex : 'transparent',
              border: `2px solid ${hex}`,
              opacity: isFinished ? 1 : 0.4,
              transition: 'all 0.3s ease',
            }}
          />
        )
      })}
    </div>
  )
})
TokenDots.displayName = 'TokenDots'

/* ------------------------------------------------------------------ */
/*  Single player row                                                  */
/* ------------------------------------------------------------------ */

const PlayerRow: React.FC<{
  player: Player
  isActive: boolean
  isMe: boolean
  isAI: boolean
}> = React.memo(({ player, isActive, isMe, isAI }) => {
  const hex = COLOR_HEX[player.color]
  const finishedCount = player.tokens.filter(
    (t) => t.status === 'finished',
  ).length

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '8px 12px',
        borderRadius: 10,
        background: isActive
          ? 'rgba(250, 204, 21, 0.08)'
          : 'rgba(255,255,255,0.03)',
        border: isActive
          ? '1.5px solid rgba(250, 204, 21, 0.4)'
          : '1.5px solid transparent',
        transition: 'all 0.3s ease',
      }}
    >
      {/* Color dot + active indicator */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <div
          style={{
            width: 14,
            height: 14,
            borderRadius: '50%',
            background: hex,
            boxShadow: isActive ? `0 0 8px ${hex}` : 'none',
          }}
        />
        {isActive && (
          <div
            style={{
              position: 'absolute',
              top: -3,
              right: -3,
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#facc15',
              animation: 'pulse-dot 1.2s ease-in-out infinite',
            }}
          />
        )}
      </div>

      {/* Name and badges */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span
            style={{
              fontSize: 13,
              fontWeight: isActive ? 700 : 500,
              color: isActive ? '#F8FAFC' : '#94A3B8',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              transition: 'color 0.2s',
            }}
          >
            {player.name}
          </span>
          {isMe && (
            <span
              style={{
                fontSize: 9,
                fontWeight: 700,
                color: '#111525',
                background: '#facc15',
                borderRadius: 4,
                padding: '1px 5px',
                letterSpacing: 0.5,
                textTransform: 'uppercase',
              }}
            >
              You
            </span>
          )}
          {isAI && (
            <span
              style={{
                fontSize: 9,
                fontWeight: 700,
                color: '#94A3B8',
                background: 'rgba(148, 163, 184, 0.15)',
                borderRadius: 4,
                padding: '1px 5px',
                letterSpacing: 0.5,
                textTransform: 'uppercase',
              }}
            >
              AI
            </span>
          )}
        </div>

        {/* Token progress dots */}
        <TokenDots player={player} />
      </div>

      {/* Finished count */}
      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: finishedCount > 0 ? '#F8FAFC' : '#64748B',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}
      >
        {finishedCount}/4
      </div>
    </div>
  )
})
PlayerRow.displayName = 'PlayerRow'

/* ------------------------------------------------------------------ */
/*  Main Panel                                                         */
/* ------------------------------------------------------------------ */

const PlayerPanel: React.FC<PlayerPanelProps> = ({
  players,
  activePlayerIndex,
  myPlayerId,
  aiPlayerIds,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        padding: '8px 0',
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: '#64748B',
          textTransform: 'uppercase',
          letterSpacing: 1,
          padding: '0 12px 4px',
        }}
      >
        Players
      </div>
      {players.map((player, idx) => (
        <PlayerRow
          key={player.id}
          player={player}
          isActive={idx === activePlayerIndex}
          isMe={player.id === myPlayerId}
          isAI={aiPlayerIds?.has(player.id) ?? false}
        />
      ))}

      {/* Pulse animation keyframes */}
      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.3); }
        }
      `}</style>
    </div>
  )
}

export default React.memo(PlayerPanel)
export type { PlayerPanelProps }
