import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { initDatabase } from '../../src/storage/database.js';
import { UserPreferencesRepository } from '../../src/storage/repositories/user-preferences.repo.js';
import { ServerSettingsRepository } from '../../src/storage/repositories/server-settings.repo.js';
import { AutoTranslateRepository } from '../../src/storage/repositories/auto-translate.repo.js';
import { CacheService } from '../../src/services/cache.service.js';
import { RateLimiterService } from '../../src/services/rate-limiter.service.js';
import { TranslationService } from '../../src/services/translation.service.js';
import { DetectionService } from '../../src/services/detection.service.js';
import { PreferencesService } from '../../src/services/preferences.service.js';
import type Database from 'better-sqlite3';

function createMyMemoryResponse(translatedText: string, source: string, target: string, match = 1.0) {
  return {
    responseData: { translatedText, match },
    responseStatus: 200,
    responseDetails: 'OK',
    matches: [
      {
        id: '1',
        segment: '',
        translation: translatedText,
        source,
        target,
        quality: 100,
        reference: null,
        'usage-count': 1,
        subject: 'All',
        'created-by': '',
        'last-updated-by': '',
        'create-date': '2024-01-01',
        'last-update-date': '2024-01-01',
        match,
      },
    ],
  };
}

describe('Translation flow integration', () => {
  let db: Database.Database;
  let cache: CacheService;
  let rateLimiter: RateLimiterService;
  let translationService: TranslationService;
  let detectionService: DetectionService;
  let preferencesService: PreferencesService;
  let fetchMock: jest.SpiedFunction<typeof global.fetch>;

  beforeEach(() => {
    db = initDatabase(':memory:');

    const userRepo = new UserPreferencesRepository(db);
    const serverRepo = new ServerSettingsRepository(db);
    const autoTranslateRepo = new AutoTranslateRepository(db);

    cache = new CacheService({ max: 100, ttl: 60_000 });
    rateLimiter = new RateLimiterService({ dailyCharLimit: 50_000, maxRequestsPerSecond: 10 });
    translationService = new TranslationService({ cache, rateLimiter });
    detectionService = new DetectionService();
    preferencesService = new PreferencesService(userRepo, serverRepo, autoTranslateRepo, 'en');

    fetchMock = jest.spyOn(global, 'fetch').mockImplementation(async () => {
      throw new Error('Unmocked fetch call');
    });
  });

  afterEach(() => {
    fetchMock.mockRestore();
    db.close();
  });

  it('should translate text using the translation service', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify(createMyMemoryResponse('Hola mundo', 'en', 'es')), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const result = await translationService.translate('Hello world', 'es');

    expect(result.translatedText).toBe('Hola mundo');
    expect(result.targetLanguage).toBe('es');
    expect(result.cached).toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('should use user preference for target language', () => {
    preferencesService.setUserLang('user-123', 'fr');

    const lang = preferencesService.getUserLang('user-123');
    expect(lang).toBe('fr');
  });

  it('should resolve effective language with user > server > default priority', () => {
    expect(preferencesService.getEffectiveLang('user-1', 'guild-1')).toBe('en');

    preferencesService.setServerLang('guild-1', 'de');
    expect(preferencesService.getEffectiveLang('user-1', 'guild-1')).toBe('de');

    preferencesService.setUserLang('user-1', 'ja');
    expect(preferencesService.getEffectiveLang('user-1', 'guild-1')).toBe('ja');
  });

  it('should return cached result on second translate of same text', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify(createMyMemoryResponse('Bonjour', 'en', 'fr')), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const first = await translationService.translate('Hello', 'fr');
    expect(first.cached).toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const second = await translationService.translate('Hello', 'fr');
    expect(second.cached).toBe(true);
    expect(second.translatedText).toBe('Bonjour');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('should set and retrieve auto-translate channel', () => {
    preferencesService.setAutoTranslateChannel('channel-1', 'guild-1', 'es');

    const channel = preferencesService.getAutoTranslateChannel('channel-1');
    expect(channel).toBeDefined();
    expect(channel!.channelId).toBe('channel-1');
    expect(channel!.guildId).toBe('guild-1');
    expect(channel!.targetLang).toBe('es');
    expect(channel!.enabled).toBe(true);
  });

  it('should disable auto-translate channel', () => {
    preferencesService.setAutoTranslateChannel('channel-2', 'guild-1', 'fr');
    preferencesService.disableAutoTranslateChannel('channel-2');

    const channel = preferencesService.getAutoTranslateChannel('channel-2');
    expect(channel).toBeDefined();
    expect(channel!.enabled).toBe(false);
  });

  it('should list auto-translate channels for a guild', () => {
    preferencesService.setAutoTranslateChannel('ch-1', 'guild-1', 'es');
    preferencesService.setAutoTranslateChannel('ch-2', 'guild-1', 'fr');
    preferencesService.setAutoTranslateChannel('ch-3', 'guild-2', 'de');

    const channels = preferencesService.getGuildAutoTranslateChannels('guild-1');
    expect(channels).toHaveLength(2);
    expect(channels.map((c) => c.channelId).sort()).toEqual(['ch-1', 'ch-2']);
  });

  it('should detect language using franc for known text', async () => {
    const result = await detectionService.detect(
      'This is a long enough English sentence for franc to detect properly.',
    );
    expect(result.language).toBe('en');
    expect(result.confidence).toBeGreaterThan(0);
  });
});
