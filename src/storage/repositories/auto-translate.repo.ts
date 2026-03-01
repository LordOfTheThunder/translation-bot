import type Database from 'better-sqlite3';
import type { AutoTranslateChannel } from '../../types/preferences.js';

interface AutoTranslateRow {
  channel_id: string;
  guild_id: string;
  target_lang: string;
  enabled: number;
  created_at: string;
}

function rowToChannel(row: AutoTranslateRow): AutoTranslateChannel {
  return {
    channelId: row.channel_id,
    guildId: row.guild_id,
    targetLang: row.target_lang,
    enabled: row.enabled === 1,
    createdAt: row.created_at,
  };
}

export class AutoTranslateRepository {
  private db: Database.Database;

  constructor(db: Database.Database) {
    this.db = db;
  }

  get(channelId: string): AutoTranslateChannel | undefined {
    const row = this.db
      .prepare('SELECT channel_id, guild_id, target_lang, enabled, created_at FROM auto_translate_channels WHERE channel_id = ?')
      .get(channelId) as AutoTranslateRow | undefined;

    if (!row) return undefined;
    return rowToChannel(row);
  }

  set(channelId: string, guildId: string, targetLang: string): void {
    this.db
      .prepare(
        `INSERT INTO auto_translate_channels (channel_id, guild_id, target_lang, created_at)
         VALUES (?, ?, ?, datetime('now'))
         ON CONFLICT(channel_id) DO UPDATE SET guild_id = excluded.guild_id, target_lang = excluded.target_lang`
      )
      .run(channelId, guildId, targetLang);
  }

  delete(channelId: string): void {
    this.db.prepare('DELETE FROM auto_translate_channels WHERE channel_id = ?').run(channelId);
  }

  getByGuild(guildId: string): AutoTranslateChannel[] {
    const rows = this.db
      .prepare('SELECT channel_id, guild_id, target_lang, enabled, created_at FROM auto_translate_channels WHERE guild_id = ?')
      .all(guildId) as AutoTranslateRow[];

    return rows.map(rowToChannel);
  }

  setEnabled(channelId: string, enabled: boolean): void {
    this.db
      .prepare('UPDATE auto_translate_channels SET enabled = ? WHERE channel_id = ?')
      .run(enabled ? 1 : 0, channelId);
  }
}
