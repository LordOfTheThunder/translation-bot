import type { UserPreferencesRepository } from '../storage/repositories/user-preferences.repo.js';
import type { ServerSettingsRepository } from '../storage/repositories/server-settings.repo.js';
import type { AutoTranslateRepository } from '../storage/repositories/auto-translate.repo.js';
import type { AutoTranslateChannel } from '../types/preferences.js';

export class PreferencesService {
  private userRepo: UserPreferencesRepository;
  private serverRepo: ServerSettingsRepository;
  private autoTranslateRepo: AutoTranslateRepository;
  private defaultTargetLang: string;

  constructor(
    userRepo: UserPreferencesRepository,
    serverRepo: ServerSettingsRepository,
    autoTranslateRepo: AutoTranslateRepository,
    defaultTargetLang: string
  ) {
    this.userRepo = userRepo;
    this.serverRepo = serverRepo;
    this.autoTranslateRepo = autoTranslateRepo;
    this.defaultTargetLang = defaultTargetLang;
  }

  getUserLang(userId: string): string {
    return this.userRepo.get(userId)?.defaultTargetLang ?? this.defaultTargetLang;
  }

  setUserLang(userId: string, lang: string): void {
    this.userRepo.set(userId, lang);
  }

  getServerLang(guildId: string): string {
    return this.serverRepo.get(guildId)?.defaultTargetLang ?? this.defaultTargetLang;
  }

  setServerLang(guildId: string, lang: string): void {
    this.serverRepo.set(guildId, lang);
  }

  getEffectiveLang(userId: string, guildId: string): string {
    const userPref = this.userRepo.get(userId);
    if (userPref) return userPref.defaultTargetLang;

    const serverPref = this.serverRepo.get(guildId);
    if (serverPref) return serverPref.defaultTargetLang;

    return this.defaultTargetLang;
  }

  getAutoTranslateChannel(channelId: string): AutoTranslateChannel | undefined {
    return this.autoTranslateRepo.get(channelId);
  }

  setAutoTranslateChannel(channelId: string, guildId: string, targetLang: string): void {
    this.autoTranslateRepo.set(channelId, guildId, targetLang);
  }

  disableAutoTranslateChannel(channelId: string): void {
    this.autoTranslateRepo.setEnabled(channelId, false);
  }

  getGuildAutoTranslateChannels(guildId: string): AutoTranslateChannel[] {
    return this.autoTranslateRepo.getByGuild(guildId);
  }
}
