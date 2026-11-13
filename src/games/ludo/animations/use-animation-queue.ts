import { useState, useRef, useCallback } from 'react'
import type { AnimationEvent } from './types'

/**
 * Hook that manages a sequential queue of animation events.
 * Uses refs for queue and seen IDs to avoid unnecessary re-renders.
 */
export function useAnimationQueue() {
  const [current, setCurrent] = useState<AnimationEvent | null>(null)
  const queueRef = useRef<AnimationEvent[]>([])
  const seenRef = useRef<Set<string>>(new Set())
  const isPlayingRef = useRef(false)

  const pump = useCallback(() => {
    if (isPlayingRef.current) return
    const next = queueRef.current.shift()
    if (next) {
      isPlayingRef.current = true
      setCurrent(next)
    } else {
      setCurrent(null)
    }
  }, [])

  const enqueue = useCallback(
    (events: AnimationEvent[]) => {
      const newEvents = events.filter((e) => !seenRef.current.has(e.id))
      if (newEvents.length === 0) return

      for (const e of newEvents) {
        seenRef.current.add(e.id)
      }
      queueRef.current.push(...newEvents)

      // If nothing is currently playing, start the pump
      if (!isPlayingRef.current) {
        pump()
      }
    },
    [pump],
  )

  const onComplete = useCallback(() => {
    isPlayingRef.current = false
    pump()
  }, [pump])

  const skip = useCallback(() => {
    isPlayingRef.current = false
    pump()
  }, [pump])

  const clear = useCallback(() => {
    queueRef.current = []
    isPlayingRef.current = false
    setCurrent(null)
  }, [])

  return {
    current,
    queueLength: queueRef.current.length,
    enqueue,
    onComplete,
    skip,
    clear,
  }
}
