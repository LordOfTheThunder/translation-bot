import 'dotenv/config';

export interface AppConfig {
  discordToken: string;
  clientId: string;
  myMemoryEmail?: string;
  defaultTargetLang: string;
  logLevel: string;
}

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export function loadConfig(): AppConfig {
  return {
    discordToken: requireEnv('DISCORD_TOKEN'),
    clientId: requireEnv('CLIENT_ID'),
    myMemoryEmail: process.env['MYMEMORY_EMAIL'] || undefined,
    defaultTargetLang: process.env['DEFAULT_TARGET_LANG'] || 'en',
    logLevel: process.env['LOG_LEVEL'] || 'info',
  };
}
