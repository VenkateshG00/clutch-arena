"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import {
  Zap,
  Globe,
  CalendarDays,
  Swords,
  Trophy,
  Crown,
  Palette,
  BrainCircuit,
  Keyboard,
  ArrowRight,
  Play,
  Star,
  Timer,
  Users,
  Gamepad2,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/* ------------------------------------------------------------------ */
/*  Animated counter                                                   */
/* ------------------------------------------------------------------ */
function AnimatedCounter({
  target,
  suffix = "",
  prefix = "",
  duration = 2000,
}: {
  target: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target, duration]);

  return (
    <span ref={ref}>
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Scroll-reveal wrapper                                              */
/* ------------------------------------------------------------------ */
function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */
const features = [
  {
    icon: Zap,
    title: "Quick Games",
    desc: "60-second matches built for adrenaline. Jump in, compete, done.",
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
  },
  {
    icon: Globe,
    title: "Global Rankings",
    desc: "Climb the worldwide leaderboard and prove you're the best.",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
  },
  {
    icon: CalendarDays,
    title: "Daily Challenges",
    desc: "New challenges every day. Streak rewards keep you coming back.",
    color: "text-green-400",
    bg: "bg-green-400/10",
  },
  {
    icon: Swords,
    title: "Friend Battles",
    desc: "Challenge your friends head-to-head in real-time duels.",
    color: "text-red-400",
    bg: "bg-red-400/10",
  },
  {
    icon: Trophy,
    title: "Achievements",
    desc: "Unlock badges and titles as you master each game mode.",
    color: "text-purple-400",
    bg: "bg-purple-400/10",
  },
  {
    icon: Crown,
    title: "Premium Rewards",
    desc: "Exclusive cosmetics, profile themes, and bragging rights.",
    color: "text-amber-400",
    bg: "bg-amber-400/10",
  },
];

const games = [
  {
    icon: Palette,
    title: "Color Snap",
    desc: "Test your reflexes! Tap the correct color before time runs out. Speed and accuracy determine your rank.",
    color: "from-pink-500 to-orange-400",
    badge: "Reflex",
    duration: "30s",
  },
  {
    icon: BrainCircuit,
    title: "Memory Matrix",
    desc: "Memorize the grid pattern then recreate it. Each level adds complexity. How far can you go?",
    color: "from-cyan-500 to-blue-500",
    badge: "Memory",
    duration: "60s",
  },
  {
    icon: Keyboard,
    title: "TypeClash",
    desc: "Type faster than your opponents in real-time races. Accuracy matters as much as speed.",
    color: "from-green-400 to-emerald-500",
    badge: "Speed",
    duration: "45s",
  },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default function LandingPage() {
  return (
    <>
      {/* ====== HERO ====== */}
      <section className="relative overflow-hidden py-20 sm:py-32 lg:py-40">
        {/* Background effects */}
        <div className="pointer-events-none absolute inset-0">
          {/* Gradient orbs */}
          <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-arena-primary/20 blur-[120px]" />
          <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-arena-secondary/20 blur-[120px]" />
          {/* Grid */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center">
            {/* Pill badge */}
            <Reveal>
              <Badge
                variant="outline"
                className="mb-6 border-arena-primary/30 bg-arena-primary/10 text-arena-primary-light px-4 py-1.5 text-xs tracking-wide uppercase"
              >
                <Star className="mr-1 h-3 w-3" /> Season 1 is Live
              </Badge>
            </Reveal>

            {/* Main heading */}
            <Reveal delay={0.1}>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1]">
                <span className="text-arena-text">Play Quick. Beat Everyone.</span>
                <br />
                <span className="text-arena-text">Climb the Ranks.</span>
              </h1>
            </Reveal>

            {/* Animated title */}
            <Reveal delay={0.2}>
              <motion.h2
                className="mt-4 text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter text-gradient-primary"
                animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                style={{
                  backgroundImage:
                    "linear-gradient(90deg, #8B5CF6, #3B82F6, #22C55E, #8B5CF6)",
                  backgroundSize: "200% 100%",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                CLUTCH ARENA
              </motion.h2>
            </Reveal>

            {/* Subtitle */}
            <Reveal delay={0.3}>
              <p className="mt-6 max-w-2xl text-lg sm:text-xl text-arena-text-muted leading-relaxed">
                Compete in lightning-fast mini-games, dominate global leaderboards,
                and earn your place among the elite. Free to play, impossible to put down.
              </p>
            </Reveal>

            {/* CTA buttons */}
            <Reveal delay={0.4}>
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Button
                  className="h-12 px-8 text-base font-semibold bg-gradient-primary hover:opacity-90 text-white glow-primary"
                  render={<Link href="/signup" />}
                >
                  <Play className="mr-2 h-5 w-5" />
                  Start Playing
                </Button>
                <Button
                  variant="outline"
                  className="h-12 px-8 text-base font-semibold border-arena-border text-arena-text hover:bg-white/5"
                  render={<Link href="/explore" />}
                >
                  View Games
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </Reveal>

            {/* Floating game preview cards */}
            <Reveal delay={0.5} className="mt-16 w-full max-w-4xl">
              <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-4">
                {games.map((game, i) => (
                  <motion.div
                    key={game.title}
                    animate={{ y: [0, -8, 0] }}
                    transition={{
                      duration: 3,
                      delay: i * 0.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="group relative rounded-xl border border-arena-border bg-arena-surface/80 backdrop-blur-sm p-5 game-card-hover"
                  >
                    <div
                      className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${game.color}`}
                    >
                      <game.icon className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-arena-text">{game.title}</h3>
                    <p className="mt-1 text-xs text-arena-text-muted line-clamp-2">
                      {game.desc}
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <Badge variant="secondary" className="text-[10px] bg-arena-surface-2 text-arena-text-muted">
                        {game.badge}
                      </Badge>
                      <span className="text-[10px] text-arena-text-muted flex items-center gap-1">
                        <Timer className="h-3 w-3" /> {game.duration}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ====== FEATURES ====== */}
      <section className="py-20 sm:py-28 bg-arena-surface/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-arena-primary/30 bg-arena-primary/10 text-arena-primary-light">
              Features
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-arena-text">
              Everything You Need to{" "}
              <span className="text-gradient-primary">Dominate</span>
            </h2>
            <p className="mt-4 text-arena-text-muted max-w-xl mx-auto">
              Built from the ground up for competitive gamers who live for the thrill of the clutch.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <Reveal key={f.title} delay={i * 0.08}>
                <div className="group relative rounded-xl border border-arena-border bg-arena-surface p-6 transition-all hover:border-arena-primary/30 hover:bg-arena-surface-2 game-card-hover h-full">
                  <div
                    className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${f.bg}`}
                  >
                    <f.icon className={`h-6 w-6 ${f.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-arena-text">{f.title}</h3>
                  <p className="mt-2 text-sm text-arena-text-muted leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ====== GAMES PREVIEW ====== */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-arena-secondary/30 bg-arena-secondary/10 text-arena-secondary">
              Games
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-arena-text">
              Choose Your <span className="text-gradient-primary">Battlefield</span>
            </h2>
            <p className="mt-4 text-arena-text-muted max-w-xl mx-auto">
              Three distinct games, each testing a different skill. Master all three to earn the ultimate rank.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {games.map((game, i) => (
              <Reveal key={game.title} delay={i * 0.1}>
                <div className="group relative overflow-hidden rounded-2xl border border-arena-border bg-arena-surface game-card-hover h-full flex flex-col">
                  {/* Gradient header */}
                  <div
                    className={`relative h-40 bg-gradient-to-br ${game.color} flex items-center justify-center`}
                  >
                    <game.icon className="h-16 w-16 text-white/80" />
                    <div className="absolute inset-0 bg-black/20" />
                  </div>
                  <div className="flex flex-col flex-1 p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xl font-bold text-arena-text">{game.title}</h3>
                      <Badge variant="secondary" className="bg-arena-surface-2 text-arena-text-muted text-xs">
                        {game.badge}
                      </Badge>
                    </div>
                    <p className="text-sm text-arena-text-muted leading-relaxed flex-1">
                      {game.desc}
                    </p>
                    <div className="flex items-center justify-between mt-5">
                      <span className="text-xs text-arena-text-muted flex items-center gap-1">
                        <Timer className="h-3.5 w-3.5" /> {game.duration} per round
                      </span>
                      <Button
                        size="sm"
                        className="bg-gradient-primary hover:opacity-90 text-white text-xs"
                        render={<Link href="/explore" />}
                      >
                        Play Now <ChevronRight className="ml-1 h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ====== STATS ====== */}
      <section className="py-20 sm:py-28 bg-arena-surface/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-arena-text">
              The Arena is <span className="text-gradient-primary">Growing</span>
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { value: 10000, suffix: "+", label: "Active Players", icon: Users, prefix: "" },
              { value: 50000, suffix: "+", label: "Games Played", icon: Gamepad2, prefix: "" },
              { value: 3, suffix: "", label: "Mini-Games", icon: Trophy, prefix: "" },
            ].map((stat, i) => (
              <Reveal key={stat.label} delay={i * 0.1}>
                <div className="relative rounded-xl border border-arena-border bg-arena-surface p-8 text-center game-card-hover">
                  <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-arena-primary/10">
                    <stat.icon className="h-7 w-7 text-arena-primary" />
                  </div>
                  <div className="text-4xl sm:text-5xl font-extrabold text-arena-text">
                    <AnimatedCounter
                      target={stat.value}
                      suffix={stat.suffix}
                      prefix={stat.prefix}
                      duration={stat.value > 100 ? 2000 : 1000}
                    />
                  </div>
                  <p className="mt-2 text-sm text-arena-text-muted">{stat.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ====== FINAL CTA ====== */}
      <section className="py-20 sm:py-28 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-arena-primary/10 blur-[150px]" />
        </div>
        <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <Reveal>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-arena-text leading-tight">
              Ready to{" "}
              <span className="text-gradient-primary">Compete?</span>
            </h2>
            <p className="mt-6 text-lg text-arena-text-muted max-w-xl mx-auto">
              Join thousands of players battling for the top spot. It only takes one clutch moment to change everything.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                className="h-14 px-10 text-lg font-semibold bg-gradient-primary hover:opacity-90 text-white glow-primary"
                render={<Link href="/signup" />}
              >
                <Gamepad2 className="mr-2 h-6 w-6" />
                Create Free Account
              </Button>
            </div>
            <p className="mt-4 text-xs text-arena-text-muted">
              No credit card required. Play instantly.
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
