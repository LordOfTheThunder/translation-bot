CREATE TABLE IF NOT EXISTS user_preferences (
  user_id TEXT PRIMARY KEY,
  default_target_lang TEXT NOT NULL DEFAULT 'en',
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS server_settings (
  guild_id TEXT PRIMARY KEY,
  default_target_lang TEXT NOT NULL DEFAULT 'en',
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS auto_translate_channels (
  channel_id TEXT PRIMARY KEY,
  guild_id TEXT NOT NULL,
  target_lang TEXT NOT NULL DEFAULT 'en',
  enabled INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
