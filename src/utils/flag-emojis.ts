/**
 * Maps flag emoji (regional indicator pairs) to ISO 639-1 language codes.
 * Flag emojis are composed of two regional indicator symbols representing a country code.
 * We map country codes to their primary language.
 */

const COUNTRY_TO_LANGUAGE: Record<string, string> = {
  // English-speaking
  US: 'en',  // 🇺🇸 United States
  GB: 'en',  // 🇬🇧 United Kingdom
  AU: 'en',  // 🇦🇺 Australia
  CA: 'en',  // 🇨🇦 Canada
  NZ: 'en',  // 🇳🇿 New Zealand
  ZA: 'en',  // 🇿🇦 South Africa
  NG: 'en',  // 🇳🇬 Nigeria

  // French
  FR: 'fr',  // 🇫🇷 France
  BE: 'fr',  // 🇧🇪 Belgium

  // Spanish
  ES: 'es',  // 🇪🇸 Spain
  MX: 'es',  // 🇲🇽 Mexico
  AR: 'es',  // 🇦🇷 Argentina
  CL: 'es',  // 🇨🇱 Chile
  CO: 'es',  // 🇨🇴 Colombia
  PE: 'es',  // 🇵🇪 Peru
  VE: 'es',  // 🇻🇪 Venezuela
  EC: 'es',  // 🇪🇨 Ecuador
  CU: 'es',  // 🇨🇺 Cuba
  DO: 'es',  // 🇩🇴 Dominican Republic
  GT: 'es',  // 🇬🇹 Guatemala
  UY: 'es',  // 🇺🇾 Uruguay
  PR: 'es',  // 🇵🇷 Puerto Rico

  // German
  DE: 'de',  // 🇩🇪 Germany
  AT: 'de',  // 🇦🇹 Austria
  CH: 'de',  // 🇨🇭 Switzerland

  // Portuguese
  PT: 'pt',  // 🇵🇹 Portugal
  BR: 'pt',  // 🇧🇷 Brazil
  AO: 'pt',  // 🇦🇴 Angola
  MZ: 'pt',  // 🇲🇿 Mozambique

  // Italian
  IT: 'it',  // 🇮🇹 Italy

  // Russian
  RU: 'ru',  // 🇷🇺 Russia
  BY: 'ru',  // 🇧🇾 Belarus

  // East Asian
  CN: 'zh',  // 🇨🇳 China
  TW: 'zh',  // 🇹🇼 Taiwan
  HK: 'zh',  // 🇭🇰 Hong Kong
  JP: 'ja',  // 🇯🇵 Japan
  KR: 'ko',  // 🇰🇷 South Korea

  // South Asian
  IN: 'hi',  // 🇮🇳 India
  PK: 'ur',  // 🇵🇰 Pakistan
  BD: 'bn',  // 🇧🇩 Bangladesh
  LK: 'si',  // 🇱🇰 Sri Lanka
  NP: 'ne',  // 🇳🇵 Nepal

  // Arabic-speaking
  SA: 'ar',  // 🇸🇦 Saudi Arabia
  EG: 'ar',  // 🇪🇬 Egypt
  AE: 'ar',  // 🇦🇪 United Arab Emirates
  MA: 'ar',  // 🇲🇦 Morocco
  IQ: 'ar',  // 🇮🇶 Iraq
  JO: 'ar',  // 🇯🇴 Jordan
  LB: 'ar',  // 🇱🇧 Lebanon
  TN: 'ar',  // 🇹🇳 Tunisia
  QA: 'ar',  // 🇶🇦 Qatar
  KW: 'ar',  // 🇰🇼 Kuwait
  OM: 'ar',  // 🇴🇲 Oman
  BH: 'ar',  // 🇧🇭 Bahrain

  // Nordic
  SE: 'sv',  // 🇸🇪 Sweden
  DK: 'da',  // 🇩🇰 Denmark
  NO: 'no',  // 🇳🇴 Norway
  FI: 'fi',  // 🇫🇮 Finland
  IS: 'is',  // 🇮🇸 Iceland

  // Other European
  NL: 'nl',  // 🇳🇱 Netherlands
  PL: 'pl',  // 🇵🇱 Poland
  TR: 'tr',  // 🇹🇷 Turkey
  GR: 'el',  // 🇬🇷 Greece
  CZ: 'cs',  // 🇨🇿 Czech Republic
  RO: 'ro',  // 🇷🇴 Romania
  HU: 'hu',  // 🇭🇺 Hungary
  UA: 'uk',  // 🇺🇦 Ukraine
  BG: 'bg',  // 🇧🇬 Bulgaria
  HR: 'hr',  // 🇭🇷 Croatia
  SK: 'sk',  // 🇸🇰 Slovakia
  SI: 'sl',  // 🇸🇮 Slovenia
  RS: 'sr',  // 🇷🇸 Serbia
  LT: 'lt',  // 🇱🇹 Lithuania
  LV: 'lv',  // 🇱🇻 Latvia
  EE: 'et',  // 🇪🇪 Estonia
  AL: 'sq',  // 🇦🇱 Albania
  MK: 'mk',  // 🇲🇰 North Macedonia
  MT: 'mt',  // 🇲🇹 Malta
  GE: 'ka',  // 🇬🇪 Georgia
  CY: 'el',  // 🇨🇾 Cyprus

  // Middle East
  IL: 'he',  // 🇮🇱 Israel
  IR: 'fa',  // 🇮🇷 Iran

  // Southeast Asian
  VN: 'vi',  // 🇻🇳 Vietnam
  TH: 'th',  // 🇹🇭 Thailand
  ID: 'id',  // 🇮🇩 Indonesia
  MY: 'ms',  // 🇲🇾 Malaysia
  PH: 'tl',  // 🇵🇭 Philippines
  MM: 'my',  // 🇲🇲 Myanmar
  KH: 'km',  // 🇰🇭 Cambodia

  // African
  KE: 'sw',  // 🇰🇪 Kenya
  TZ: 'sw',  // 🇹🇿 Tanzania
  ET: 'am',  // 🇪🇹 Ethiopia

  // Celtic
  IE: 'ga',  // 🇮🇪 Ireland
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
