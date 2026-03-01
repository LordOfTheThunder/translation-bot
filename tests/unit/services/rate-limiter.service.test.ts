import { jest } from '@jest/globals';
import { RateLimiterService } from '../../../src/services/rate-limiter.service.js';
import { DailyLimitError, RateLimitError } from '../../../src/types/index.js';

describe('RateLimiterService', () => {
  describe('character budget', () => {
    let limiter: RateLimiterService;

    beforeEach(() => {
      limiter = new RateLimiterService({ dailyCharLimit: 1000, maxRequestsPerSecond: 10 });
    });

    it('starts with full budget', () => {
      expect(limiter.getCharsRemaining()).toBe(1000);
      expect(limiter.getCharsUsed()).toBe(0);
    });

    it('consumeChars decrements remaining and increments used', () => {
      limiter.consumeChars(200);
      expect(limiter.getCharsUsed()).toBe(200);
      expect(limiter.getCharsRemaining()).toBe(800);
    });

    it('consumeChars accumulates across multiple calls', () => {
      limiter.consumeChars(100);
      limiter.consumeChars(250);
      limiter.consumeChars(50);
      expect(limiter.getCharsUsed()).toBe(400);
      expect(limiter.getCharsRemaining()).toBe(600);
    });

    it('throws DailyLimitError when budget would be exceeded', () => {
      limiter.consumeChars(900);
      expect(() => limiter.consumeChars(200)).toThrow(DailyLimitError);
    });

    it('does not consume chars when limit is exceeded', () => {
      limiter.consumeChars(900);
      try {
        limiter.consumeChars(200);
      } catch {
        // expected
      }
      expect(limiter.getCharsUsed()).toBe(900);
    });

    it('allows consuming exactly up to the limit', () => {
      limiter.consumeChars(1000);
      expect(limiter.getCharsUsed()).toBe(1000);
      expect(limiter.getCharsRemaining()).toBe(0);
    });

    it('throws DailyLimitError when budget is exactly at limit', () => {
      limiter.consumeChars(1000);
      expect(() => limiter.consumeChars(1)).toThrow(DailyLimitError);
    });
  });

  describe('daily reset', () => {
    it('resets character budget when UTC day changes', () => {
      const now = Date.now();
      jest.spyOn(Date, 'now').mockReturnValue(now);

      const limiter = new RateLimiterService({ dailyCharLimit: 500, maxRequestsPerSecond: 10 });
      limiter.consumeChars(400);
      expect(limiter.getCharsUsed()).toBe(400);

      // Advance to the next UTC day (86_400_000 ms = 1 day)
      const nextDay = now + 86_400_000;
      (Date.now as jest.MockedFunction<typeof Date.now>).mockReturnValue(nextDay);

      expect(limiter.getCharsUsed()).toBe(0);
      expect(limiter.getCharsRemaining()).toBe(500);

      jest.restoreAllMocks();
    });
  });

  describe('token bucket', () => {
    it('allows acquiring tokens up to maxRequestsPerSecond', () => {
      const limiter = new RateLimiterService({ dailyCharLimit: 10000, maxRequestsPerSecond: 3 });
      expect(() => limiter.acquireToken()).not.toThrow();
      expect(() => limiter.acquireToken()).not.toThrow();
      expect(() => limiter.acquireToken()).not.toThrow();
    });

    it('throws RateLimitError when all tokens are exhausted', () => {
      const limiter = new RateLimiterService({ dailyCharLimit: 10000, maxRequestsPerSecond: 2 });
      limiter.acquireToken();
      limiter.acquireToken();
      expect(() => limiter.acquireToken()).toThrow(RateLimitError);
    });

    it('RateLimitError includes retryAfterMs', () => {
      const limiter = new RateLimiterService({ dailyCharLimit: 10000, maxRequestsPerSecond: 5 });
      // Exhaust all tokens
      for (let i = 0; i < 5; i++) {
        limiter.acquireToken();
      }
      try {
        limiter.acquireToken();
        fail('Expected RateLimitError');
      } catch (error) {
        expect(error).toBeInstanceOf(RateLimitError);
        expect((error as RateLimitError).retryAfterMs).toBe(200); // 1000 / 5
      }
    });

    it('refills tokens after enough time has passed', () => {
      const now = Date.now();
      jest.spyOn(Date, 'now').mockReturnValue(now);

      const limiter = new RateLimiterService({ dailyCharLimit: 10000, maxRequestsPerSecond: 5 });
      // Exhaust all tokens
      for (let i = 0; i < 5; i++) {
        limiter.acquireToken();
      }
      expect(() => limiter.acquireToken()).toThrow(RateLimitError);

      // Advance time by 200ms (one refill interval for 5 req/s)
      (Date.now as jest.MockedFunction<typeof Date.now>).mockReturnValue(now + 200);

      expect(() => limiter.acquireToken()).not.toThrow();

      jest.restoreAllMocks();
    });

    it('does not refill beyond max tokens', () => {
      const now = Date.now();
      jest.spyOn(Date, 'now').mockReturnValue(now);

      const limiter = new RateLimiterService({ dailyCharLimit: 10000, maxRequestsPerSecond: 3 });
      limiter.acquireToken(); // 2 remaining

      // Advance a long time
      (Date.now as jest.MockedFunction<typeof Date.now>).mockReturnValue(now + 10000);

      // Should have refilled to max (3), acquire all 3
      expect(() => limiter.acquireToken()).not.toThrow();
      expect(() => limiter.acquireToken()).not.toThrow();
      expect(() => limiter.acquireToken()).not.toThrow();
      expect(() => limiter.acquireToken()).toThrow(RateLimitError);

      jest.restoreAllMocks();
    });
  });

  describe('checkAvailability', () => {
    it('does not throw when both limits are fine', () => {
      const limiter = new RateLimiterService({ dailyCharLimit: 1000, maxRequestsPerSecond: 10 });
      expect(() => limiter.checkAvailability(100)).not.toThrow();
    });

    it('throws DailyLimitError when char budget would be exceeded', () => {
      const limiter = new RateLimiterService({ dailyCharLimit: 100, maxRequestsPerSecond: 10 });
      limiter.consumeChars(90);
      expect(() => limiter.checkAvailability(20)).toThrow(DailyLimitError);
    });

    it('throws RateLimitError when no tokens available', () => {
      const limiter = new RateLimiterService({ dailyCharLimit: 10000, maxRequestsPerSecond: 1 });
      limiter.acquireToken(); // exhaust the single token
      expect(() => limiter.checkAvailability(10)).toThrow(RateLimitError);
    });

    it('checks char budget before tokens (DailyLimitError takes priority)', () => {
      const limiter = new RateLimiterService({ dailyCharLimit: 100, maxRequestsPerSecond: 1 });
      limiter.consumeChars(100);
      limiter.acquireToken(); // exhaust token too
      // Both limits exceeded, but char budget is checked first
      expect(() => limiter.checkAvailability(10)).toThrow(DailyLimitError);
    });

    it('does not consume chars or tokens (just checks)', () => {
      const limiter = new RateLimiterService({ dailyCharLimit: 1000, maxRequestsPerSecond: 10 });
      limiter.checkAvailability(500);
      expect(limiter.getCharsUsed()).toBe(0);
      // Tokens should still be full (acquire all 10)
      for (let i = 0; i < 10; i++) {
        expect(() => limiter.acquireToken()).not.toThrow();
      }
    });
  });
});
