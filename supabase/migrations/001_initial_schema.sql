-- ============================================================
-- Clutch Arena — Initial Schema Migration
-- ============================================================

-- =========================
-- Extensions
-- =========================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================
-- Helper: updated_at trigger function
-- =========================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =========================
-- Helper: auto-create profile on auth.users insert
-- =========================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'username', 'user_' || substr(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.raw_user_meta_data ->> 'username', 'Player'),
    COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', NULL)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =========================
-- 1. profiles
-- =========================
CREATE TABLE public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username    TEXT NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url  TEXT,
  total_xp    INTEGER NOT NULL DEFAULT 0 CHECK (total_xp >= 0),
  overall_rank INTEGER NOT NULL DEFAULT 0 CHECK (overall_rank >= 0),
  rank_tier   TEXT NOT NULL DEFAULT 'bronze'
              CHECK (rank_tier IN ('bronze','silver','gold','platinum','diamond','master','grandmaster')),
  games_played INTEGER NOT NULL DEFAULT 0 CHECK (games_played >= 0),
  wins        INTEGER NOT NULL DEFAULT 0 CHECK (wins >= 0),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_username ON public.profiles (username);
CREATE INDEX idx_profiles_total_xp ON public.profiles (total_xp DESC);
CREATE INDEX idx_profiles_rank_tier ON public.profiles (rank_tier);
CREATE INDEX idx_profiles_overall_rank ON public.profiles (overall_rank);

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-create profile trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================
-- 2. games
-- =========================
CREATE TABLE public.games (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          TEXT NOT NULL UNIQUE,
  name          TEXT NOT NULL,
  description   TEXT,
  category      TEXT NOT NULL CHECK (category IN ('reaction','memory','typing','puzzle','strategy','trivia')),
  difficulty    TEXT NOT NULL CHECK (difficulty IN ('easy','medium','hard','expert')),
  duration      INTEGER NOT NULL CHECK (duration > 0),
  instructions  TEXT,
  thumbnail_url TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_games_slug ON public.games (slug);
CREATE INDEX idx_games_category ON public.games (category);
CREATE INDEX idx_games_is_active ON public.games (is_active) WHERE is_active = true;

-- =========================
-- 3. game_sessions
-- =========================
CREATE TABLE public.game_sessions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  game_id       UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  challenge_id  UUID,
  started_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at  TIMESTAMPTZ,
  status        TEXT NOT NULL DEFAULT 'active'
                CHECK (status IN ('active','completed','abandoned','expired')),
  session_token UUID NOT NULL UNIQUE DEFAULT gen_random_uuid()
);

CREATE INDEX idx_game_sessions_user_id ON public.game_sessions (user_id);
CREATE INDEX idx_game_sessions_game_id ON public.game_sessions (game_id);
CREATE INDEX idx_game_sessions_status ON public.game_sessions (status);
CREATE INDEX idx_game_sessions_started_at ON public.game_sessions (started_at DESC);

-- =========================
-- 4. scores
-- =========================
CREATE TABLE public.scores (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  game_id         UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  session_id      UUID NOT NULL REFERENCES public.game_sessions(id) ON DELETE CASCADE,
  score           INTEGER NOT NULL CHECK (score >= 0),
  accuracy        NUMERIC(5,2) CHECK (accuracy >= 0 AND accuracy <= 100),
  completion_time NUMERIC(10,3) CHECK (completion_time >= 0),
  metadata        JSONB NOT NULL DEFAULT '{}',
  is_personal_best BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_scores_user_id ON public.scores (user_id);
CREATE INDEX idx_scores_game_id ON public.scores (game_id);
CREATE INDEX idx_scores_session_id ON public.scores (session_id);
CREATE INDEX idx_scores_score ON public.scores (score DESC);
CREATE INDEX idx_scores_created_at ON public.scores (created_at DESC);
CREATE INDEX idx_scores_user_game ON public.scores (user_id, game_id, score DESC);
CREATE INDEX idx_scores_personal_best ON public.scores (user_id, game_id) WHERE is_personal_best = true;

-- =========================
-- 5. daily_challenges
-- =========================
CREATE TABLE public.daily_challenges (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id         UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  challenge_date  DATE NOT NULL UNIQUE,
  configuration   JSONB NOT NULL DEFAULT '{}',
  status          TEXT NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active','completed','cancelled')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_daily_challenges_game_id ON public.daily_challenges (game_id);
CREATE INDEX idx_daily_challenges_date ON public.daily_challenges (challenge_date DESC);
CREATE INDEX idx_daily_challenges_status ON public.daily_challenges (status);

-- =========================
-- 6. daily_challenge_results
-- =========================
CREATE TABLE public.daily_challenge_results (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id  UUID NOT NULL REFERENCES public.daily_challenges(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  score_id      UUID NOT NULL REFERENCES public.scores(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (challenge_id, user_id)
);

CREATE INDEX idx_daily_challenge_results_challenge_id ON public.daily_challenge_results (challenge_id);
CREATE INDEX idx_daily_challenge_results_user_id ON public.daily_challenge_results (user_id);

-- =========================
-- 7. friendships
-- =========================
CREATE TABLE public.friendships (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  addressee_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status        TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending','accepted','declined','blocked')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (requester_id, addressee_id),
  CHECK (requester_id <> addressee_id)
);

CREATE INDEX idx_friendships_requester_id ON public.friendships (requester_id);
CREATE INDEX idx_friendships_addressee_id ON public.friendships (addressee_id);
CREATE INDEX idx_friendships_status ON public.friendships (status);

-- =========================
-- 8. friend_challenges
-- =========================
CREATE TABLE public.friend_challenges (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  opponent_id     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  game_id         UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  challenge_code  TEXT NOT NULL UNIQUE,
  configuration   JSONB NOT NULL DEFAULT '{}',
  status          TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','active','completed','cancelled','expired')),
  expires_at      TIMESTAMPTZ NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_friend_challenges_creator_id ON public.friend_challenges (creator_id);
CREATE INDEX idx_friend_challenges_opponent_id ON public.friend_challenges (opponent_id);
CREATE INDEX idx_friend_challenges_game_id ON public.friend_challenges (game_id);
CREATE INDEX idx_friend_challenges_code ON public.friend_challenges (challenge_code);
CREATE INDEX idx_friend_challenges_status ON public.friend_challenges (status);
CREATE INDEX idx_friend_challenges_expires_at ON public.friend_challenges (expires_at);

-- =========================
-- 9. challenge_results
-- =========================
CREATE TABLE public.challenge_results (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id  UUID NOT NULL REFERENCES public.friend_challenges(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  score_id      UUID NOT NULL REFERENCES public.scores(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_challenge_results_challenge_id ON public.challenge_results (challenge_id);
CREATE INDEX idx_challenge_results_user_id ON public.challenge_results (user_id);

-- =========================
-- 10. achievements
-- =========================
CREATE TABLE public.achievements (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  description TEXT NOT NULL,
  icon        TEXT NOT NULL,
  xp_reward   INTEGER NOT NULL CHECK (xp_reward >= 0),
  category    TEXT NOT NULL CHECK (category IN ('gameplay','social','milestone','challenge','special'))
);

CREATE INDEX idx_achievements_slug ON public.achievements (slug);
CREATE INDEX idx_achievements_category ON public.achievements (category);

-- =========================
-- 11. user_achievements
-- =========================
CREATE TABLE public.user_achievements (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  achievement_id  UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, achievement_id)
);

CREATE INDEX idx_user_achievements_user_id ON public.user_achievements (user_id);
CREATE INDEX idx_user_achievements_achievement_id ON public.user_achievements (achievement_id);

-- =========================
-- 12. subscriptions
-- =========================
CREATE TABLE public.subscriptions (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan                      TEXT NOT NULL DEFAULT 'free'
                            CHECK (plan IN ('free','pro','premium')),
  status                    TEXT NOT NULL DEFAULT 'active'
                            CHECK (status IN ('active','cancelled','expired','past_due')),
  provider                  TEXT CHECK (provider IN ('razorpay','stripe','manual')),
  provider_subscription_id  TEXT,
  current_period_start      TIMESTAMPTZ NOT NULL DEFAULT now(),
  current_period_end        TIMESTAMPTZ NOT NULL DEFAULT now() + INTERVAL '30 days',
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_subscriptions_user_id ON public.subscriptions (user_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions (status);
CREATE INDEX idx_subscriptions_plan ON public.subscriptions (plan);

-- =========================
-- 13. transactions
-- =========================
CREATE TABLE public.transactions (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider                  TEXT NOT NULL CHECK (provider IN ('razorpay','stripe','manual')),
  provider_transaction_id   TEXT NOT NULL,
  amount                    NUMERIC(10,2) NOT NULL CHECK (amount >= 0),
  currency                  TEXT NOT NULL DEFAULT 'INR' CHECK (currency IN ('INR','USD','EUR')),
  status                    TEXT NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending','completed','failed','refunded')),
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_transactions_user_id ON public.transactions (user_id);
CREATE INDEX idx_transactions_status ON public.transactions (status);
CREATE INDEX idx_transactions_created_at ON public.transactions (created_at DESC);
CREATE INDEX idx_transactions_provider ON public.transactions (provider);

-- ============================================================
-- Row Level Security
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_challenge_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friend_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- -------------------------
-- profiles policies
-- -------------------------
CREATE POLICY "profiles_select_all"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- -------------------------
-- games policies
-- -------------------------
CREATE POLICY "games_select_all"
  ON public.games FOR SELECT
  USING (true);

-- -------------------------
-- game_sessions policies
-- -------------------------
CREATE POLICY "game_sessions_select_own"
  ON public.game_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "game_sessions_insert_own"
  ON public.game_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- -------------------------
-- scores policies
-- -------------------------
CREATE POLICY "scores_select_all"
  ON public.scores FOR SELECT
  USING (true);

CREATE POLICY "scores_insert_own"
  ON public.scores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- -------------------------
-- daily_challenges policies
-- -------------------------
CREATE POLICY "daily_challenges_select_all"
  ON public.daily_challenges FOR SELECT
  USING (true);

-- -------------------------
-- daily_challenge_results policies
-- -------------------------
CREATE POLICY "daily_challenge_results_select_all"
  ON public.daily_challenge_results FOR SELECT
  USING (true);

CREATE POLICY "daily_challenge_results_insert_own"
  ON public.daily_challenge_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- -------------------------
-- friendships policies
-- -------------------------
CREATE POLICY "friendships_select_own"
  ON public.friendships FOR SELECT
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

CREATE POLICY "friendships_insert_own"
  ON public.friendships FOR INSERT
  WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "friendships_update_own"
  ON public.friendships FOR UPDATE
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id)
  WITH CHECK (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- -------------------------
-- friend_challenges policies
-- -------------------------
CREATE POLICY "friend_challenges_select_own"
  ON public.friend_challenges FOR SELECT
  USING (auth.uid() = creator_id OR auth.uid() = opponent_id);

CREATE POLICY "friend_challenges_insert_own"
  ON public.friend_challenges FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

-- -------------------------
-- challenge_results policies
-- -------------------------
CREATE POLICY "challenge_results_select_own"
  ON public.challenge_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.friend_challenges fc
      WHERE fc.id = challenge_id
        AND (fc.creator_id = auth.uid() OR fc.opponent_id = auth.uid())
    )
  );

CREATE POLICY "challenge_results_insert_own"
  ON public.challenge_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- -------------------------
-- achievements policies
-- -------------------------
CREATE POLICY "achievements_select_all"
  ON public.achievements FOR SELECT
  USING (true);

-- -------------------------
-- user_achievements policies
-- -------------------------
CREATE POLICY "user_achievements_select_all"
  ON public.user_achievements FOR SELECT
  USING (true);

-- user_achievements inserts are done via service role (no INSERT policy for anon/authenticated)

-- -------------------------
-- subscriptions policies
-- -------------------------
CREATE POLICY "subscriptions_select_own"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- -------------------------
-- transactions policies
-- -------------------------
CREATE POLICY "transactions_select_own"
  ON public.transactions FOR SELECT
  USING (auth.uid() = user_id);
