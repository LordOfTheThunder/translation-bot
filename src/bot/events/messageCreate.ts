import type { Client } from 'discord.js';
import type { ServiceContainer } from '../../types/index.js';
import { createTranslationEmbed, createErrorEmbed } from '../../utils/embed-builder.js';

export function registerMessageCreateEvent(client: Client, services: ServiceContainer): void {
  client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (!message.content.trim()) return;

    const autoTranslate = services.preferences.getAutoTranslateChannel(message.channelId);
    if (!autoTranslate || !autoTranslate.enabled) return;

    try {
      const result = await services.translation.translate(
        message.content,
        autoTranslate.targetLang,
      );

      if (result.sourceLanguage === result.targetLanguage) return;

      const embed = createTranslationEmbed(result);
      await message.reply({ embeds: [embed] });
    } catch (error) {
      services.logger.error({ err: error, channelId: message.channelId }, 'Auto-translate failed');
    }
  });
}
