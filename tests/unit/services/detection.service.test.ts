import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { DetectionService } from '../../../src/services/detection.service.js';

describe('DetectionService', () => {
  let service: DetectionService;

  beforeEach(() => {
    service = new DetectionService();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should detect English text offline via franc', async () => {
    const result = await service.detect(
      'This is a sufficiently long English sentence that franc should be able to detect reliably.',
    );

    expect(result.language).toBe('en');
    expect(result.languageName).toBe('English');
    expect(result.confidence).toBe(0.9);
  });

  it('should detect Spanish text offline via franc', async () => {
    const result = await service.detect(
      'Esta es una oración suficientemente larga en español para que franc pueda detectarla de manera confiable.',
    );

    expect(result.language).toBe('es');
    expect(result.languageName).toBe('Spanish');
    expect(result.confidence).toBe(0.9);
  });

  it('should detect French text offline via franc', async () => {
    const result = await service.detect(
      "Ceci est une phrase suffisamment longue en français pour que franc puisse la détecter de manière fiable.",
    );

    expect(result.language).toBe('fr');
    expect(result.languageName).toBe('French');
    expect(result.confidence).toBe(0.9);
  });

  it('should default to English for very short or ambiguous text', async () => {
    const result = await service.detect('hi');

    expect(result.language).toBe('en');
    expect(result.languageName).toBe('English');
    expect(result.confidence).toBe(0.5);
  });

  it('should default to English when franc returns und', async () => {
    const result = await service.detect('x');

    expect(result.language).toBe('en');
    expect(result.confidence).toBe(0.5);
  });
});
