-- CanBam Database Schema
-- Run this in your Neon console after creating a database

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Boards table (stores entire board as JSONB)
CREATE TABLE IF NOT EXISTS boards (
  uid TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  owner_id TEXT NOT NULL,
  data JSONB NOT NULL, -- Stores description, members, columns, cards
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for querying boards by member email
CREATE INDEX IF NOT EXISTS idx_boards_members ON boards USING GIN ((data->'members'));
CREATE INDEX IF NOT EXISTS idx_boards_owner ON boards(owner_id);
