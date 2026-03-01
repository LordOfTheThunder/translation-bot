/**
 * Maps flag emoji (regional indicator pairs) to ISO 639-1 language codes.
 * Flag emojis are composed of two regional indicator symbols representing a country code.
 * We map country codes to their primary language.
 */

const COUNTRY_TO_LANGUAGE: Record<string, string> = {
  US: 'en',
  GB: 'en',
  FR: 'fr',
  ES: 'es',
  DE: 'de',
  IT: 'it',
  PT: 'pt',
  BR: 'pt',
  RU: 'ru',
  CN: 'zh',
  JP: 'ja',
  KR: 'ko',
  SA: 'ar',
  IN: 'hi',
  NL: 'nl',
  PL: 'pl',
  SE: 'sv',
  TR: 'tr',
  VN: 'vi',
  TH: 'th',
  UA: 'uk',
  CZ: 'cs',
  RO: 'ro',
  HU: 'hu',
  FI: 'fi',
  DK: 'da',
  NO: 'no',
  GR: 'el',
  IL: 'he',
  ID: 'id',
  MY: 'ms',
  BG: 'bg',
  HR: 'hr',
  SK: 'sk',
  SI: 'sl',
  LT: 'lt',
  LV: 'lv',
  EE: 'et',
  PH: 'tl',
  IE: 'ga',
  AT: 'de',
  CH: 'de',
  MX: 'es',
  AR: 'es',
  CL: 'es',
  CO: 'es',
  PE: 'es',
};

// Regional indicator A is U+1F1E6
const REGIONAL_INDICATOR_A = 0x1f1e6;

/**
 * Extracts a country code from a flag emoji string.
 * Flag emojis are two regional indicator symbols (U+1F1E6 to U+1F1FF).
 */
function extractCountryCode(emoji: string): string | undefined {
  const codePoints = [...emoji];
  if (codePoints.length !== 2) return undefined;

  const first = codePoints[0]!.codePointAt(0);
  const second = codePoints[1]!.codePointAt(0);

  if (first === undefined || second === undefined) return undefined;

  // Check both are regional indicators (U+1F1E6 to U+1F1FF)
  if (first < REGIONAL_INDICATOR_A || first > REGIONAL_INDICATOR_A + 25) return undefined;
  if (second < REGIONAL_INDICATOR_A || second > REGIONAL_INDICATOR_A + 25) return undefined;

  const letter1 = String.fromCharCode(first - REGIONAL_INDICATOR_A + 65);
  const letter2 = String.fromCharCode(second - REGIONAL_INDICATOR_A + 65);

  return letter1 + letter2;
}

/**
 * Returns the ISO 639-1 language code for a flag emoji, or undefined if not recognized.
 */
export function flagEmojiToLanguage(emoji: string): string | undefined {
  const country = extractCountryCode(emoji);
  if (!country) return undefined;
  return COUNTRY_TO_LANGUAGE[country];
}

/**
 * Returns true if the emoji is a recognized flag emoji that maps to a language.
 */
export function isFlagEmoji(emoji: string): boolean {
  return flagEmojiToLanguage(emoji) !== undefined;
}
