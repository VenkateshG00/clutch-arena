-- ============================================================
-- Clutch Arena — Seed Data
-- ============================================================

-- =========================
-- Games
-- =========================
INSERT INTO public.games (slug, name, description, category, difficulty, duration, instructions, thumbnail_url, is_active)
VALUES
  (
    'color-snap',
    'Color Snap',
    'Test your reflexes! Tap the correct color as fast as you can before time runs out.',
    'reaction',
    'medium',
    45,
    'A color will flash on screen. Tap the matching color button as quickly as possible. Faster responses earn more points. Wrong answers lose points.',
    '/images/games/color-snap.webp',
    true
  ),
  (
    'memory-matrix',
    'Memory Matrix',
    'Challenge your memory by remembering and reproducing increasingly complex grid patterns.',
    'memory',
    'medium',
    120,
    'Watch the pattern light up on the grid, then reproduce it from memory. Each round adds more tiles. Score is based on accuracy and speed.',
    '/images/games/memory-matrix.webp',
    true
  ),
  (
    'type-clash',
    'TypeClash',
    'Race against the clock to type words and phrases with perfect accuracy.',
    'typing',
    'easy',
    60,
    'Type the displayed words as fast and accurately as you can. Each correct word earns points. Accuracy multiplier boosts your final score.',
    '/images/games/type-clash.webp',
    true
  ),
  (
    'ludo',
    'Ludo',
    'The classic board game of strategy and luck! Roll the dice, race your tokens home, and capture opponents along the way.',
    'strategy',
    'medium',
    300,
    'Roll a 6 to bring tokens out of base. Move tokens clockwise around the board. Land on opponent tokens to send them back. Get all 4 tokens to the finish to win. Rolling a 6 gives you an extra turn.',
    '/images/games/ludo.webp',
    true
  );

-- =========================
-- Achievements
-- =========================
INSERT INTO public.achievements (slug, name, description, icon, xp_reward, category)
VALUES
  (
    'first-game',
    'First Game',
    'Complete your very first game on Clutch Arena.',
    'trophy',
    50,
    'milestone'
  ),
  (
    'first-win',
    'First Win',
    'Win a challenge against another player for the first time.',
    'medal',
    100,
    'gameplay'
  ),
  (
    'speed-demon',
    'Speed Demon',
    'Complete any game in under 10 seconds with a score above 80%.',
    'zap',
    200,
    'gameplay'
  ),
  (
    'perfect-score',
    'Perfect Score',
    'Achieve 100% accuracy in any game.',
    'star',
    300,
    'gameplay'
  ),
  (
    'ten-games',
    '10 Games',
    'Play 10 games on Clutch Arena.',
    'gamepad',
    150,
    'milestone'
  ),
  (
    'fifty-games',
    '50 Games',
    'Play 50 games on Clutch Arena. You are a true arena warrior!',
    'flame',
    500,
    'milestone'
  ),
  (
    'daily-streak-7',
    'Daily Streak 7',
    'Complete the daily challenge 7 days in a row.',
    'calendar',
    400,
    'challenge'
  ),
  (
    'top-10-weekly',
    'Top 10 Weekly',
    'Finish in the top 10 of a weekly leaderboard.',
    'crown',
    350,
    'challenge'
  ),
  (
    'friend-challenger',
    'Friend Challenger',
    'Send your first friend challenge.',
    'users',
    75,
    'social'
  ),
  (
    'score-hunter',
    'Score Hunter',
    'Beat your own personal best 5 times.',
    'target',
    250,
    'gameplay'
  );
