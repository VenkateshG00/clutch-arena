'use client'

import { motion, AnimatePresence } from 'framer-motion'
import React, { useMemo } from 'react'

// ─── Seeded random for deterministic rendering ─────────────────────────
function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

// ─── Shape renderer ────────────────────────────────────────────────────
type ShapeType = 'circle' | 'star' | 'square' | 'triangle'

function renderShape(
  shape: ShapeType,
  size: number,
  fill: string,
  key: string,
) {
  switch (shape) {
    case 'circle':
      return <circle key={key} r={size / 2} fill={fill} />
    case 'square':
      return (
        <rect
          key={key}
          x={-size / 2}
          y={-size / 2}
          width={size}
          height={size}
          fill={fill}
        />
      )
    case 'triangle': {
      const h = (size * Math.sqrt(3)) / 2
      const points = `0,${-h / 2} ${size / 2},${h / 2} ${-size / 2},${h / 2}`
      return <polygon key={key} points={points} fill={fill} />
    }
    case 'star': {
      const pts: string[] = []
      for (let i = 0; i < 10; i++) {
        const r = i % 2 === 0 ? size / 2 : size / 4
        const angle = (Math.PI / 5) * i - Math.PI / 2
        pts.push(`${r * Math.cos(angle)},${r * Math.sin(angle)}`)
      }
      return <polygon key={key} points={pts.join(' ')} fill={fill} />
    }
  }
}

// ─── ParticleBurst ─────────────────────────────────────────────────────
export interface ParticleBurstProps {
  cx: number
  cy: number
  colors: string[]
  count?: number
  spread?: number
  duration?: number
  shapes?: ShapeType[]
  onComplete?: () => void
}

export function ParticleBurst({
  cx,
  cy,
  colors,
  count = 12,
  spread = 40,
  duration = 0.8,
  shapes = ['circle', 'star', 'square', 'triangle'],
  onComplete,
}: ParticleBurstProps) {
  const rng = useMemo(() => seededRandom(Math.round(cx * 100 + cy * 7)), [cx, cy])

  const particles = useMemo(() => {
    const rand = rng
    return Array.from({ length: count }, (_, i) => {
      const angle = (2 * Math.PI * i) / count + (rand() - 0.5) * 0.5
      const dist = spread * (0.6 + rand() * 0.4)
      const color = colors[i % colors.length]
      const shape = shapes[Math.floor(rand() * shapes.length)]
      const size = 3 + rand() * 4
      return { angle, dist, color, shape, size, delay: rand() * 0.1 }
    })
  }, [count, spread, colors, shapes, rng])

  return (
    <g>
      {particles.map((p, i) => {
        const tx = Math.cos(p.angle) * p.dist
        const ty = Math.sin(p.angle) * p.dist
        return (
          <motion.g
            key={i}
            initial={{ x: cx, y: cy, opacity: 1, scale: 0.5 }}
            animate={{
              x: cx + tx,
              y: cy + ty,
              opacity: 0,
              scale: 1.2,
              rotate: 360,
            }}
            transition={{
              duration,
              delay: p.delay,
              ease: 'easeOut',
            }}
            onAnimationComplete={i === 0 ? onComplete : undefined}
          >
            {renderShape(p.shape as ShapeType, p.size, p.color, `p-${i}`)}
          </motion.g>
        )
      })}
    </g>
  )
}

// ─── ConfettiRain ──────────────────────────────────────────────────────
export interface ConfettiRainProps {
  cx: number
  cy: number
  colors: string[]
  count?: number
  width?: number
  duration?: number
}

export function ConfettiRain({
  cx,
  cy,
  colors,
  count = 20,
  width = 80,
  duration = 1.5,
}: ConfettiRainProps) {
  const rng = useMemo(() => seededRandom(Math.round(cx * 37 + cy * 13)), [cx, cy])

  const pieces = useMemo(() => {
    const rand = rng
    return Array.from({ length: count }, (_, i) => {
      const xOff = (rand() - 0.5) * width
      const fallDist = 60 + rand() * 80
      const color = colors[i % colors.length]
      const w = 3 + rand() * 3
      const h = 6 + rand() * 6
      const delay = rand() * 0.3
      const rotEnd = (rand() - 0.5) * 720
      return { xOff, fallDist, color, w, h, delay, rotEnd }
    })
  }, [count, width, colors, rng])

  return (
    <g>
      {pieces.map((p, i) => (
        <motion.rect
          key={i}
          x={cx + p.xOff - p.w / 2}
          y={cy}
          width={p.w}
          height={p.h}
          rx={1}
          fill={p.color}
          initial={{ opacity: 1, y: cy, rotate: 0 }}
          animate={{
            y: cy + p.fallDist,
            opacity: 0,
            rotate: p.rotEnd,
          }}
          transition={{
            duration,
            delay: p.delay,
            ease: 'easeIn',
          }}
        />
      ))}
    </g>
  )
}

// ─── PopText ───────────────────────────────────────────────────────────
export interface PopTextProps {
  x: number
  y: number
  text: string
  color?: string
  fontSize?: number
  duration?: number
  delay?: number
}

export function PopText({
  x,
  y,
  text,
  color = '#fff',
  fontSize = 16,
  duration = 0.8,
  delay = 0,
}: PopTextProps) {
  return (
    <motion.text
      x={x}
      y={y}
      textAnchor="middle"
      dominantBaseline="central"
      fill={color}
      fontSize={fontSize}
      fontWeight="bold"
      stroke="#000"
      strokeWidth={1.5}
      paintOrder="stroke"
      initial={{ scale: 0, opacity: 1 }}
      animate={{
        scale: [0, 1.3, 1, 1],
        opacity: [1, 1, 1, 0],
      }}
      transition={{
        duration,
        delay,
        times: [0, 0.3, 0.7, 1],
        ease: 'easeOut',
      }}
    />
  )
  // Note: framer-motion SVG text doesn't support children in the animate prop
  // workaround: we use a g wrapper
}

// Re-export with children support via g wrapper
export function PopTextLabel({
  x,
  y,
  text,
  color = '#fff',
  fontSize = 16,
  duration = 0.8,
  delay = 0,
  onComplete,
}: PopTextProps & { onComplete?: () => void }) {
  return (
    <motion.g
      initial={{ scale: 0, opacity: 1 }}
      animate={{
        scale: [0, 1.3, 1, 1],
        opacity: [1, 1, 1, 0],
      }}
      transition={{
        duration,
        delay,
        times: [0, 0.3, 0.7, 1],
        ease: 'easeOut',
      }}
      onAnimationComplete={onComplete}
      style={{ originX: `${x}px`, originY: `${y}px` }}
    >
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="central"
        fill={color}
        fontSize={fontSize}
        fontWeight="bold"
        stroke="#000"
        strokeWidth={1.5}
        paintOrder="stroke"
      >
        {text}
      </text>
    </motion.g>
  )
}

// ─── DizzyStars ────────────────────────────────────────────────────────
export interface DizzyStarsProps {
  cx: number
  cy: number
  color?: string
  count?: number
  radius?: number
  duration?: number
}

export function DizzyStars({
  cx,
  cy,
  color = '#FFD700',
  count = 3,
  radius = 15,
  duration = 1,
}: DizzyStarsProps) {
  const stars = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        startAngle: (2 * Math.PI * i) / count,
      })),
    [count],
  )

  return (
    <g>
      {stars.map((s, i) => (
        <motion.g
          key={i}
          initial={{ rotate: (s.startAngle * 180) / Math.PI, opacity: 1 }}
          animate={{
            rotate: (s.startAngle * 180) / Math.PI + 720,
            opacity: [1, 1, 0],
          }}
          transition={{ duration, ease: 'linear' }}
          style={{ originX: `${cx}px`, originY: `${cy}px` }}
        >
          <text
            x={cx + radius}
            y={cy}
            fontSize={10}
            textAnchor="middle"
            dominantBaseline="central"
            fill={color}
          >
            ★
          </text>
        </motion.g>
      ))}
    </g>
  )
}
