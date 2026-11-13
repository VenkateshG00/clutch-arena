'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { GameConfig, GameCallbacks, GameResult } from '@/types/game'
import { getSentencesByDifficulty, type Sentence } from './sentences'

interface TypeClashProps {
  config: GameConfig
  callbacks: GameCallbacks
}

interface TypingStats {
  totalCharsTyped: number
  correctChars: number
  wrongChars: number
  sentencesCompleted: number
  perfectSentences: number
  longestStreak: number
  currentStreak: number
  wordsTyped: number
}

export default function TypeClash({ config, callbacks }: TypeClashProps) {
  const duration = config.duration ?? 60
  const difficulty = config.difficulty ?? 2

  const [sentenceQueue, setSentenceQueue] = useState<Sentence[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [typedText, setTypedText] = useState('')
  const [stats, setStats] = useState<TypingStats>({
    totalCharsTyped: 0,
    correctChars: 0,
    wrongChars: 0,
    sentencesCompleted: 0,
    perfectSentences: 0,
    longestStreak: 0,
    currentStreak: 0,
    wordsTyped: 0,
  })
  const [wpm, setWpm] = useState(0)
  const [sentenceKey, setSentenceKey] = useState(0)

  const inputRef = useRef<HTMLInputElement>(null)
  const startTimeRef = useRef<number>(Date.now())
  const gameEndedRef = useRef(false)
  const statsRef = useRef(stats)
  statsRef.current = stats

  // Initialize sentences
  useEffect(() => {
    const pool = getSentencesByDifficulty(difficulty)
    const shuffled: Sentence[] = []
    for (let round = 0; round < 3; round++) {
      const batch = [...pool]
      for (let j = batch.length - 1; j > 0; j--) {
        const k = Math.floor(Math.random() * (j + 1))
        ;[batch[j], batch[k]] = [batch[k], batch[j]]
      }
      shuffled.push(...batch)
    }
    setSentenceQueue(shuffled)
    setCurrentIndex(0)
    setTypedText('')
    startTimeRef.current = Date.now()
  }, [difficulty])

  const currentSentence = sentenceQueue[currentIndex]?.text ?? ''

  const accuracy = useMemo(() => {
    if (stats.totalCharsTyped === 0) return 100
    return Math.round((stats.correctChars / stats.totalCharsTyped) * 1000) / 10
  }, [stats.correctChars, stats.totalCharsTyped])

  const sentenceProgress = currentSentence.length > 0
    ? Math.min((typedText.length / currentSentence.length) * 100, 100)
    : 0

  const calculateScore = useCallback((finalStats: TypingStats, finalWpm: number): number => {
    const base = finalStats.wordsTyped * 10
    const acc = finalStats.totalCharsTyped > 0
      ? finalStats.correctChars / finalStats.totalCharsTyped
      : 1
    let accuracyMultiplier = 1
    if (acc >= 0.98) accuracyMultiplier = 2
    else if (acc >= 0.95) accuracyMultiplier = 1.5

    let speedMultiplier = 1
    if (finalWpm > 40) {
      speedMultiplier = 1 + (finalWpm - 40) * 0.02
    }

    const perfectBonus = finalStats.perfectSentences * 50
    return Math.round(base * accuracyMultiplier * speedMultiplier + perfectBonus)
  }, [])

  const endGame = useCallback(() => {
    if (gameEndedRef.current) return
    gameEndedRef.current = true

    const finalStats = statsRef.current
    const elapsed = (Date.now() - startTimeRef.current) / 1000
    const minutes = elapsed / 60
    const finalWpm = minutes > 0 ? Math.round(finalStats.wordsTyped / minutes) : 0

    const score = calculateScore(finalStats, finalWpm)
    const acc = finalStats.totalCharsTyped > 0
      ? Math.round((finalStats.correctChars / finalStats.totalCharsTyped) * 1000) / 10
      : 100

    const result: GameResult = {
      score,
      accuracy: acc,
      completionTime: elapsed,
      metadata: {
        wpm: finalWpm,
        totalCharsTyped: finalStats.totalCharsTyped,
        correctChars: finalStats.correctChars,
        wrongChars: finalStats.wrongChars,
        sentencesCompleted: finalStats.sentencesCompleted,
        perfectSentences: finalStats.perfectSentences,
        longestStreak: finalStats.longestStreak,
        wordsTyped: finalStats.wordsTyped,
      },
    }

    callbacks.onGameEnd(result)
  }, [callbacks, calculateScore])

  // Watch the wrapper's time via a polling interval that checks store.timeRemaining
  // The wrapper calls onTimeUpdate but we also need to detect time-up.
  // We use an interval to check elapsed time against duration.
  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000
      if (elapsed >= duration) {
        endGame()
        clearInterval(interval)
      }
    }, 200)
    return () => clearInterval(interval)
  }, [duration, endGame])

  // Update WPM in real time
  useEffect(() => {
    if (stats.wordsTyped === 0) {
      setWpm(0)
      return
    }
    const elapsed = (Date.now() - startTimeRef.current) / 1000
    const minutes = elapsed / 60
    if (minutes > 0) {
      setWpm(Math.round(stats.wordsTyped / minutes))
    }
  }, [stats.wordsTyped, stats.totalCharsTyped])

  // Auto-focus input on mount
  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 100)
    return () => clearTimeout(timer)
  }, [])

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (gameEndedRef.current) return

      const newValue = e.target.value
      const oldValue = typedText

      // Handle backspace (value got shorter)
      if (newValue.length < oldValue.length) {
        setTypedText(newValue)
        return
      }

      // Handle new characters typed
      const newChars = newValue.slice(oldValue.length)

      let updatedText = oldValue
      let newCorrect = 0
      let newWrong = 0
      let streak = stats.currentStreak
      let longestStreak = stats.longestStreak

      for (const char of newChars) {
        const pos = updatedText.length
        if (pos >= currentSentence.length) break

        updatedText += char
        if (char === currentSentence[pos]) {
          newCorrect++
          streak++
          if (streak > longestStreak) longestStreak = streak
        } else {
          newWrong++
          streak = 0
        }
      }

      setTypedText(updatedText)

      const totalNew = newCorrect + newWrong
      if (totalNew > 0) {
        setStats((prev) => ({
          ...prev,
          totalCharsTyped: prev.totalCharsTyped + totalNew,
          correctChars: prev.correctChars + newCorrect,
          wrongChars: prev.wrongChars + newWrong,
          currentStreak: streak,
          longestStreak,
        }))
      }

      callbacks.onScoreUpdate(
        calculateScore(
          { ...statsRef.current, correctChars: statsRef.current.correctChars + newCorrect },
          wpm,
        ),
      )

      // Check if sentence is completed
      if (updatedText.length >= currentSentence.length) {
        const isPerfect = updatedText === currentSentence
        const wordsInSentence = currentSentence.split(/\s+/).filter(Boolean).length

        setStats((prev) => ({
          ...prev,
          sentencesCompleted: prev.sentencesCompleted + 1,
          perfectSentences: prev.perfectSentences + (isPerfect ? 1 : 0),
          wordsTyped: prev.wordsTyped + wordsInSentence,
        }))

        setTypedText('')
        setCurrentIndex((prev) => prev + 1)
        setSentenceKey((prev) => prev + 1)

        if (inputRef.current) {
          inputRef.current.value = ''
        }
      }
    },
    [typedText, currentSentence, stats.currentStreak, stats.longestStreak, callbacks, calculateScore, wpm],
  )

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault()
  }, [])

  const handleDisplayClick = useCallback(() => {
    inputRef.current?.focus()
  }, [])

  if (sentenceQueue.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[#94A3B8]">Loading sentences...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 w-full max-w-3xl mx-auto">
      {/* Live stats */}
      <div className="flex items-center justify-between gap-2 sm:gap-4 text-sm flex-wrap">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex flex-col items-center">
            <span className="text-[#94A3B8] text-[10px] sm:text-xs uppercase tracking-wider">WPM</span>
            <motion.span
              key={wpm}
              initial={{ scale: 1.15 }}
              animate={{ scale: 1 }}
              className="text-xl sm:text-2xl font-bold font-mono text-[#8B5CF6]"
            >
              {wpm}
            </motion.span>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="flex flex-col items-center">
            <span className="text-[#94A3B8] text-[10px] sm:text-xs uppercase tracking-wider">Accuracy</span>
            <span
              className="text-xl sm:text-2xl font-bold font-mono"
              style={{ color: accuracy >= 95 ? '#22C55E' : accuracy >= 80 ? '#EAB308' : '#EF4444' }}
            >
              {accuracy}%
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex flex-col items-center">
            <span className="text-[#94A3B8] text-[10px] sm:text-xs uppercase tracking-wider">Streak</span>
            <span className="text-base sm:text-lg font-bold font-mono text-[#22C55E]">{stats.currentStreak}</span>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="flex flex-col items-center">
            <span className="text-[#94A3B8] text-[10px] sm:text-xs uppercase tracking-wider">Done</span>
            <span className="text-base sm:text-lg font-bold font-mono text-[#3B82F6]">{stats.sentencesCompleted}</span>
          </div>
        </div>
      </div>

      {/* Sentence progress bar */}
      <div className="h-1 w-full rounded-full bg-white/5 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-[#8B5CF6]"
          animate={{ width: `${sentenceProgress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      {/* Typing display area */}
      <div
        className="relative rounded-xl border border-white/10 bg-[#111525] p-4 sm:p-6 min-h-[140px] sm:min-h-[160px] cursor-text"
        onClick={handleDisplayClick}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={sentenceKey}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="font-mono text-lg sm:text-xl md:text-2xl leading-relaxed tracking-wide select-none break-words"
          >
            {currentSentence.split('').map((char, i) => {
              let color = '#94A3B8'
              let textDecoration = 'none'
              let backgroundColor = 'transparent'

              if (i < typedText.length) {
                if (typedText[i] === char) {
                  color = '#22C55E'
                } else {
                  color = '#EF4444'
                  textDecoration = 'underline'
                  backgroundColor = 'rgba(239, 68, 68, 0.15)'
                }
              } else if (i === typedText.length) {
                backgroundColor = 'rgba(139, 92, 246, 0.3)'
                color = '#F8FAFC'
              }

              return (
                <span
                  key={i}
                  style={{
                    color,
                    textDecoration,
                    backgroundColor,
                    borderRadius: i === typedText.length ? '2px' : undefined,
                    padding: i === typedText.length ? '0 1px' : undefined,
                  }}
                >
                  {char}
                </span>
              )
            })}
          </motion.div>
        </AnimatePresence>

        {/* Difficulty badge */}
        {sentenceQueue[currentIndex] && (
          <div className="absolute top-2 right-3">
            <span
              className="text-[10px] uppercase tracking-widest font-semibold px-2 py-0.5 rounded-full"
              style={{
                color:
                  sentenceQueue[currentIndex].difficulty === 'easy'
                    ? '#22C55E'
                    : sentenceQueue[currentIndex].difficulty === 'medium'
                      ? '#EAB308'
                      : '#EF4444',
                backgroundColor:
                  sentenceQueue[currentIndex].difficulty === 'easy'
                    ? 'rgba(34,197,94,0.1)'
                    : sentenceQueue[currentIndex].difficulty === 'medium'
                      ? 'rgba(234,179,8,0.1)'
                      : 'rgba(239,68,68,0.1)',
              }}
            >
              {sentenceQueue[currentIndex].difficulty}
            </span>
          </div>
        )}
      </div>

      {/* Visible input for mobile virtual keyboard support */}
      <input
        ref={inputRef}
        type="text"
        autoFocus
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        value={typedText}
        onChange={handleInputChange}
        onPaste={handlePaste}
        className="w-full bg-[#0D0F1A] border border-white/10 rounded-lg px-4 py-3 font-mono text-[#F8FAFC] text-base outline-none focus:border-[#8B5CF6]/50 focus:ring-1 focus:ring-[#8B5CF6]/25 transition-colors placeholder:text-[#94A3B8]/50"
        placeholder="Type here..."
        aria-label="Type the sentence shown above"
      />

      {/* Mobile hint */}
      <p className="text-center text-[#94A3B8] text-xs md:hidden">
        Tap the input field above to open your keyboard
      </p>
    </div>
  )
}
