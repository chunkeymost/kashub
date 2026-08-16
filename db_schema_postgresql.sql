-- =============================================
-- Kasku - PostgreSQL Schema for Supabase
-- =============================================

-- Enable uuid extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabel plans
CREATE TABLE IF NOT EXISTS plans (
  id BIGINT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(200) NOT NULL,
  target_amount INT NOT NULL,
  mode VARCHAR(10) CHECK (mode IN ('date','monthly')) NOT NULL,
  target_date DATE DEFAULT NULL,
  monthly_fixed INT DEFAULT 0,
  purchase_link VARCHAR(500) DEFAULT NULL,
  evidence TEXT DEFAULT NULL,
  created_at DATE NOT NULL DEFAULT CURRENT_DATE
);

-- Tabel transactions
CREATE TABLE IF NOT EXISTS transactions (
  id BIGINT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  type VARCHAR(10) CHECK (type IN ('income','expense','saving')) NOT NULL,
  category VARCHAR(100) NOT NULL,
  amount INT NOT NULL,
  note TEXT DEFAULT NULL,
  plan_id BIGINT DEFAULT NULL,
  evidence TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- Enable RLS (Row Level Security)
-- =============================================

ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS Policies - plans
-- =============================================

CREATE POLICY "Users can view own plans"
  ON plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own plans"
  ON plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own plans"
  ON plans FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own plans"
  ON plans FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- RLS Policies - transactions
-- =============================================

CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions"
  ON transactions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions"
  ON transactions FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- Indexes for performance
-- =============================================

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_plan_id ON transactions(plan_id);
CREATE INDEX IF NOT EXISTS idx_plans_user_id ON plans(user_id);
CREATE INDEX IF NOT EXISTS idx_plans_created_at ON plans(created_at DESC);
