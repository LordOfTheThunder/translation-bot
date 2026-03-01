import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import type { SlashCommand, ServiceContainer } from '../types/index.js';
import { createHelpEmbed } from '../utils/embed-builder.js';

export const helpCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show bot commands and usage information'),

  async execute(interaction: ChatInputCommandInteraction, _services: ServiceContainer): Promise<void> {
    const embed = createHelpEmbed();
    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
