import { franc } from 'franc';
import type { DetectionResult, MyMemoryResponse } from '../types/translation.js';
import { TranslationError } from '../types/errors.js';
import { getLanguageName } from '../utils/language-codes.js';
import { MYMEMORY_API_URL } from '../utils/constants.js';

const FRANC_TO_ISO1: Record<string, string> = {
  eng: 'en', spa: 'es', fra: 'fr', deu: 'de', ita: 'it', por: 'pt',
  rus: 'ru', zho: 'zh', jpn: 'ja', kor: 'ko', ara: 'ar', hin: 'hi',
  nld: 'nl', pol: 'pl', swe: 'sv', tur: 'tr', vie: 'vi', tha: 'th',
  ukr: 'uk', ces: 'cs', ron: 'ro', hun: 'hu', fin: 'fi', dan: 'da',
  nor: 'no', ell: 'el', heb: 'he', ind: 'id', msa: 'ms', cat: 'ca',
  bul: 'bg', hrv: 'hr', slk: 'sk', slv: 'sl', lit: 'lt', lav: 'lv',
  est: 'et', tgl: 'tl', swa: 'sw',
};

export class DetectionService {
  async detect(text: string): Promise<DetectionResult> {
    const francCode = franc(text);

    if (francCode !== 'und') {
      const iso1 = FRANC_TO_ISO1[francCode];
      if (iso1) {
        const name = getLanguageName(iso1) ?? iso1;
        return { language: iso1, languageName: name, confidence: 0.9 };
      }
    }

    // franc couldn't detect — default to English for short/ambiguous text
    return { language: 'en', languageName: 'English', confidence: 0.5 };
  }
}
