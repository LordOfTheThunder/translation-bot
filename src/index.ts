import { loadConfig } from './config.js';
import { createLogger } from './utils/logger.js';
import { initDatabase } from './storage/database.js';
import { UserPreferencesRepository } from './storage/repositories/user-preferences.repo.js';
import { ServerSettingsRepository } from './storage/repositories/server-settings.repo.js';
import { AutoTranslateRepository } from './storage/repositories/auto-translate.repo.js';
import { CacheService } from './services/cache.service.js';
import { RateLimiterService } from './services/rate-limiter.service.js';
import { TranslationService } from './services/translation.service.js';
import { DetectionService } from './services/detection.service.js';
import { PreferencesService } from './services/preferences.service.js';
import { createClient } from './bot/client.js';
import { registerReadyEvent } from './bot/events/ready.js';
import { registerInteractionCreateEvent } from './bot/events/interactionCreate.js';
import { registerMessageCreateEvent } from './bot/events/messageCreate.js';
import { registerMessageReactionAddEvent } from './bot/events/messageReactionAdd.js';
import { commands } from './commands/index.js';
import {
  CACHE_MAX_ENTRIES,
  CACHE_TTL_MS,
  DAILY_CHAR_LIMIT_ANONYMOUS,
  DAILY_CHAR_LIMIT_WITH_EMAIL,
  RATE_LIMIT_MAX_REQUESTS_PER_SECOND,
} from './utils/constants.js';
import type { ServiceContainer } from './types/index.js';

async function main(): Promise<void> {
  const config = loadConfig();
  const logger = createLogger(config.logLevel);

  logger.info('Starting Translation Bot...');

  const db = initDatabase();
  const userPreferencesRepo = new UserPreferencesRepository(db);
  const serverSettingsRepo = new ServerSettingsRepository(db);
  const autoTranslateRepo = new AutoTranslateRepository(db);

  const cache = new CacheService({ max: CACHE_MAX_ENTRIES, ttl: CACHE_TTL_MS });
  const rateLimiter = new RateLimiterService({
    dailyCharLimit: config.myMemoryEmail ? DAILY_CHAR_LIMIT_WITH_EMAIL : DAILY_CHAR_LIMIT_ANONYMOUS,
    maxRequestsPerSecond: RATE_LIMIT_MAX_REQUESTS_PER_SECOND,
  });
  const translation = new TranslationService({
    cache,
    rateLimiter,
    email: config.myMemoryEmail,
  });
  const detection = new DetectionService();
  const preferences = new PreferencesService(
    userPreferencesRepo,
    serverSettingsRepo,
    autoTranslateRepo,
    config.defaultTargetLang,
  );

  const services: ServiceContainer = {
    config,
    logger,
    cache,
    rateLimiter,
    translation,
    detection,
    preferences,
  };

  const client = createClient();

  registerReadyEvent(client, logger);
  registerInteractionCreateEvent(client, commands, services);
  registerMessageCreateEvent(client, services);
  registerMessageReactionAddEvent(client, services);

  await client.login(config.discordToken);

  const shutdown = () => {
    logger.info('Shutting down...');
    client.destroy();
    db.close();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
