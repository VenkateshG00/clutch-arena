-- Add Ludo game
INSERT INTO games (id, name, slug, description, category, difficulty, min_players, max_players, default_duration, is_active)
VALUES (
  gen_random_uuid(),
  'Ludo',
  'ludo',
  'The classic board game of strategy and luck! Roll the dice, race your tokens home, and capture opponents along the way.',
  'strategy',
  'medium',
  2,
  4,
  300,
  true
) ON CONFLICT (slug) DO NOTHING;

-- Add Ludo-specific achievements
INSERT INTO achievements (id, name, description, icon, category, requirement_type, requirement_value, xp_reward)
VALUES
  (gen_random_uuid(), 'First Blood', 'Capture an opponent token for the first time in Ludo', '⚔️', 'ludo', 'ludo_captures', 1, 15),
  (gen_random_uuid(), 'Ludo Champion', 'Win your first Ludo game', '👑', 'ludo', 'ludo_wins', 1, 25),
  (gen_random_uuid(), 'Ludo Master', 'Win 10 Ludo games', '🏆', 'ludo', 'ludo_wins', 10, 100),
  (gen_random_uuid(), 'Lucky Streak', 'Roll three 6s in a row in Ludo', '🎰', 'ludo', 'ludo_triple_six', 1, 50)
ON CONFLICT DO NOTHING;
