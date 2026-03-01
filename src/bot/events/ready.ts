import type { Client } from 'discord.js';
import type { Logger } from 'pino';

export function registerReadyEvent(client: Client, logger: Logger): void {
  client.once('ready', (readyClient) => {
    logger.info(`Bot logged in as ${readyClient.user.tag}`);
    logger.info(`Serving ${readyClient.guilds.cache.size} guild(s)`);
  });
}
