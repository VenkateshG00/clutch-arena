'use client'

import React, { useMemo } from 'react'
import type { GameState, PlayerColor, Token } from '../engine/types'
import {
  SAFE_SQUARES,
  COLOR_HEX,
  COLOR_LIGHT,
} from '../engine/constants'
import {
  CELL,
  BOARD_SIZE,
  TRACK_GRID,
  HOME_LANE_GRID,
  BASE_GRID,
  tokenScreenPos,
} from '../engine/board'

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

const Background: React.FC = React.memo(() => (
  <rect
    x={0}
    y={0}
    width={BOARD_SIZE}
    height={BOARD_SIZE}
    rx={12}
    ry={12}
    fill="#F8F4E8"
  />
))
Background.displayName = 'Background'

const TrackCells: React.FC = React.memo(() => (
  <g id="track-cells">
    {TRACK_GRID.map(([col, row]: [number, number], i: number) => {
      const isSafe = SAFE_SQUARES.has(i)
      return (
        <g key={`track-${i}`}>
          <rect
            x={col * CELL}
            y={row * CELL}
            width={CELL}
            height={CELL}
            fill={isSafe ? '#e8f5e9' : '#ffffff'}
            stroke={isSafe ? '#81c784' : '#bdbdbd'}
            strokeWidth={0.8}
          />
          {isSafe && (
            <text
              x={col * CELL + CELL / 2}
              y={row * CELL + CELL / 2 + 1}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={16}
              fill="#66bb6a"
              pointerEvents="none"
            >
              ★
            </text>
          )}
        </g>
      )
    })}
  </g>
))
TrackCells.displayName = 'TrackCells'

const HomeAreas: React.FC = React.memo(() => (
  <g id="home-lanes">
    {(Object.keys(HOME_LANE_GRID) as PlayerColor[]).map((color) =>
      HOME_LANE_GRID[color].map(([col, row]: [number, number], idx: number) => (
        <rect
          key={`home-${color}-${idx}`}
          x={col * CELL}
          y={row * CELL}
          width={CELL}
          height={CELL}
          fill={idx === 5 ? COLOR_HEX[color] : COLOR_LIGHT[color]}
          stroke={COLOR_HEX[color]}
          strokeWidth={0.8}
        />
      )),
    )}
  </g>
))
HomeAreas.displayName = 'HomeAreas'

const BASE_REGIONS: Record<PlayerColor, { x: number; y: number }> = {
  red: { x: 0, y: 9 },
  green: { x: 0, y: 0 },
  yellow: { x: 9, y: 0 },
  blue: { x: 9, y: 9 },
}

const BaseAreas: React.FC = React.memo(() => (
  <g id="base-areas">
    {(Object.keys(BASE_REGIONS) as PlayerColor[]).map((color) => {
      const { x: gx, y: gy } = BASE_REGIONS[color]
      return (
        <g key={`base-${color}`}>
          <rect
            x={gx * CELL}
            y={gy * CELL}
            width={6 * CELL}
            height={6 * CELL}
            fill={COLOR_LIGHT[color]}
            stroke={COLOR_HEX[color]}
            strokeWidth={2.5}
            rx={6}
            ry={6}
          />
          {BASE_GRID[color].map(([col, row]: [number, number], idx: number) => (
            <circle
              key={`base-slot-${color}-${idx}`}
              cx={col * CELL + CELL / 2}
              cy={row * CELL + CELL / 2}
              r={14}
              fill="#ffffff"
              stroke={COLOR_HEX[color]}
              strokeWidth={1.5}
            />
          ))}
          <text
            x={gx * CELL + 3 * CELL}
            y={gy * CELL + 6 * CELL - 8}
            textAnchor="middle"
            fontSize={11}
            fontWeight={600}
            fill={COLOR_HEX[color]}
            opacity={0.7}
            pointerEvents="none"
          >
            {color.toUpperCase()}
          </text>
        </g>
      )
    })}
  </g>
))
BaseAreas.displayName = 'BaseAreas'

const CenterFinish: React.FC = React.memo(() => {
  const c = 7 * CELL
  const s = 6 * CELL
  const mid = c + s / 2
  const x0 = c
  const y0 = c
  const x1 = c + s
  const y1 = c + s
  return (
    <g id="center-finish">
      <polygon points={`${x0},${y0} ${x1},${y0} ${mid},${mid}`} fill={COLOR_HEX.green} stroke="#fff" strokeWidth={1} />
      <polygon points={`${x0},${y0} ${x0},${y1} ${mid},${mid}`} fill={COLOR_HEX.red} stroke="#fff" strokeWidth={1} />
      <polygon points={`${x0},${y1} ${x1},${y1} ${mid},${mid}`} fill={COLOR_HEX.yellow} stroke="#fff" strokeWidth={1} />
      <polygon points={`${x1},${y0} ${x1},${y1} ${mid},${mid}`} fill={COLOR_HEX.blue} stroke="#fff" strokeWidth={1} />
      <circle cx={mid} cy={mid} r={18} fill="#ffffff" stroke="#e0e0e0" strokeWidth={1} />
      <text
        x={mid}
        y={mid}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={18}
        pointerEvents="none"
      >
        ⭐
      </text>
    </g>
  )
})
CenterFinish.displayName = 'CenterFinish'

/* ------------------------------------------------------------------ */
/*  Tokens                                                             */
/* ------------------------------------------------------------------ */

interface TokensProps {
  game: GameState
  myPlayerId: string | null
  onTokenClick: (tokenId: string) => void
  legalTokenIds: Set<string>
  hiddenTokens?: Set<string>
}

function tokenPixelPos(token: Token): { x: number; y: number } {
  return tokenScreenPos(token)
}

const Tokens: React.FC<TokensProps> = React.memo(
  ({ game, myPlayerId, onTokenClick, legalTokenIds, hiddenTokens }) => {
    const allTokens = useMemo(() => {
      const tokens: Array<{
        token: Token
        color: PlayerColor
        playerId: string
      }> = []
      for (const player of game.players) {
        for (const token of player.tokens) {
          tokens.push({ token, color: player.color, playerId: player.id })
        }
      }
      return tokens
    }, [game.players])

    return (
      <g id="tokens">
        {allTokens.map(({ token, color }) => {
          if (hiddenTokens?.has(token.id)) return null
          const isLegal = legalTokenIds.has(token.id)
          const pos = tokenPixelPos(token)

          return (
            <g
              key={token.id}
              onClick={isLegal ? () => onTokenClick(token.id) : undefined}
              style={{ cursor: isLegal ? 'pointer' : 'default' }}
            >
              {isLegal && (
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={17}
                  fill="none"
                  stroke={COLOR_HEX[color]}
                  strokeWidth={2.5}
                  opacity={0.7}
                >
                  <animate
                    attributeName="r"
                    values="17;21;17"
                    dur="1s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.7;0.3;0.7"
                    dur="1s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={13}
                fill={COLOR_HEX[color]}
                stroke="#ffffff"
                strokeWidth={2}
              />
              <text
                x={pos.x}
                y={pos.y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={11}
                fontWeight={700}
                fill="#ffffff"
                pointerEvents="none"
              >
                {token.index + 1}
              </text>
            </g>
          )
        })}
      </g>
    )
  },
)
Tokens.displayName = 'Tokens'

/* ------------------------------------------------------------------ */
/*  Main Board Component                                               */
/* ------------------------------------------------------------------ */

interface BoardProps {
  game: GameState
  myPlayerId: string | null
  onTokenClick: (tokenId: string) => void
  legalTokenIds: Set<string>
  hiddenTokens?: Set<string>
  animationLayer?: React.ReactNode
}

const LudoBoard: React.FC<BoardProps> = ({
  game,
  myPlayerId,
  onTokenClick,
  legalTokenIds,
  hiddenTokens,
  animationLayer,
}) => {
  return (
    <svg
      viewBox={`0 0 ${BOARD_SIZE} ${BOARD_SIZE}`}
      width={BOARD_SIZE}
      height={BOARD_SIZE}
      xmlns="http://www.w3.org/2000/svg"
      style={{
        maxWidth: '100%',
        height: 'auto',
        borderRadius: 16,
        boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
      }}
    >
      <Background />
      <BaseAreas />
      <TrackCells />
      <HomeAreas />
      <CenterFinish />
      <Tokens
        game={game}
        myPlayerId={myPlayerId}
        onTokenClick={onTokenClick}
        legalTokenIds={legalTokenIds}
        hiddenTokens={hiddenTokens}
      />
      {animationLayer}
    </svg>
  )
}

export default React.memo(LudoBoard)
export { tokenPixelPos }
export type { BoardProps }
