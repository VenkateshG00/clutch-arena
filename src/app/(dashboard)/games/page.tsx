'use client'

import { motion } from 'framer-motion'
import { Gamepad2, Clock, Zap, Brain, Keyboard } from 'lucide-react'
import Link from 'next/link'
import { GAMES } from '@/lib/constants'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const categoryIcons: Record<string, typeof Gamepad2> = {
  reaction: Zap,
  memory: Brain,
  typing: Keyboard,
}

const difficultyColors: Record<string, string> = {
  easy: 'border-[#22C55E]/30 text-[#22C55E]',
  medium: 'border-[#F59E0B]/30 text-[#F59E0B]',
  hard: 'border-[#EF4444]/30 text-[#EF4444]',
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
} as const

export default function GamesPage() {
  return (
    <div className="min-h-[100dvh] p-4 lg:p-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="mb-2 text-3xl font-black">Games</h1>
          <p className="text-[#94A3B8]">
            Choose a game and start competing
          </p>
        </motion.div>

        {/* Games Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {GAMES.map((game) => {
            const Icon = categoryIcons[game.category] || Gamepad2
            return (
              <motion.div key={game.slug} variants={item} className="group">
                <Link href={`/games/play/${game.slug}`}>
                  <div className="h-full overflow-hidden rounded-xl border border-white/[0.06] bg-[#111525] transition-all hover:border-[#8B5CF6]/20 hover:shadow-[0_0_30px_rgba(139,92,246,0.08)]">
                    {/* Thumbnail */}
                    <div
                      className={`relative flex h-40 items-center justify-center bg-gradient-to-br ${game.gradient}`}
                    >
                      <motion.span
                        className="text-6xl drop-shadow-lg"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      >
                        {game.icon}
                      </motion.span>
                      <div className="absolute right-3 top-3">
                        <Badge
                          variant="secondary"
                          className="border-0 bg-black/40 text-xs text-white"
                        >
                          <Clock className="mr-1 h-3 w-3" />
                          {game.duration}s
                        </Badge>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <div className="mb-2 flex items-start justify-between">
                        <h3 className="text-lg font-bold">{game.name}</h3>
                        <Badge
                          variant="outline"
                          className={`text-xs capitalize ${
                            difficultyColors[game.difficulty] ||
                            'border-white/10 text-[#94A3B8]'
                          }`}
                        >
                          {game.difficulty}
                        </Badge>
                      </div>

                      <p className="mb-4 line-clamp-2 text-sm text-[#94A3B8]">
                        {game.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
                          <Icon className="h-3.5 w-3.5" />
                          <span className="capitalize">{game.category}</span>
                        </div>
                        <Button
                          size="sm"
                          className="bg-[#8B5CF6] text-white hover:bg-[#7C3AED]"
                        >
                          Play Now
                        </Button>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </div>
  )
}
