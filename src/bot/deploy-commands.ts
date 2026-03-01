import { REST, Routes } from 'discord.js';
import { loadConfig } from '../config.js';
import { commands } from '../commands/index.js';

async function deployCommands(): Promise<void> {
  const config = loadConfig();
  const rest = new REST({ version: '10' }).setToken(config.discordToken);

  const commandData = [...commands.values()].map((cmd) => cmd.data.toJSON());

  console.log(`Deploying ${commandData.length} slash command(s)...`);

  try {
    await rest.put(Routes.applicationCommands(config.clientId), {
      body: commandData,
    });
    console.log(`Successfully deployed ${commandData.length} command(s).`);
  } catch (error) {
    console.error('Failed to deploy commands:', error);
    process.exit(1);
  }
}

deployCommands();
