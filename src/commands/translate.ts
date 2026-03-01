import { SlashCommandBuilder, type ChatInputCommandInteraction } from 'discord.js';
import type { SlashCommand, ServiceContainer } from '../types/index.js';
import { createTranslationEmbed, createErrorEmbed } from '../utils/embed-builder.js';
import { isValidLanguageCode } from '../utils/language-codes.js';
import {
  TranslationError,
  RateLimitError,
  DailyLimitError,
  TextTooLongError,
  UnsupportedLanguageError,
} from '../types/errors.js';

export const translateCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('translate')
    .setDescription('Translate text to a target language')
    .addStringOption((option) =>
      option.setName('text').setDescription('The text to translate').setRequired(true),
    )
    .addStringOption((option) =>
      option.setName('target').setDescription('Target language code (e.g., en, es, fr)').setRequired(true),
    )
    .addStringOption((option) =>
      option.setName('from').setDescription('Source language code (auto-detect if omitted)').setRequired(false),
    ),

  async execute(interaction: ChatInputCommandInteraction, services: ServiceContainer): Promise<void> {
    const text = interaction.options.getString('text', true);
    const target = interaction.options.getString('target', true).toLowerCase();
    const from = interaction.options.getString('from')?.toLowerCase();

    if (!isValidLanguageCode(target)) {
      const embed = createErrorEmbed('Invalid Language', `\`${target}\` is not a supported language code. Use \`/languages\` to see available languages.`);
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    if (from && !isValidLanguageCode(from)) {
      const embed = createErrorEmbed('Invalid Language', `\`${from}\` is not a supported source language code. Use \`/languages\` to see available languages.`);
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    await interaction.deferReply();

    try {
      const result = await services.translation.translate(text, target, from);
      const embed = createTranslationEmbed(result);
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      const embed = buildErrorEmbed(error);
      await interaction.editReply({ embeds: [embed] });
    }
  },
};

function buildErrorEmbed(error: unknown) {
  if (error instanceof TextTooLongError) {
    return createErrorEmbed('Text Too Long', error.message);
  }
  if (error instanceof DailyLimitError) {
    return createErrorEmbed('Daily Limit Reached', 'The daily translation character limit has been reached. Please try again tomorrow.');
  }
  if (error instanceof RateLimitError) {
    return createErrorEmbed('Rate Limited', 'Too many requests. Please wait a moment and try again.');
  }
  if (error instanceof UnsupportedLanguageError) {
    return createErrorEmbed('Unsupported Language', error.message);
  }
  if (error instanceof TranslationError) {
    return createErrorEmbed('Translation Error', error.message);
  }
  return createErrorEmbed('Error', 'An unexpected error occurred during translation.');
}
