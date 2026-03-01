import { DailyLimitError, RateLimitError } from '../types/index.js';

export class RateLimiterService {
  private readonly dailyCharLimit: number;
  private charsUsedToday = 0;
  private currentDay: number;

  private readonly maxTokens: number;
  private tokens: number;
  private readonly refillIntervalMs: number;
  private lastRefillTime: number;

  constructor({ dailyCharLimit, maxRequestsPerSecond }: { dailyCharLimit: number; maxRequestsPerSecond: number }) {
    this.dailyCharLimit = dailyCharLimit;
    this.currentDay = this.getUTCDay();

    this.maxTokens = maxRequestsPerSecond;
    this.tokens = maxRequestsPerSecond;
    this.refillIntervalMs = 1000 / maxRequestsPerSecond;
    this.lastRefillTime = Date.now();
  }

  private getUTCDay(): number {
    return Math.floor(Date.now() / 86_400_000);
  }

  private resetIfNewDay(): void {
    const today = this.getUTCDay();
    if (today !== this.currentDay) {
      this.charsUsedToday = 0;
      this.currentDay = today;
    }
  }

  private refillTokens(): void {
    const now = Date.now();
    const elapsed = now - this.lastRefillTime;
    const tokensToAdd = Math.floor(elapsed / this.refillIntervalMs);
    if (tokensToAdd > 0) {
      this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd);
      this.lastRefillTime = now;
    }
  }

  consumeChars(count: number): void {
    this.resetIfNewDay();
    if (this.charsUsedToday + count > this.dailyCharLimit) {
      throw new DailyLimitError();
    }
    this.charsUsedToday += count;
  }

  getCharsRemaining(): number {
    this.resetIfNewDay();
    return Math.max(0, this.dailyCharLimit - this.charsUsedToday);
  }

  getCharsUsed(): number {
    this.resetIfNewDay();
    return this.charsUsedToday;
  }

  acquireToken(): void {
    this.refillTokens();
    if (this.tokens < 1) {
      throw new RateLimitError(this.refillIntervalMs);
    }
    this.tokens -= 1;
  }

  checkAvailability(charCount: number): void {
    this.resetIfNewDay();
    if (this.charsUsedToday + charCount > this.dailyCharLimit) {
      throw new DailyLimitError();
    }
    this.refillTokens();
    if (this.tokens < 1) {
      throw new RateLimitError(this.refillIntervalMs);
    }
  }
}
