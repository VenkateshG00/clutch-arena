'use client'

import React, { useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { AnimationEvent } from './types'
import {
  ParticleBurst,
  ConfettiRain,
  PopTextLabel,
  DizzyStars,
} from './particles'
import { COLOR_HEX } from '../engine/constants'

// ─── Props ─────────────────────────────────────────────────────────────
interface AnimationControllerProps {
  event: AnimationEvent | null
  onComplete: () => void
}

// ─── Safety timeout ────────────────────────────────────────────────────
const SAFETY_TIMEOUT_MS = 3500

// ─── Helper: color palette for bursts ──────────────────────────────────
function burstColors(hex: string): string[] {
  return [hex, '#FFFFFF', '#FFD700', hex + 'AA']
}

// ─── Sub-animation renderers ───────────────────────────────────────────

function TokenEnterBoard({
  event,
  onComplete,
}: {
  event: Extract<AnimationEvent, { type: 'token_enter_board' }>
  onComplete: () => void
}) {
  const hex = COLOR_HEX[event.color]
  return (
    <g>
      <motion.circle
        cx={event.from.x}
        cy={event.from.y}
        r={8}
        fill={hex}
        stroke="#fff"
        strokeWidth={2}
        initial={{ cx: event.from.x, cy: event.from.y, scale: 1 }}
        animate={{
          cx: event.to.x,
          cy: event.to.y,
          scale: [1, 1.4, 1],
        }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      />
      <ParticleBurst
        cx={event.to.x}
        cy={event.to.y}
        colors={burstColors(hex)}
        count={10}
        spread={30}
        duration={0.6}
      />
      <PopTextLabel
        x={event.to.x}
        y={event.to.y - 20}
        text="POP!"
        color={hex}
        fontSize={14}
        duration={0.7}
        delay={0.2}
        onComplete={onComplete}
      />
    </g>
  )
}

function TokenMove({
  event,
  onComplete,
}: {
  event: Extract<AnimationEvent, { type: 'token_move' }>
  onComplete: () => void
}) {
  const hex = COLOR_HEX[event.color]
  const xKeyframes = event.path.map((p) => p.x)
  const yKeyframes = event.path.map((p) => p.y)

  return (
    <g>
      {/* Trail sparkles at each hop */}
      {event.path.map((p, i) => (
        <motion.circle
          key={`trail-${i}`}
          cx={p.x}
          cy={p.y}
          r={3}
          fill={hex}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 0.7, 0], scale: [0, 1, 0.5] }}
          transition={{
            duration: 0.4,
            delay: (i / event.path.length) * 0.5,
          }}
        />
      ))}
      {/* Moving token */}
      <motion.circle
        cx={event.from.x}
        cy={event.from.y}
        r={8}
        fill={hex}
        stroke="#fff"
        strokeWidth={2}
        animate={{
          cx: xKeyframes,
          cy: yKeyframes,
        }}
        transition={{
          duration: Math.min(0.08 * event.path.length, 1.2),
          ease: 'linear',
        }}
        onAnimationComplete={onComplete}
      />
    </g>
  )
}

function TokenCapture({
  event,
  onComplete,
}: {
  event: Extract<AnimationEvent, { type: 'token_capture' }>
  onComplete: () => void
}) {
  const capturedHex = COLOR_HEX[event.capturedColor]
  const capturerHex = COLOR_HEX[event.capturerColor]

  return (
    <g>
      {/* Capturer bounce */}
      <motion.circle
        cx={event.capturePos.x}
        cy={event.capturePos.y}
        r={9}
        fill={capturerHex}
        stroke="#fff"
        strokeWidth={2}
        animate={{ scale: [1, 1.5, 1] }}
        transition={{ duration: 0.4 }}
      />
      {/* Captured token spinning to base */}
      <motion.circle
        r={7}
        fill={capturedHex}
        stroke="#fff"
        strokeWidth={1.5}
        initial={{
          cx: event.capturePos.x,
          cy: event.capturePos.y,
          opacity: 1,
        }}
        animate={{
          cx: event.capturedHomePos.x,
          cy: event.capturedHomePos.y,
          opacity: [1, 1, 0.5],
          rotate: 720,
        }}
        transition={{ duration: 0.7, ease: 'easeInOut' }}
      />
      <ParticleBurst
        cx={event.capturePos.x}
        cy={event.capturePos.y}
        colors={[capturedHex, capturerHex, '#FF4444', '#FFD700']}
        count={14}
        spread={35}
        duration={0.7}
      />
      <PopTextLabel
        x={event.capturePos.x}
        y={event.capturePos.y - 22}
        text="BONK!"
        color="#FF4444"
        fontSize={16}
        duration={0.8}
        delay={0.1}
      />
      <DizzyStars
        cx={event.capturePos.x}
        cy={event.capturePos.y}
        color={capturedHex}
        count={3}
        radius={18}
        duration={1}
      />
      {/* Invisible completion trigger */}
      <motion.circle
        r={0}
        fill="none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 1 }}
        onAnimationComplete={onComplete}
      />
    </g>
  )
}

function TokenEnterHomeLane({
  event,
  onComplete,
}: {
  event: Extract<AnimationEvent, { type: 'token_enter_home_lane' }>
  onComplete: () => void
}) {
  const hex = COLOR_HEX[event.color]
  return (
    <g>
      {/* Glowing circle */}
      <motion.circle
        cx={event.to.x}
        cy={event.to.y}
        r={12}
        fill="none"
        stroke={hex}
        strokeWidth={3}
        initial={{ opacity: 0.8, scale: 0.5 }}
        animate={{ opacity: 0, scale: 2 }}
        transition={{ duration: 0.8 }}
      />
      <motion.circle
        cx={event.from.x}
        cy={event.from.y}
        r={8}
        fill={hex}
        stroke="#fff"
        strokeWidth={2}
        animate={{
          cx: event.to.x,
          cy: event.to.y,
        }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
      />
      <ParticleBurst
        cx={event.to.x}
        cy={event.to.y}
        colors={burstColors(hex)}
        count={10}
        spread={25}
        duration={0.6}
      />
      <PopTextLabel
        x={event.to.x}
        y={event.to.y - 20}
        text="HOME LANE!"
        color={hex}
        fontSize={12}
        duration={0.8}
        delay={0.2}
        onComplete={onComplete}
      />
    </g>
  )
}

function TokenFinished({
  event,
  onComplete,
}: {
  event: Extract<AnimationEvent, { type: 'token_finished' }>
  onComplete: () => void
}) {
  const hex = COLOR_HEX[event.color]
  const message =
    event.finishedCount === 1
      ? 'FIRST HOME!'
      : event.finishedCount === 2
        ? 'SECOND HOME!'
        : event.finishedCount === 3
          ? 'THIRD HOME!'
          : 'ALL HOME!'

  return (
    <g>
      <ParticleBurst
        cx={event.pos.x}
        cy={event.pos.y}
        colors={burstColors(hex)}
        count={16}
        spread={40}
        duration={0.8}
      />
      <ConfettiRain
        cx={event.pos.x}
        cy={event.pos.y - 10}
        colors={[hex, '#FFD700', '#FF6B6B', '#4ECDC4', '#FFFFFF']}
        count={15}
        duration={1.2}
      />
      <PopTextLabel
        x={event.pos.x}
        y={event.pos.y - 25}
        text={message}
        color={hex}
        fontSize={14}
        duration={1}
        delay={0.15}
        onComplete={onComplete}
      />
    </g>
  )
}

function AllTokensHome({
  event,
  onComplete,
}: {
  event: Extract<AnimationEvent, { type: 'all_tokens_home' }>
  onComplete: () => void
}) {
  const hex = COLOR_HEX[event.color]
  return (
    <g>
      {/* Big burst */}
      <ParticleBurst
        cx={event.pos.x}
        cy={event.pos.y}
        colors={[hex, '#FFD700', '#FF6B6B', '#4ECDC4', '#FFF']}
        count={24}
        spread={60}
        duration={1}
      />
      {/* Expanding rings */}
      {[0, 0.15, 0.3].map((delay, i) => (
        <motion.circle
          key={`ring-${i}`}
          cx={event.pos.x}
          cy={event.pos.y}
          r={10}
          fill="none"
          stroke={hex}
          strokeWidth={2}
          initial={{ scale: 0.5, opacity: 0.8 }}
          animate={{ scale: 3 + i, opacity: 0 }}
          transition={{ duration: 1, delay }}
        />
      ))}
      <ConfettiRain
        cx={event.pos.x}
        cy={event.pos.y - 20}
        colors={[hex, '#FFD700', '#FF6B6B', '#4ECDC4', '#FFF']}
        count={30}
        width={120}
        duration={1.5}
      />
      <PopTextLabel
        x={event.pos.x}
        y={event.pos.y - 30}
        text="ALL FOUR HOME!"
        color="#FFD700"
        fontSize={18}
        duration={1.2}
        delay={0.1}
        onComplete={onComplete}
      />
    </g>
  )
}

function DiceRollAnim({
  event,
  onComplete,
}: {
  event: Extract<AnimationEvent, { type: 'dice_roll' }>
  onComplete: () => void
}) {
  // Only show text for sixes; auto-complete after brief delay
  useEffect(() => {
    const t = setTimeout(onComplete, event.isSix ? 700 : 200)
    return () => clearTimeout(t)
  }, [event.isSix, onComplete])

  if (!event.isSix) return null

  return (
    <PopTextLabel
      x={225}
      y={225}
      text="SIX!"
      color="#FFD700"
      fontSize={20}
      duration={0.6}
    />
  )
}

// ─── Main Controller ───────────────────────────────────────────────────
export function AnimationController({
  event,
  onComplete,
}: AnimationControllerProps) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  // Stable onComplete ref to avoid stale closures
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  const handleComplete = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = undefined
    }
    onCompleteRef.current()
  }, [])

  // Safety timeout: force-complete if animation hangs
  useEffect(() => {
    if (!event) return

    timeoutRef.current = setTimeout(() => {
      onCompleteRef.current()
    }, SAFETY_TIMEOUT_MS)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [event])

  if (!event) return null

  return (
    <g className="animation-overlay" pointerEvents="none">
      <AnimatePresence mode="wait">
        {event.type === 'token_enter_board' && (
          <TokenEnterBoard
            key={event.id}
            event={event}
            onComplete={handleComplete}
          />
        )}
        {event.type === 'token_move' && (
          <TokenMove
            key={event.id}
            event={event}
            onComplete={handleComplete}
          />
        )}
        {event.type === 'token_capture' && (
          <TokenCapture
            key={event.id}
            event={event}
            onComplete={handleComplete}
          />
        )}
        {event.type === 'token_enter_home_lane' && (
          <TokenEnterHomeLane
            key={event.id}
            event={event}
            onComplete={handleComplete}
          />
        )}
        {event.type === 'token_finished' && (
          <TokenFinished
            key={event.id}
            event={event}
            onComplete={handleComplete}
          />
        )}
        {event.type === 'all_tokens_home' && (
          <AllTokensHome
            key={event.id}
            event={event}
            onComplete={handleComplete}
          />
        )}
        {event.type === 'dice_roll' && (
          <DiceRollAnim
            key={event.id}
            event={event}
            onComplete={handleComplete}
          />
        )}
        {event.type === 'winner' && (
          <AllTokensHome
            key={event.id}
            event={{
              id: event.id,
              type: 'all_tokens_home',
              color: event.color,
              pos: { x: 225, y: 225 },
            }}
            onComplete={handleComplete}
          />
        )}
        {event.type === 'turn_skip' && (
          <PopTextLabel
            key={event.id}
            x={225}
            y={225}
            text="SKIP"
            color="#888"
            fontSize={16}
            duration={0.6}
            onComplete={handleComplete}
          />
        )}
      </AnimatePresence>
    </g>
  )
}
