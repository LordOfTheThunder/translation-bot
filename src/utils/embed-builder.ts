import { EmbedBuilder } from 'discord.js';
import { EMBED_COLORS, BOT_NAME } from './constants.js';
import type { TranslationResult, DetectionResult } from '../types/translation.js';

export function createTranslationEmbed(result: TranslationResult): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(EMBED_COLORS.SUCCESS)
    .setTitle('Translation')
    .setDescription(result.translatedText || '(empty)')
    .addFields(
      { name: 'From', value: result.sourceLanguage || 'auto', inline: true },
      { name: 'To', value: result.targetLanguage || 'unknown', inline: true },
    )
    .setFooter({ text: BOT_NAME })
    .setTimestamp();
}

export function createErrorEmbed(title: string, description: string): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(EMBED_COLORS.ERROR)
    .setTitle(title)
    .setDescription(description)
    .setFooter({ text: BOT_NAME })
    .setTimestamp();
}

export function createHelpEmbed(): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(EMBED_COLORS.INFO)
    .setTitle(`${BOT_NAME} - Help`)
    .setDescription('A Discord bot for translating text between languages using MyMemory API.')
    .addFields(
      { name: '/translate', value: 'Translate text to a target language' },
      { name: '/detect', value: 'Detect the language of a text' },
      { name: '/setlang', value: 'Set your preferred target language' },
      { name: '/languages', value: 'List all supported languages' },
      { name: '/autotranslate', value: 'Toggle auto-translation in a channel' },
      { name: '/help', value: 'Show this help message' },
    )
    .setFooter({ text: BOT_NAME })
    .setTimestamp();
}

export function createLanguageListEmbed(languages: Array<{ code: string; name: string }>): EmbedBuilder {
  const list = languages.map(({ code, name }) => `\`${code}\` - ${name}`).join('\n');

  return new EmbedBuilder()
    .setColor(EMBED_COLORS.INFO)
    .setTitle('Supported Languages')
    .setDescription(list || 'No languages available.')
    .setFooter({ text: BOT_NAME })
    .setTimestamp();
}

export function createDetectionEmbed(result: DetectionResult): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(EMBED_COLORS.SUCCESS)
    .setTitle('Language Detection')
    .addFields(
      { name: 'Language Code', value: result.language, inline: true },
      { name: 'Language Name', value: result.languageName, inline: true },
      { name: 'Confidence', value: `${Math.round(result.confidence * 100)}%`, inline: true },
    )
    .setFooter({ text: BOT_NAME })
    .setTimestamp();
}
