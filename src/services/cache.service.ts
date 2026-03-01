import { LRUCache } from 'lru-cache';
import type { TranslationResult } from '../types/index.js';

export class CacheService {
  private cache: LRUCache<string, TranslationResult>;

  constructor({ max, ttl }: { max: number; ttl: number }) {
    this.cache = new LRUCache<string, TranslationResult>({ max, ttl });
  }

  private buildKey(source: string, target: string, text: string): string {
    const normalizedText = text.toLowerCase().trim();
    return `${source}:${target}:${normalizedText}`;
  }

  get(source: string, target: string, text: string): TranslationResult | undefined {
    return this.cache.get(this.buildKey(source, target, text));
  }

  set(source: string, target: string, text: string, result: TranslationResult): void {
    this.cache.set(this.buildKey(source, target, text), result);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}
