import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { TranslationService } from '../../../src/services/translation.service.js';
import { CacheService } from '../../../src/services/cache.service.js';
import { RateLimiterService } from '../../../src/services/rate-limiter.service.js';
import { TextTooLongError, TranslationError } from '../../../src/types/errors.js';
import { DailyLimitError } from '../../../src/types/errors.js';
import { MAX_TEXT_LENGTH } from '../../../src/utils/constants.js';
import type { MyMemoryResponse } from '../../../src/types/translation.js';

const mockFetchResponse = (data: unknown) =>
  Promise.resolve({ ok: true, json: () => Promise.resolve(data) } as Response);

const makeMyMemoryResponse = (overrides?: Partial<MyMemoryResponse>): MyMemoryResponse => ({
  responseData: {
    translatedText: 'Hola',
    match: 0.95,
  },
  responseStatus: 200,
  responseDetails: '',
  matches: [
    {
      id: '1',
      segment: 'Hello',
      translation: 'Hola',
      source: 'en',
      target: 'es',
      quality: 74,
      reference: null,
      'usage-count': 100,
      subject: 'All',
      'created-by': '',
      'last-updated-by': '',
      'create-date': '2020-01-01',
      'last-update-date': '2020-01-01',
      match: 0.95,
    },
  ],
  ...overrides,
});

describe('TranslationService', () => {
  let service: TranslationService;
  let cache: CacheService;
  let rateLimiter: RateLimiterService;

  beforeEach(() => {
    cache = new CacheService({ max: 100, ttl: 60_000 });
    rateLimiter = new RateLimiterService({ dailyCharLimit: 5000, maxRequestsPerSecond: 10 });
    service = new TranslationService({ cache, rateLimiter });
    global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return a translation result on success', async () => {
    (global.fetch as jest.Mock).mockReturnValue(mockFetchResponse(makeMyMemoryResponse()));

    const result = await service.translate('Hello', 'es');

    expect(result).toEqual({
      translatedText: 'Hola',
      sourceLanguage: 'en',
      targetLanguage: 'es',
      confidence: 0.95,
      cached: false,
    });
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('should use provided sourceLang in the API call', async () => {
    (global.fetch as jest.Mock).mockReturnValue(mockFetchResponse(makeMyMemoryResponse()));

    await service.translate('Hello', 'es', 'en');

    const calledUrl = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(calledUrl).toContain('langpair=en%7Ces');
  });

  it('should default to autodetect when sourceLang is not provided', async () => {
    (global.fetch as jest.Mock).mockReturnValue(mockFetchResponse(makeMyMemoryResponse()));

    await service.translate('Hello', 'es');

    const calledUrl = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(calledUrl).toContain('langpair=autodetect%7Ces');
  });

  it('should include email parameter when configured', async () => {
    const serviceWithEmail = new TranslationService({ cache, rateLimiter, email: 'test@example.com' });
    (global.fetch as jest.Mock).mockReturnValue(mockFetchResponse(makeMyMemoryResponse()));

    await serviceWithEmail.translate('Hello', 'es');

    const calledUrl = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(calledUrl).toContain('de=test%40example.com');
  });

  it('should return cached result on second identical request', async () => {
    (global.fetch as jest.Mock).mockReturnValue(mockFetchResponse(makeMyMemoryResponse()));

    const first = await service.translate('Hello', 'es');
    expect(first.cached).toBe(false);

    const second = await service.translate('Hello', 'es');
    expect(second.cached).toBe(true);
    expect(second.translatedText).toBe('Hola');

    // fetch should only be called once - second call hit cache
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('should throw TextTooLongError when text exceeds MAX_TEXT_LENGTH', async () => {
    const longText = 'a'.repeat(MAX_TEXT_LENGTH + 1);

    await expect(service.translate(longText, 'es')).rejects.toThrow(TextTooLongError);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should throw DailyLimitError when daily char budget is exhausted', async () => {
    // Create a rate limiter with a very small char limit
    const tightLimiter = new RateLimiterService({ dailyCharLimit: 10, maxRequestsPerSecond: 10 });
    const tightService = new TranslationService({ cache, rateLimiter: tightLimiter });

    (global.fetch as jest.Mock).mockReturnValue(mockFetchResponse(makeMyMemoryResponse()));

    // First call consumes 5 chars, succeeding
    await tightService.translate('Hello', 'es');

    // Second call tries to use 11 chars, exceeding the 10-char limit (5 already used)
    await expect(tightService.translate('Hello World', 'es')).rejects.toThrow(DailyLimitError);
  });

  it('should throw TranslationError when API returns non-ok response', async () => {
    (global.fetch as jest.Mock).mockReturnValue(
      Promise.resolve({ ok: false, status: 500, statusText: 'Internal Server Error' } as Response),
    );

    await expect(service.translate('Hello', 'es')).rejects.toThrow(TranslationError);
  });

  it('should throw TranslationError when API returns non-200 responseStatus', async () => {
    (global.fetch as jest.Mock).mockReturnValue(
      mockFetchResponse(
        makeMyMemoryResponse({
          responseStatus: 403,
          responseDetails: 'Forbidden',
        }),
      ),
    );

    await expect(service.translate('Hello', 'es')).rejects.toThrow(TranslationError);
  });
});
