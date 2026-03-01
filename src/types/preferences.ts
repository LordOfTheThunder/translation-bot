export interface UserPreferences {
  userId: string;
  defaultTargetLang: string;
  updatedAt: string;
}

export interface ServerSettings {
  guildId: string;
  defaultTargetLang: string;
  updatedAt: string;
}

export interface AutoTranslateChannel {
  channelId: string;
  guildId: string;
  targetLang: string;
  enabled: boolean;
  createdAt: string;
}
