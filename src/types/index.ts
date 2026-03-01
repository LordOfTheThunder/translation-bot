import type { TranslationService } from '../services/translation.service.js';
import type { DetectionService } from '../services/detection.service.js';
import type { PreferencesService } from '../services/preferences.service.js';
import type { CacheService } from '../services/cache.service.js';
import type { RateLimiterService } from '../services/rate-limiter.service.js';
import type { AppConfig } from '../config.js';
import type { Logger } from 'pino';

export interface ServiceContainer {
  config: AppConfig;
  logger: Logger;
  cache: CacheService;
  rateLimiter: RateLimiterService;
  translation: TranslationService;
  detection: DetectionService;
  preferences: PreferencesService;
}

export * from './translation.js';
export * from './preferences.js';
export * from './commands.js';
export * from './errors.js';
