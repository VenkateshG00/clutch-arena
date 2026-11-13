'use client'

import { motion } from 'framer-motion'
import { Clock, Star, Play } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface GameCardProps {
  name: string
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
  duration: number
  bestScore?: number
  gradientFrom?: string
  gradientTo?: string
  slug: string
  delay?: number
}

const difficultyColors = {
  easy: 'text-arena-success bg-arena-success/15',
  medium: 'text-arena-warning bg-arena-warning/15',
  hard: 'text-arena-danger bg-arena-danger/15',
}

const categoryGradients: Record<string, [string, string]> = {
  reaction: ['#8B5CF6', '#6366F1'],
  memory: ['#3B82F6', '#06B6D4'],
  typing: ['#22C55E', '#10B981'],
  puzzle: ['#F59E0B', '#EF4444'],
  strategy: ['#EC4899', '#8B5CF6'],
}

export function GameCard({
  name,
  category,
  difficulty,
  duration,
  bestScore,
  slug,
  delay = 0,
}: GameCardProps) {
  const [from, to] = categoryGradients[category] ?? ['#8B5CF6', '#3B82F6']

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="group game-card-hover overflow-hidden rounded-xl border border-arena-border bg-arena-surface"
    >
      {/* Thumbnail gradient */}
      <div
        className="relative h-32 w-full"
        style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
      >
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute bottom-3 left-3 flex gap-1.5">
          <Badge variant="secondary" className="bg-black/40 text-white text-[10px] backdrop-blur-sm border-0">
            {category}
          </Badge>
          <Badge variant="secondary" className={`text-[10px] border-0 ${difficultyColors[difficulty]}`}>
            {difficulty}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-sm font-semibold text-arena-text">{name}</h3>
        <div className="mt-2 flex items-center gap-3 text-xs text-arena-text-muted">
          <span className="flex items-center gap-1">
            <Clock className="size-3" />
            {duration}s
          </span>
          {bestScore !== undefined && (
            <span className="flex items-center gap-1">
              <Star className="size-3 text-arena-warning" />
              {bestScore.toLocaleString()}
            </span>
          )}
        </div>
        <Button
          className="mt-3 w-full gap-2 bg-gradient-primary text-white text-xs h-8"
          onClick={() => {
            window.location.href = `/games/play/${slug}`
          }}
        >
          <Play className="size-3.5" />
          Play Now
        </Button>
      </div>
    </motion.div>
  )
}
