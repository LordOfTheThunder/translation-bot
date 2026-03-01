export interface TranslationResult {
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  confidence: number;
  cached: boolean;
}

export interface MyMemoryResponse {
  responseData: {
    translatedText: string;
    match: number;
  };
  responseStatus: number;
  responseDetails: string;
  matches: Array<{
    id: string;
    segment: string;
    translation: string;
    source: string;
    target: string;
    quality: number;
    reference: string | null;
    'usage-count': number;
    subject: string;
    'created-by': string;
    'last-updated-by': string;
    'create-date': string;
    'last-update-date': string;
    match: number;
  }>;
}

export interface DetectionResult {
  language: string;
  languageName: string;
  confidence: number;
}
