export class TranslationError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'TranslationError';
  }
}

export class RateLimitError extends TranslationError {
  constructor(public readonly retryAfterMs?: number) {
    super('Rate limit exceeded');
    this.name = 'RateLimitError';
  }
}

export class DailyLimitError extends TranslationError {
  constructor() {
    super('Daily translation limit reached');
    this.name = 'DailyLimitError';
  }
}

export class UnsupportedLanguageError extends TranslationError {
  constructor(public readonly language: string) {
    super(`Unsupported language: ${language}`);
    this.name = 'UnsupportedLanguageError';
  }
}

export class TextTooLongError extends TranslationError {
  constructor(public readonly length: number, public readonly maxLength: number) {
    super(`Text too long: ${length} characters (max ${maxLength})`);
    this.name = 'TextTooLongError';
  }
}
