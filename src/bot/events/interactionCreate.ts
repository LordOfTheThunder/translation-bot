import type { AutocompleteInteraction, Client } from 'discord.js';
import type { SlashCommand, ServiceContainer } from '../../types/index.js';
import { createErrorEmbed } from '../../utils/embed-builder.js';

export function registerInteractionCreateEvent(
  client: Client,
  commands: Map<string, SlashCommand>,
  services: ServiceContainer,
): void {
  client.on('interactionCreate', async (interaction) => {
    if (interaction.isChatInputCommand()) {
      const command = commands.get(interaction.commandName);
      if (!command) {
        services.logger.warn(`Unknown command: ${interaction.commandName}`);
        return;
      }

      try {
        await command.execute(interaction, services);
      } catch (error) {
        services.logger.error({ err: error, command: interaction.commandName }, 'Command execution failed');

        const embed = createErrorEmbed('Command Error', 'An unexpected error occurred while executing the command.');

        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ embeds: [embed], ephemeral: true }).catch(() => {});
        } else {
          await interaction.reply({ embeds: [embed], ephemeral: true }).catch(() => {});
        }
      }
      return;
    }

    if (interaction.isAutocomplete()) {
      const command = commands.get(interaction.commandName) as SlashCommand & {
        autocomplete?: (autocompleteInteraction: AutocompleteInteraction, services: ServiceContainer) => Promise<void>;
      };

      if (!command?.autocomplete) return;

      try {
        await command.autocomplete(interaction, services);
      } catch (error) {
        services.logger.error({ err: error, command: interaction.commandName }, 'Autocomplete handler failed');
      }
    }
  });
}
