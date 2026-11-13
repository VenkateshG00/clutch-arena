"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Trophy,
  Medal,
  Crown,
  ChevronRight,
  Gamepad2,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const tiers: Record<string, { label: string; color: string; bg: string }> = {
  legend: { label: "Legend", color: "text-amber-400", bg: "bg-amber-400/10" },
  diamond: { label: "Diamond", color: "text-cyan-400", bg: "bg-cyan-400/10" },
  platinum: { label: "Platinum", color: "text-indigo-400", bg: "bg-indigo-400/10" },
  gold: { label: "Gold", color: "text-yellow-500", bg: "bg-yellow-500/10" },
  silver: { label: "Silver", color: "text-gray-400", bg: "bg-gray-400/10" },
  bronze: { label: "Bronze", color: "text-orange-400", bg: "bg-orange-400/10" },
};

interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  tier: keyof typeof tiers;
  gamesPlayed: number;
}

const mockData: Record<string, LeaderboardEntry[]> = {
  "color-snap": [
    { rank: 1, name: "FlashFinger", score: 2450, tier: "legend", gamesPlayed: 342 },
    { rank: 2, name: "PixelQueen", score: 2380, tier: "legend", gamesPlayed: 298 },
    { rank: 3, name: "NeonDash", score: 2210, tier: "diamond", gamesPlayed: 415 },
    { rank: 4, name: "ChromaKing", score: 2105, tier: "diamond", gamesPlayed: 267 },
    { rank: 5, name: "SnapMaster", score: 1980, tier: "platinum", gamesPlayed: 189 },
    { rank: 6, name: "VividStrike", score: 1920, tier: "platinum", gamesPlayed: 312 },
    { rank: 7, name: "HueHunter", score: 1845, tier: "gold", gamesPlayed: 224 },
    { rank: 8, name: "BlitzCaster", score: 1790, tier: "gold", gamesPlayed: 156 },
    { rank: 9, name: "SpectrumAce", score: 1720, tier: "gold", gamesPlayed: 198 },
    { rank: 10, name: "PrismPlayer", score: 1650, tier: "silver", gamesPlayed: 143 },
  ],
  "memory-matrix": [
    { rank: 1, name: "MindVault", score: 3200, tier: "legend", gamesPlayed: 520 },
    { rank: 2, name: "RecallPro", score: 3050, tier: "legend", gamesPlayed: 478 },
    { rank: 3, name: "GridGenius", score: 2890, tier: "diamond", gamesPlayed: 356 },
    { rank: 4, name: "NeuroNinja", score: 2780, tier: "diamond", gamesPlayed: 410 },
    { rank: 5, name: "PatternKing", score: 2650, tier: "platinum", gamesPlayed: 289 },
    { rank: 6, name: "CortexAce", score: 2540, tier: "platinum", gamesPlayed: 367 },
    { rank: 7, name: "MemoryLane", score: 2430, tier: "gold", gamesPlayed: 234 },
    { rank: 8, name: "SynapseX", score: 2350, tier: "gold", gamesPlayed: 198 },
    { rank: 9, name: "ThinkTank", score: 2210, tier: "gold", gamesPlayed: 176 },
    { rank: 10, name: "PuzzleBrain", score: 2100, tier: "silver", gamesPlayed: 145 },
  ],
  typeclash: [
    { rank: 1, name: "KeyStorm", score: 1870, tier: "legend", gamesPlayed: 612 },
    { rank: 2, name: "TypeRacer", score: 1820, tier: "legend", gamesPlayed: 548 },
    { rank: 3, name: "SwiftKeys", score: 1750, tier: "diamond", gamesPlayed: 490 },
    { rank: 4, name: "WordBlitz", score: 1690, tier: "diamond", gamesPlayed: 423 },
    { rank: 5, name: "AlphaType", score: 1620, tier: "platinum", gamesPlayed: 378 },
    { rank: 6, name: "FingerFury", score: 1560, tier: "platinum", gamesPlayed: 302 },
    { rank: 7, name: "ClickClash", score: 1490, tier: "gold", gamesPlayed: 256 },
    { rank: 8, name: "VelocityV", score: 1430, tier: "gold", gamesPlayed: 234 },
    { rank: 9, name: "QuickType", score: 1370, tier: "gold", gamesPlayed: 189 },
    { rank: 10, name: "PrecisionX", score: 1310, tier: "silver", gamesPlayed: 167 },
  ],
};

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1)
    return <Crown className="h-5 w-5 text-amber-400" />;
  if (rank === 2)
    return <Medal className="h-5 w-5 text-gray-300" />;
  if (rank === 3)
    return <Medal className="h-5 w-5 text-orange-400" />;
  return (
    <span className="flex h-5 w-5 items-center justify-center text-xs font-bold text-arena-text-muted">
      {rank}
    </span>
  );
}

export default function LeaderboardPage() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <Badge
            variant="outline"
            className="mb-4 border-amber-400/30 bg-amber-400/10 text-amber-400"
          >
            <Trophy className="mr-1 h-3 w-3" /> Global Rankings
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-arena-text">
            Leaderboard
          </h1>
          <p className="mt-4 text-lg text-arena-text-muted max-w-xl mx-auto">
            The top players across all game modes. Sign up to see where you rank.
          </p>
        </motion.div>

        {/* Game tabs + table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <Tabs defaultValue="color-snap">
            <TabsList variant="line" className="mb-8 w-full justify-center">
              <TabsTrigger value="color-snap">Color Snap</TabsTrigger>
              <TabsTrigger value="memory-matrix">Memory Matrix</TabsTrigger>
              <TabsTrigger value="typeclash">TypeClash</TabsTrigger>
            </TabsList>

            {Object.entries(mockData).map(([gameKey, entries]) => (
              <TabsContent key={gameKey} value={gameKey}>
                <div className="rounded-xl border border-arena-border bg-arena-surface overflow-hidden">
                  {/* Table header */}
                  <div className="grid grid-cols-[3rem_1fr_6rem_6rem_5rem] sm:grid-cols-[4rem_1fr_7rem_7rem_6rem] items-center px-4 sm:px-6 py-3 bg-arena-surface-2 text-xs font-medium text-arena-text-muted uppercase tracking-wider">
                    <span>Rank</span>
                    <span>Player</span>
                    <span className="text-right">Score</span>
                    <span className="text-right hidden sm:block">Games</span>
                    <span className="text-right">Tier</span>
                  </div>

                  {/* Rows */}
                  {entries.map((entry, idx) => {
                    const tier = tiers[entry.tier];
                    return (
                      <motion.div
                        key={entry.name}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.04 }}
                        className={`grid grid-cols-[3rem_1fr_6rem_6rem_5rem] sm:grid-cols-[4rem_1fr_7rem_7rem_6rem] items-center px-4 sm:px-6 py-3.5 border-t border-arena-border hover:bg-arena-surface-2/50 transition-colors ${
                          entry.rank <= 3 ? "bg-arena-surface-2/30" : ""
                        }`}
                      >
                        <div className="flex items-center">
                          <RankIcon rank={entry.rank} />
                        </div>
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="h-8 w-8 shrink-0 rounded-full bg-gradient-primary flex items-center justify-center text-xs font-bold text-white">
                            {entry.name[0]}
                          </div>
                          <span className="font-medium text-arena-text truncate text-sm">
                            {entry.name}
                          </span>
                        </div>
                        <span className="text-right font-semibold text-arena-text text-sm tabular-nums">
                          {entry.score.toLocaleString()}
                        </span>
                        <span className="text-right text-arena-text-muted text-sm tabular-nums hidden sm:block">
                          {entry.gamesPlayed}
                        </span>
                        <div className="flex justify-end">
                          <Badge
                            variant="outline"
                            className={`${tier.bg} ${tier.color} border-transparent text-[10px]`}
                          >
                            {tier.label}
                          </Badge>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12 text-center"
        >
          <div className="rounded-2xl border border-arena-border bg-arena-surface p-8 sm:p-10">
            <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-arena-primary/10">
              <TrendingUp className="h-7 w-7 text-arena-primary" />
            </div>
            <h3 className="text-2xl font-bold text-arena-text">
              Want to see your name up here?
            </h3>
            <p className="mt-2 text-arena-text-muted max-w-md mx-auto">
              Create a free account and start competing. Your first clutch moment is one game away.
            </p>
            <Button
              className="mt-6 h-12 px-8 bg-gradient-primary hover:opacity-90 text-white font-semibold glow-primary"
              render={<Link href="/signup" />}
            >
              <Gamepad2 className="mr-2 h-5 w-5" />
              Start Competing
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
