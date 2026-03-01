import { CacheService } from '../../../src/services/cache.service.js';
import type { TranslationResult } from '../../../src/types/index.js';

function makeResult(overrides: Partial<TranslationResult> = {}): TranslationResult {
  return {
    translatedText: 'Hola',
    sourceLanguage: 'en',
    targetLanguage: 'es',
    confidence: 0.95,
    cached: false,
    ...overrides,
  };
}

describe('CacheService', () => {
  let cache: CacheService;

  beforeEach(() => {
    cache = new CacheService({ max: 100, ttl: 60_000 });
  });

  describe('get/set', () => {
    it('returns undefined for a cache miss', () => {
      expect(cache.get('en', 'es', 'hello')).toBeUndefined();
    });

    it('returns the cached result after set', () => {
      const result = makeResult();
      cache.set('en', 'es', 'hello', result);
      expect(cache.get('en', 'es', 'hello')).toEqual(result);
    });

    it('returns undefined for different source language', () => {
      cache.set('en', 'es', 'hello', makeResult());
      expect(cache.get('fr', 'es', 'hello')).toBeUndefined();
    });

    it('returns undefined for different target language', () => {
      cache.set('en', 'es', 'hello', makeResult());
      expect(cache.get('en', 'fr', 'hello')).toBeUndefined();
    });

    it('returns undefined for different text', () => {
      cache.set('en', 'es', 'hello', makeResult());
      expect(cache.get('en', 'es', 'world')).toBeUndefined();
    });
  });

  describe('key normalization', () => {
    it('normalizes text to lowercase', () => {
      const result = makeResult();
      cache.set('en', 'es', 'Hello', result);
      expect(cache.get('en', 'es', 'hello')).toEqual(result);
      expect(cache.get('en', 'es', 'HELLO')).toEqual(result);
    });

    it('trims whitespace from text', () => {
      const result = makeResult();
      cache.set('en', 'es', '  hello  ', result);
      expect(cache.get('en', 'es', 'hello')).toEqual(result);
    });

    it('normalizes both case and whitespace', () => {
      const result = makeResult();
      cache.set('en', 'es', '  Hello World  ', result);
      expect(cache.get('en', 'es', 'hello world')).toEqual(result);
    });
  });

  describe('clear', () => {
    it('removes all entries', () => {
      cache.set('en', 'es', 'hello', makeResult());
      cache.set('en', 'fr', 'hello', makeResult());
      expect(cache.size()).toBe(2);

      cache.clear();
      expect(cache.size()).toBe(0);
      expect(cache.get('en', 'es', 'hello')).toBeUndefined();
    });
  });

  describe('size', () => {
    it('returns 0 for empty cache', () => {
      expect(cache.size()).toBe(0);
    });

    it('returns the number of entries', () => {
      cache.set('en', 'es', 'hello', makeResult());
      cache.set('en', 'fr', 'hello', makeResult());
      cache.set('en', 'de', 'hello', makeResult());
      expect(cache.size()).toBe(3);
    });

    it('does not double-count overwrites for the same key', () => {
      cache.set('en', 'es', 'hello', makeResult());
      cache.set('en', 'es', 'hello', makeResult({ translatedText: 'Updated' }));
      expect(cache.size()).toBe(1);
    });
  });

  describe('max entries', () => {
    it('evicts oldest entries when max is exceeded', () => {
      const smallCache = new CacheService({ max: 2, ttl: 60_000 });
      smallCache.set('en', 'es', 'first', makeResult({ translatedText: 'primero' }));
      smallCache.set('en', 'es', 'second', makeResult({ translatedText: 'segundo' }));
      smallCache.set('en', 'es', 'third', makeResult({ translatedText: 'tercero' }));

      expect(smallCache.size()).toBe(2);
      expect(smallCache.get('en', 'es', 'first')).toBeUndefined();
      expect(smallCache.get('en', 'es', 'second')).toBeDefined();
      expect(smallCache.get('en', 'es', 'third')).toBeDefined();
    });
  });
});
