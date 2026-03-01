export const MYMEMORY_API_URL = 'https://api.mymemory.translated.net/get';

export const MAX_TEXT_LENGTH = 500;
export const CACHE_MAX_ENTRIES = 1000;
export const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

export const DAILY_CHAR_LIMIT_ANONYMOUS = 5_000;
export const DAILY_CHAR_LIMIT_WITH_EMAIL = 50_000;

export const RATE_LIMIT_MAX_REQUESTS_PER_SECOND = 10;

export const EMBED_COLORS = {
  SUCCESS: 0x2ecc71,
  ERROR: 0xe74c3c,
  INFO: 0x3498db,
  WARNING: 0xf39c12,
} as const;

export const BOT_NAME = 'Translation Bot';
