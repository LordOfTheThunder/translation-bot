import { Client, Events, MessageReaction, PartialMessageReaction, User, PartialUser } from 'discord.js';
import type { ServiceContainer } from '../../types/index.js';
import { flagEmojiToLanguage } from '../../utils/flag-emojis.js';
import { createTranslationEmbed, createErrorEmbed } from '../../utils/embed-builder.js';
import { getLanguageName } from '../../utils/language-codes.js';
import {
  DailyLimitError,
  RateLimitError,
  TextTooLongError,
} from '../../types/errors.js';

export function registerMessageReactionAddEvent(client: Client, services: ServiceContainer): void {
  client.on(Events.MessageReactionAdd, async (
    reaction: MessageReaction | PartialMessageReaction,
    user: User | PartialUser,
  ) => {
    try {
      // Ignore bot reactions
      if (user.bot) return;

      const emoji = reaction.emoji.name;
      if (!emoji) return;

      const targetLang = flagEmojiToLanguage(emoji);
      if (!targetLang) return;

      // Fetch partial reaction/message if needed
      if (reaction.partial) {
        try {
          await reaction.fetch();
        } catch {
          services.logger.warn('Failed to fetch partial reaction');
          return;
        }
      }

      const message = reaction.message;
      if (message.partial) {
        try {
          await message.fetch();
        } catch {
          services.logger.warn('Failed to fetch partial message');
          return;
        }
      }

      const text = message.content;
      if (!text) return;

      const langName = getLanguageName(targetLang) ?? targetLang;

      services.logger.info({
        event: 'flag_reaction_translate',
        userId: user.id,
        channelId: message.channelId,
        targetLang,
        textLength: text.length,
      }, `Flag reaction translation requested: ${emoji} → ${langName}`);

      // Detect source language first instead of relying on MyMemory autodetect
      const detected = await services.detection.detect(text);
      const sourceLang = detected.language;

      // Don't translate if source and target are the same language
      if (sourceLang === targetLang) return;

      const result = await services.translation.translate(text, targetLang, sourceLang);

      const embed = createTranslationEmbed(result);
      await message.reply({ embeds: [embed] });
    } catch (error) {
      const msg = reaction.message;

      try {
        if (error instanceof TextTooLongError) {
          await msg.reply({
            embeds: [createErrorEmbed('Text Too Long', 'Message is too long to translate (max 500 characters).')],
          });
        } else if (error instanceof DailyLimitError) {
          await msg.reply({
            embeds: [createErrorEmbed('Limit Reached', 'Daily translation limit reached. Resets at midnight UTC.')],
          });
        } else if (error instanceof RateLimitError) {
          await msg.reply({
            embeds: [createErrorEmbed('Rate Limited', 'Translation service is temporarily busy. Try again in a few seconds.')],
          });
        } else {
          services.logger.error({ err: error, message: error instanceof Error ? error.message : String(error) }, 'Flag reaction translation failed');
        }
      } catch (replyError) {
        services.logger.error({ err: replyError, message: replyError instanceof Error ? replyError.message : String(replyError) }, 'Failed to send error reply');
      }
    }
  });
}
