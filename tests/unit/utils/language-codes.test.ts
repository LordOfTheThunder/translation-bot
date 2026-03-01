import {
  LANGUAGE_MAP,
  isValidLanguageCode,
  getLanguageName,
  searchLanguages,
  getAllLanguages,
} from '../../../src/utils/language-codes.js';

describe('language-codes', () => {
  describe('isValidLanguageCode', () => {
    it('returns true for valid lowercase codes', () => {
      expect(isValidLanguageCode('en')).toBe(true);
      expect(isValidLanguageCode('es')).toBe(true);
      expect(isValidLanguageCode('zh')).toBe(true);
    });

    it('returns true for uppercase codes (case-insensitive)', () => {
      expect(isValidLanguageCode('EN')).toBe(true);
      expect(isValidLanguageCode('Fr')).toBe(true);
    });

    it('returns false for invalid codes', () => {
      expect(isValidLanguageCode('xx')).toBe(false);
      expect(isValidLanguageCode('')).toBe(false);
      expect(isValidLanguageCode('english')).toBe(false);
    });
  });

  describe('getLanguageName', () => {
    it('returns the correct name for valid codes', () => {
      expect(getLanguageName('en')).toBe('English');
      expect(getLanguageName('es')).toBe('Spanish');
      expect(getLanguageName('ja')).toBe('Japanese');
      expect(getLanguageName('zh')).toBe('Chinese');
    });

    it('is case-insensitive', () => {
      expect(getLanguageName('EN')).toBe('English');
      expect(getLanguageName('De')).toBe('German');
    });

    it('returns undefined for invalid codes', () => {
      expect(getLanguageName('xx')).toBeUndefined();
      expect(getLanguageName('')).toBeUndefined();
    });
  });

  describe('searchLanguages', () => {
    it('finds languages by code', () => {
      const results = searchLanguages('en');
      const codes = results.map((r) => r.code);
      expect(codes).toContain('en');
    });

    it('finds languages by name substring', () => {
      const results = searchLanguages('span');
      expect(results).toEqual([{ code: 'es', name: 'Spanish' }]);
    });

    it('is case-insensitive', () => {
      const results = searchLanguages('FRENCH');
      expect(results).toEqual([{ code: 'fr', name: 'French' }]);
    });

    it('returns empty array for no matches', () => {
      const results = searchLanguages('zzzzz');
      expect(results).toEqual([]);
    });

    it('returns multiple matches', () => {
      const results = searchLanguages('an');
      expect(results.length).toBeGreaterThan(1);
    });
  });

  describe('getAllLanguages', () => {
    it('returns all languages from the map', () => {
      const all = getAllLanguages();
      const expectedCount = Object.keys(LANGUAGE_MAP).length;
      expect(all).toHaveLength(expectedCount);
    });

    it('returns objects with code and name', () => {
      const all = getAllLanguages();
      for (const lang of all) {
        expect(lang).toHaveProperty('code');
        expect(lang).toHaveProperty('name');
        expect(typeof lang.code).toBe('string');
        expect(typeof lang.name).toBe('string');
      }
    });

    it('includes known languages', () => {
      const all = getAllLanguages();
      const codes = all.map((l) => l.code);
      expect(codes).toContain('en');
      expect(codes).toContain('es');
      expect(codes).toContain('fr');
      expect(codes).toContain('de');
      expect(codes).toContain('ja');
    });
  });
});
