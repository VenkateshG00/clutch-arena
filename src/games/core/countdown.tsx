'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface CountdownProps {
  onComplete: () => void
}

const countdownItems = [
  { value: '3', color: '#EF4444' },
  { value: '2', color: '#F59E0B' },
  { value: '1', color: '#22C55E' },
  { value: 'GO!', color: '#8B5CF6' },
]

export function Countdown({ onComplete }: CountdownProps) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (index < countdownItems.length - 1) {
      const timer = setTimeout(() => setIndex((i) => i + 1), 800)
      return () => clearTimeout(timer)
    } else {
      // "GO!" displayed, fire completion after brief display
      const timer = setTimeout(onComplete, 500)
      return () => clearTimeout(timer)
    }
  }, [index, onComplete])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#090B14]/90 backdrop-blur-sm">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ scale: 0.3, opacity: 0, rotate: -10 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          exit={{ scale: 2.5, opacity: 0 }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 20,
            duration: 0.4,
          }}
          className="select-none text-center"
        >
          <span
            className="text-[120px] font-black leading-none drop-shadow-[0_0_40px_currentColor] md:text-[160px]"
            style={{ color: countdownItems[index].color }}
          >
            {countdownItems[index].value}
          </span>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
