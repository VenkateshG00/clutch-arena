"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Palette,
  BrainCircuit,
  Keyboard,
  Dice5,
  Timer,
  Star,
  TrendingUp,
  ChevronRight,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const games = [
  {
    id: "color-snap",
    icon: Palette,
    title: "Color Snap",
    description:
      "A rapid-fire reflex challenge. Colors flash on screen and you must tap the matching color before the timer runs out. As rounds progress, the speed increases and distractors multiply. Only the sharpest reflexes survive.",
    difficulty: "Easy",
    difficultyColor: "bg-arena-success/10 text-arena-success border-arena-success/30",
    duration: "30 seconds",
    category: "Reflex",
    gradient: "from-pink-500 to-orange-400",
    bestScore: 2450,
    topPlayer: "FlashFinger",
  },
  {
    id: "memory-matrix",
    icon: BrainCircuit,
    title: "Memory Matrix",
    description:
      "A pattern-recall game that pushes your short-term memory to the limit. A grid lights up in a specific pattern, then goes dark. Recreate it from memory. Each level adds more tiles and complexity. Precision and focus are your weapons.",
    difficulty: "Medium",
    difficultyColor: "bg-arena-warning/10 text-arena-warning border-arena-warning/30",
    duration: "60 seconds",
    category: "Memory",
    gradient: "from-cyan-500 to-blue-500",
    bestScore: 3200,
    topPlayer: "MindVault",
  },
  {
    id: "typeclash",
    icon: Keyboard,
    title: "TypeClash",
    description:
      "A competitive typing arena where speed and accuracy collide. Race against others to type words, sentences, and code snippets as fast as possible. Mistakes cost time. The leaderboard rewards those who combine velocity with precision.",
    difficulty: "Hard",
    difficultyColor: "bg-arena-danger/10 text-arena-danger border-arena-danger/30",
    duration: "45 seconds",
    category: "Speed",
    gradient: "from-green-400 to-emerald-500",
    bestScore: 1870,
    topPlayer: "KeyStorm",
  },
  {
    id: "ludo",
    icon: Dice5,
    title: "Ludo",
    description:
      "The classic board game reimagined for competitive play. Roll the dice, race your tokens around the board, and send opponents back to base. Strategic decisions at every turn — do you play safe or go for the capture? Play against smart AI opponents.",
    difficulty: "Medium",
    difficultyColor: "bg-arena-warning/10 text-arena-warning border-arena-warning/30",
    duration: "5 minutes",
    category: "Strategy",
    gradient: "from-purple-500 to-indigo-500",
    bestScore: 980,
    topPlayer: "DiceMaster",
  },
];

export default function GamesPage() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <Badge
            variant="outline"
            className="mb-4 border-arena-secondary/30 bg-arena-secondary/10 text-arena-secondary"
          >
            Game Library
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-arena-text">
            Choose Your <span className="text-gradient-primary">Arena</span>
          </h1>
          <p className="mt-4 text-lg text-arena-text-muted max-w-xl mx-auto">
            Four unique games, each testing a different skill. Master them all and claim the top rank.
          </p>
        </motion.div>

        {/* Game Cards */}
        <div className="space-y-8">
          {games.map((game, i) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="group relative overflow-hidden rounded-2xl border border-arena-border bg-arena-surface game-card-hover"
            >
              <div className="flex flex-col lg:flex-row">
                {/* Left gradient visual */}
                <div
                  className={`relative flex items-center justify-center bg-gradient-to-br ${game.gradient} lg:w-72 h-48 lg:h-auto shrink-0`}
                >
                  <game.icon className="h-20 w-20 text-white/80" />
                  <div className="absolute inset-0 bg-black/20" />
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col p-6 sm:p-8">
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-bold text-arena-text">
                        {game.title}
                      </h2>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <Badge
                          variant="outline"
                          className={game.difficultyColor}
                        >
                          {game.difficulty}
                        </Badge>
                        <Badge variant="secondary" className="bg-arena-surface-2 text-arena-text-muted text-xs">
                          {game.category}
                        </Badge>
                        <span className="text-xs text-arena-text-muted flex items-center gap-1">
                          <Timer className="h-3.5 w-3.5" /> {game.duration}
                        </span>
                      </div>
                    </div>
                    <Button
                      className="bg-gradient-primary hover:opacity-90 text-white font-semibold"
                      render={<Link href={`/games/play/${game.id}`} />}
                    >
                      Play Now <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>

                  <p className="text-sm text-arena-text-muted leading-relaxed flex-1">
                    {game.description}
                  </p>

                  {/* Mock best score */}
                  <div className="mt-6 flex flex-wrap items-center gap-6 pt-4 border-t border-arena-border">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-arena-primary" />
                      <span className="text-xs text-arena-text-muted">
                        Global Best:{" "}
                        <span className="font-semibold text-arena-text">
                          {game.bestScore.toLocaleString()}
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-amber-400" />
                      <span className="text-xs text-arena-text-muted">
                        Top Player:{" "}
                        <span className="font-semibold text-arena-text">
                          {game.topPlayer}
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-arena-success" />
                      <span className="text-xs text-arena-text-muted">
                        Trending
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
