"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Trophy,
  Medal,
  Crown,
  ChevronRight,
  Gamepad2,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { GAMES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const tiers: Record<string, { label: string; color: string; bg: string }> = {
  elite: { label: "Elite", color: "text-amber-400", bg: "bg-amber-400/10" },
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
  tier: string;
  avatarUrl?: string;
}

const leaderboardGames = GAMES.filter((g) => g.id !== "ludo");

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <Crown className="h-5 w-5 text-amber-400" />;
  if (rank === 2) return <Medal className="h-5 w-5 text-gray-300" />;
  if (rank === 3) return <Medal className="h-5 w-5 text-orange-400" />;
  return (
    <span className="flex h-5 w-5 items-center justify-center text-xs font-bold text-arena-text-muted">
      {rank}
    </span>
  );
}

export default function LeaderboardPage() {
  const [activeGame, setActiveGame] = useState(leaderboardGames[0].id);
  const [entries, setEntries] = useState<Record<string, LeaderboardEntry[]>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (entries[activeGame]) return;

    async function fetchLeaderboard() {
      setLoading((prev) => ({ ...prev, [activeGame]: true }));
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("scores")
          .select("score, profiles:user_id(username, display_name, avatar_url, rank_tier)")
          .eq("game_id", activeGame)
          .eq("is_personal_best", true)
          .order("score", { ascending: false })
          .limit(10);

        if (data) {
          const mapped: LeaderboardEntry[] = data.map((row: Record<string, unknown>, i: number) => {
            const profile = row.profiles as Record<string, string> | null;
            return {
              rank: i + 1,
              name: profile?.display_name || profile?.username || "Anonymous",
              score: row.score as number,
              tier: profile?.rank_tier || "bronze",
              avatarUrl: profile?.avatar_url,
            };
          });
          setEntries((prev) => ({ ...prev, [activeGame]: mapped }));
        }
      } catch {
        // silently fail — show empty state
      } finally {
        setLoading((prev) => ({ ...prev, [activeGame]: false }));
      }
    }

    fetchLeaderboard();
  }, [activeGame, entries]);

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
          <Tabs
            defaultValue={leaderboardGames[0].id}
            onValueChange={(v) => setActiveGame(v)}
          >
            <TabsList variant="line" className="mb-8 w-full justify-center">
              {leaderboardGames.map((g) => (
                <TabsTrigger key={g.id} value={g.id}>
                  {g.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {leaderboardGames.map((game) => {
              const gameEntries = entries[game.id] || [];
              const isLoading = loading[game.id];

              return (
                <TabsContent key={game.id} value={game.id}>
                  <div className="rounded-xl border border-arena-border bg-arena-surface overflow-hidden">
                    {/* Table header */}
                    <div className="grid grid-cols-[3rem_1fr_6rem_5rem] sm:grid-cols-[4rem_1fr_7rem_6rem] items-center px-4 sm:px-6 py-3 bg-arena-surface-2 text-xs font-medium text-arena-text-muted uppercase tracking-wider">
                      <span>Rank</span>
                      <span>Player</span>
                      <span className="text-right">Score</span>
                      <span className="text-right">Tier</span>
                    </div>

                    {isLoading ? (
                      <div className="flex items-center justify-center py-16">
                        <Loader2 className="h-6 w-6 animate-spin text-arena-text-muted" />
                      </div>
                    ) : gameEntries.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 text-arena-text-muted">
                        <Trophy className="h-8 w-8 mb-2 opacity-40" />
                        <p className="text-sm">No scores yet. Be the first!</p>
                      </div>
                    ) : (
                      gameEntries.map((entry, idx) => {
                        const tier = tiers[entry.tier] || tiers.bronze;
                        return (
                          <motion.div
                            key={`${entry.name}-${idx}`}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: idx * 0.04 }}
                            className={`grid grid-cols-[3rem_1fr_6rem_5rem] sm:grid-cols-[4rem_1fr_7rem_6rem] items-center px-4 sm:px-6 py-3.5 border-t border-arena-border hover:bg-arena-surface-2/50 transition-colors ${
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
                      })
                    )}
                  </div>
                </TabsContent>
              );
            })}
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
              render={<Link href="/register" />}
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
