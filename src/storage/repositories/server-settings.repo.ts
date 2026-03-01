import type Database from 'better-sqlite3';
import type { ServerSettings } from '../../types/preferences.js';

export class ServerSettingsRepository {
  private db: Database.Database;

  constructor(db: Database.Database) {
    this.db = db;
  }

  get(guildId: string): ServerSettings | undefined {
    const row = this.db
      .prepare('SELECT guild_id, default_target_lang, updated_at FROM server_settings WHERE guild_id = ?')
      .get(guildId) as { guild_id: string; default_target_lang: string; updated_at: string } | undefined;

    if (!row) return undefined;

    return {
      guildId: row.guild_id,
      defaultTargetLang: row.default_target_lang,
      updatedAt: row.updated_at,
    };
  }

  set(guildId: string, lang: string): void {
    this.db
      .prepare(
        `INSERT INTO server_settings (guild_id, default_target_lang, updated_at)
         VALUES (?, ?, datetime('now'))
         ON CONFLICT(guild_id) DO UPDATE SET default_target_lang = excluded.default_target_lang, updated_at = excluded.updated_at`
      )
      .run(guildId, lang);
  }

  delete(guildId: string): void {
    this.db.prepare('DELETE FROM server_settings WHERE guild_id = ?').run(guildId);
  }
}
