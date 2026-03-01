import type { CacheService } from './cache.service.js';
import type { RateLimiterService } from './rate-limiter.service.js';
import type { TranslationResult, MyMemoryResponse } from '../types/translation.js';
import { TextTooLongError, TranslationError } from '../types/errors.js';
import { MYMEMORY_API_URL, MAX_TEXT_LENGTH } from '../utils/constants.js';

export class TranslationService {
  private readonly cache: CacheService;
  private readonly rateLimiter: RateLimiterService;
  private readonly email?: string;

  constructor({ cache, rateLimiter, email }: { cache: CacheService; rateLimiter: RateLimiterService; email?: string }) {
    this.cache = cache;
    this.rateLimiter = rateLimiter;
    this.email = email;
  }

  async translate(text: string, targetLang: string, sourceLang?: string): Promise<TranslationResult> {
    if (text.length > MAX_TEXT_LENGTH) {
      throw new TextTooLongError(text.length, MAX_TEXT_LENGTH);
    }

    const source = sourceLang ?? 'autodetect';

    const cached = this.cache.get(source, targetLang, text);
    if (cached) {
      return { ...cached, cached: true };
    }

    this.rateLimiter.checkAvailability(text.length);

    const url = new URL(MYMEMORY_API_URL);
    url.searchParams.set('q', text);
    url.searchParams.set('langpair', `${source}|${targetLang}`);
    if (this.email) {
      url.searchParams.set('de', this.email);
    }

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new TranslationError(`MyMemory API error: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as MyMemoryResponse;

    if (data.responseStatus !== 200) {
      throw new TranslationError(`MyMemory API returned status ${data.responseStatus}: ${data.responseDetails}`);
    }

    const detectedSource = data.matches?.[0]?.source ?? source;

    const result: TranslationResult = {
      translatedText: data.responseData.translatedText,
      sourceLanguage: detectedSource,
      targetLanguage: targetLang,
      confidence: data.responseData.match,
      cached: false,
    };

    this.cache.set(source, targetLang, text, result);
    this.rateLimiter.consumeChars(text.length);

    return result;
  }
}
