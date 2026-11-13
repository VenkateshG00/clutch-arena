-- Add Ludo game
INSERT INTO games (id, name, slug, description, category, difficulty, duration, instructions, is_active)
VALUES (
  gen_random_uuid(),
  'Ludo',
  'ludo',
  'The classic board game of strategy and luck! Roll the dice, race your tokens home, and capture opponents along the way.',
  'strategy',
  'medium',
  300,
  'Roll a 6 to bring tokens out of base. Move tokens clockwise around the board. Land on opponent tokens to send them back. Get all 4 tokens to the finish to win. Rolling a 6 gives you an extra turn.',
  true
) ON CONFLICT (slug) DO NOTHING;

-- Add Ludo-specific achievements
INSERT INTO achievements (id, slug, name, description, icon, category, xp_reward)
VALUES
  (gen_random_uuid(), 'ludo-first-blood', 'First Blood', 'Capture an opponent token for the first time in Ludo', '⚔️', 'gameplay', 15),
  (gen_random_uuid(), 'ludo-champion', 'Ludo Champion', 'Win your first Ludo game', '👑', 'milestone', 25),
  (gen_random_uuid(), 'ludo-master', 'Ludo Master', 'Win 10 Ludo games', '🏆', 'milestone', 100),
  (gen_random_uuid(), 'ludo-lucky-streak', 'Lucky Streak', 'Roll three 6s in a row in Ludo', '🎰', 'special', 50)
ON CONFLICT (slug) DO NOTHING;
