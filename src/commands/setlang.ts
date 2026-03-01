import { ChatInputCommandInteraction, SlashCommandBuilder, AutocompleteInteraction } from 'discord.js';
import type { SlashCommand, ServiceContainer } from '../types/index.js';
import { isValidLanguageCode, getLanguageName, searchLanguages } from '../utils/language-codes.js';
import { createErrorEmbed } from '../utils/embed-builder.js';
import { EMBED_COLORS, BOT_NAME } from '../utils/constants.js';
import { EmbedBuilder } from 'discord.js';

export const setlangCommand: SlashCommand & {
  autocomplete(interaction: AutocompleteInteraction, services: ServiceContainer): Promise<void>;
} = {
  data: new SlashCommandBuilder()
    .setName('setlang')
    .setDescription('Set your preferred target language for translations')
    .addStringOption((option) =>
      option
        .setName('language')
        .setDescription('Language code (e.g., en, es, fr)')
        .setRequired(true)
        .setAutocomplete(true)
    ),

  async execute(interaction: ChatInputCommandInteraction, services: ServiceContainer): Promise<void> {
    const lang = interaction.options.getString('language', true).toLowerCase();

    if (!isValidLanguageCode(lang)) {
      const embed = createErrorEmbed(
        'Invalid Language',
        `\`${lang}\` is not a supported language code. Use \`/languages\` to see all supported languages.`,
      );
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    services.preferences.setUserLang(interaction.user.id, lang);

    const name = getLanguageName(lang);
    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.SUCCESS)
      .setTitle('Language Preference Updated')
      .setDescription(`Your default target language has been set to **${name}** (\`${lang}\`).`)
      .setFooter({ text: BOT_NAME })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },

  async autocomplete(interaction: AutocompleteInteraction): Promise<void> {
    const focused = interaction.options.getFocused();
    const results = searchLanguages(focused).slice(0, 25);

    await interaction.respond(
      results.map(({ code, name }) => ({ name: `${name} (${code})`, value: code })),
    );
  },
};
