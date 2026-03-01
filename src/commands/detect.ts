import { SlashCommandBuilder, type ChatInputCommandInteraction } from 'discord.js';
import type { SlashCommand, ServiceContainer } from '../types/index.js';
import { createDetectionEmbed, createErrorEmbed } from '../utils/embed-builder.js';
import { TranslationError } from '../types/errors.js';

export const detectCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('detect')
    .setDescription('Detect the language of a text')
    .addStringOption((option) =>
      option.setName('text').setDescription('The text to detect the language of').setRequired(true),
    ),

  async execute(interaction: ChatInputCommandInteraction, services: ServiceContainer): Promise<void> {
    const text = interaction.options.getString('text', true);

    await interaction.deferReply();

    try {
      const result = await services.detection.detect(text);
      const embed = createDetectionEmbed(result);
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      const message =
        error instanceof TranslationError
          ? error.message
          : 'An unexpected error occurred during language detection.';
      const embed = createErrorEmbed('Detection Error', message);
      await interaction.editReply({ embeds: [embed] });
    }
  },
};
