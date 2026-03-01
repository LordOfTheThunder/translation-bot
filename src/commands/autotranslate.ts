import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
  EmbedBuilder,
} from 'discord.js';
import type { SlashCommand, ServiceContainer } from '../types/index.js';
import { isValidLanguageCode, getLanguageName } from '../utils/language-codes.js';
import { createErrorEmbed } from '../utils/embed-builder.js';
import { EMBED_COLORS, BOT_NAME } from '../utils/constants.js';

export const autotranslateCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('autotranslate')
    .setDescription('Toggle automatic translation in a channel')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addStringOption((option) =>
      option
        .setName('toggle')
        .setDescription('Enable or disable auto-translation')
        .setRequired(true)
        .addChoices(
          { name: 'On', value: 'on' },
          { name: 'Off', value: 'off' },
        )
    )
    .addChannelOption((option) =>
      option
        .setName('channel')
        .setDescription('Target channel (defaults to current)')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName('language')
        .setDescription('Target language code (defaults to server setting)')
        .setRequired(false)
    ),

  async execute(interaction: ChatInputCommandInteraction, services: ServiceContainer): Promise<void> {
    const toggle = interaction.options.getString('toggle', true);
    const channel = interaction.options.getChannel('channel') ?? interaction.channel;
    const langOption = interaction.options.getString('language');

    if (!channel || !('id' in channel)) {
      const embed = createErrorEmbed('Error', 'Could not resolve the target channel.');
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    const channelId = channel.id;
    const guildId = interaction.guildId;

    if (!guildId) {
      const embed = createErrorEmbed('Error', 'This command can only be used in a server.');
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    if (toggle === 'off') {
      services.preferences.disableAutoTranslateChannel(channelId);

      const embed = new EmbedBuilder()
        .setColor(EMBED_COLORS.WARNING)
        .setTitle('Auto-Translate Disabled')
        .setDescription(`Auto-translation has been disabled for <#${channelId}>.`)
        .setFooter({ text: BOT_NAME })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
      return;
    }

    const targetLang = langOption?.toLowerCase() ?? services.preferences.getServerLang(guildId);

    if (!isValidLanguageCode(targetLang)) {
      const embed = createErrorEmbed(
        'Invalid Language',
        `\`${targetLang}\` is not a supported language code. Use \`/languages\` to see all supported languages.`,
      );
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    services.preferences.setAutoTranslateChannel(channelId, guildId, targetLang);

    const langName = getLanguageName(targetLang);
    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.SUCCESS)
      .setTitle('Auto-Translate Enabled')
      .setDescription(
        `Auto-translation has been enabled for <#${channelId}>.\nMessages will be translated to **${langName}** (\`${targetLang}\`).`,
      )
      .setFooter({ text: BOT_NAME })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
