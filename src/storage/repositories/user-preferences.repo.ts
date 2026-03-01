import type Database from 'better-sqlite3';
import type { UserPreferences } from '../../types/preferences.js';

export class UserPreferencesRepository {
  private db: Database.Database;

  constructor(db: Database.Database) {
    this.db = db;
  }

  get(userId: string): UserPreferences | undefined {
    const row = this.db
      .prepare('SELECT user_id, default_target_lang, updated_at FROM user_preferences WHERE user_id = ?')
      .get(userId) as { user_id: string; default_target_lang: string; updated_at: string } | undefined;

    if (!row) return undefined;

    return {
      userId: row.user_id,
      defaultTargetLang: row.default_target_lang,
      updatedAt: row.updated_at,
    };
  }

  set(userId: string, lang: string): void {
    this.db
      .prepare(
        `INSERT INTO user_preferences (user_id, default_target_lang, updated_at)
         VALUES (?, ?, datetime('now'))
         ON CONFLICT(user_id) DO UPDATE SET default_target_lang = excluded.default_target_lang, updated_at = excluded.updated_at`
      )
      .run(userId, lang);
  }

  delete(userId: string): void {
    this.db.prepare('DELETE FROM user_preferences WHERE user_id = ?').run(userId);
  }
}
