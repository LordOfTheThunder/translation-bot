import Database from 'better-sqlite3';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { UserPreferencesRepository } from '../../../src/storage/repositories/user-preferences.repo.js';
import { ServerSettingsRepository } from '../../../src/storage/repositories/server-settings.repo.js';
import { AutoTranslateRepository } from '../../../src/storage/repositories/auto-translate.repo.js';
import { PreferencesService } from '../../../src/services/preferences.service.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

function createTestDb(): Database.Database {
  const db = new Database(':memory:');
  const migrationPath = join(__dirname, '../../../src/storage/migrations/001_initial.sql');
  const sql = readFileSync(migrationPath, 'utf-8');
  db.exec(sql);
  return db;
}

describe('PreferencesService', () => {
  let db: Database.Database;
  let userRepo: UserPreferencesRepository;
  let serverRepo: ServerSettingsRepository;
  let autoTranslateRepo: AutoTranslateRepository;
  let service: PreferencesService;

  beforeEach(() => {
    db = createTestDb();
    userRepo = new UserPreferencesRepository(db);
    serverRepo = new ServerSettingsRepository(db);
    autoTranslateRepo = new AutoTranslateRepository(db);
    service = new PreferencesService(userRepo, serverRepo, autoTranslateRepo, 'en');
  });

  afterEach(() => {
    db.close();
  });

  describe('getUserLang / setUserLang', () => {
    it('returns default when no preference is set', () => {
      expect(service.getUserLang('user1')).toBe('en');
    });

    it('returns the set language after setUserLang', () => {
      service.setUserLang('user1', 'fr');
      expect(service.getUserLang('user1')).toBe('fr');
    });

    it('overwrites previous preference', () => {
      service.setUserLang('user1', 'fr');
      service.setUserLang('user1', 'de');
      expect(service.getUserLang('user1')).toBe('de');
    });

    it('handles multiple users independently', () => {
      service.setUserLang('user1', 'fr');
      service.setUserLang('user2', 'es');
      expect(service.getUserLang('user1')).toBe('fr');
      expect(service.getUserLang('user2')).toBe('es');
    });
  });

  describe('getServerLang / setServerLang', () => {
    it('returns default when no setting exists', () => {
      expect(service.getServerLang('guild1')).toBe('en');
    });

    it('returns the set language after setServerLang', () => {
      service.setServerLang('guild1', 'ja');
      expect(service.getServerLang('guild1')).toBe('ja');
    });

    it('overwrites previous setting', () => {
      service.setServerLang('guild1', 'ja');
      service.setServerLang('guild1', 'ko');
      expect(service.getServerLang('guild1')).toBe('ko');
    });
  });

  describe('getEffectiveLang', () => {
    it('returns default when nothing is set', () => {
      expect(service.getEffectiveLang('user1', 'guild1')).toBe('en');
    });

    it('returns server lang when only server is set', () => {
      service.setServerLang('guild1', 'ja');
      expect(service.getEffectiveLang('user1', 'guild1')).toBe('ja');
    });

    it('returns user lang when only user is set', () => {
      service.setUserLang('user1', 'fr');
      expect(service.getEffectiveLang('user1', 'guild1')).toBe('fr');
    });

    it('user preference takes priority over server setting', () => {
      service.setServerLang('guild1', 'ja');
      service.setUserLang('user1', 'fr');
      expect(service.getEffectiveLang('user1', 'guild1')).toBe('fr');
    });

    it('uses server lang for a user without preference', () => {
      service.setServerLang('guild1', 'ja');
      service.setUserLang('user1', 'fr');
      expect(service.getEffectiveLang('user2', 'guild1')).toBe('ja');
    });
  });

  describe('auto-translate channels', () => {
    it('returns undefined for non-existent channel', () => {
      expect(service.getAutoTranslateChannel('ch1')).toBeUndefined();
    });

    it('sets and retrieves an auto-translate channel', () => {
      service.setAutoTranslateChannel('ch1', 'guild1', 'es');
      const channel = service.getAutoTranslateChannel('ch1');
      expect(channel).toBeDefined();
      expect(channel!.channelId).toBe('ch1');
      expect(channel!.guildId).toBe('guild1');
      expect(channel!.targetLang).toBe('es');
      expect(channel!.enabled).toBe(true);
    });

    it('disables an auto-translate channel', () => {
      service.setAutoTranslateChannel('ch1', 'guild1', 'es');
      service.disableAutoTranslateChannel('ch1');
      const channel = service.getAutoTranslateChannel('ch1');
      expect(channel).toBeDefined();
      expect(channel!.enabled).toBe(false);
    });

    it('retrieves all channels for a guild', () => {
      service.setAutoTranslateChannel('ch1', 'guild1', 'es');
      service.setAutoTranslateChannel('ch2', 'guild1', 'fr');
      service.setAutoTranslateChannel('ch3', 'guild2', 'de');

      const guild1Channels = service.getGuildAutoTranslateChannels('guild1');
      expect(guild1Channels).toHaveLength(2);

      const channelIds = guild1Channels.map((c) => c.channelId).sort();
      expect(channelIds).toEqual(['ch1', 'ch2']);
    });

    it('returns empty array for guild with no channels', () => {
      expect(service.getGuildAutoTranslateChannels('guild1')).toEqual([]);
    });

    it('updates target lang on re-set', () => {
      service.setAutoTranslateChannel('ch1', 'guild1', 'es');
      service.setAutoTranslateChannel('ch1', 'guild1', 'fr');
      const channel = service.getAutoTranslateChannel('ch1');
      expect(channel!.targetLang).toBe('fr');
    });
  });
});
