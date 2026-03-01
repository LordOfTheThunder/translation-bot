import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { DetectionService } from '../../../src/services/detection.service.js';
import { TranslationError } from '../../../src/types/errors.js';
import type { MyMemoryResponse } from '../../../src/types/translation.js';

const mockFetchResponse = (data: unknown) =>
  Promise.resolve({ ok: true, json: () => Promise.resolve(data) } as Response);

const makeDetectionApiResponse = (sourceLang: string, confidence: number): MyMemoryResponse => ({
  responseData: {
    translatedText: 'translated',
    match: confidence,
  },
  responseStatus: 200,
  responseDetails: '',
  matches: [
    {
      id: '1',
      segment: 'text',
      translation: 'translated',
      source: sourceLang,
      target: 'en',
      quality: 74,
      reference: null,
      'usage-count': 100,
      subject: 'All',
      'created-by': '',
      'last-updated-by': '',
      'create-date': '2020-01-01',
      'last-update-date': '2020-01-01',
      match: confidence,
    },
  ],
});

describe('DetectionService', () => {
  let service: DetectionService;

  beforeEach(() => {
    service = new DetectionService();
    global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;
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
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should detect Spanish text offline via franc', async () => {
    const result = await service.detect(
      'Esta es una oración suficientemente larga en español para que franc pueda detectarla de manera confiable.',
    );

    expect(result.language).toBe('es');
    expect(result.languageName).toBe('Spanish');
    expect(result.confidence).toBe(0.9);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should detect French text offline via franc', async () => {
    const result = await service.detect(
      "Ceci est une phrase suffisamment longue en français pour que franc puisse la détecter de manière fiable.",
    );

    expect(result.language).toBe('fr');
    expect(result.languageName).toBe('French');
    expect(result.confidence).toBe(0.9);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should fall back to API for very short or ambiguous text', async () => {
    (global.fetch as jest.Mock).mockReturnValue(
      mockFetchResponse(makeDetectionApiResponse('fr', 0.85)),
    );

    const result = await service.detect('hi');

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(result.language).toBe('fr');
    expect(result.confidence).toBe(0.85);
  });

  it('should fall back to API when franc returns und', async () => {
    (global.fetch as jest.Mock).mockReturnValue(
      mockFetchResponse(makeDetectionApiResponse('ja', 0.8)),
    );

    // Single character - franc will return 'und'
    const result = await service.detect('x');

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(result.language).toBe('ja');
  });

  it('should call API with autodetect|en langpair', async () => {
    (global.fetch as jest.Mock).mockReturnValue(
      mockFetchResponse(makeDetectionApiResponse('de', 0.9)),
    );

    await service.detect('ab');

    const calledUrl = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(calledUrl).toContain('langpair=autodetect%7Cen');
  });

  it('should throw TranslationError when API returns non-ok response', async () => {
    (global.fetch as jest.Mock).mockReturnValue(
      Promise.resolve({ ok: false, status: 500, statusText: 'Internal Server Error' } as Response),
    );

    // Short text to force API fallback
    await expect(service.detect('ab')).rejects.toThrow(TranslationError);
  });

  it('should throw TranslationError when API returns non-200 responseStatus', async () => {
    (global.fetch as jest.Mock).mockReturnValue(
      mockFetchResponse({
        responseData: { translatedText: '', match: 0 },
        responseStatus: 403,
        responseDetails: 'Forbidden',
        matches: [],
      }),
    );

    await expect(service.detect('ab')).rejects.toThrow(TranslationError);
  });
});
