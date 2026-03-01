import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import type { SlashCommand, ServiceContainer } from '../types/index.js';
import { getAllLanguages } from '../utils/language-codes.js';
import { createLanguageListEmbed } from '../utils/embed-builder.js';

export const languagesCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('languages')
    .setDescription('List all supported languages'),

  async execute(interaction: ChatInputCommandInteraction, _services: ServiceContainer): Promise<void> {
    const languages = getAllLanguages();
    const embed = createLanguageListEmbed(languages);

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
