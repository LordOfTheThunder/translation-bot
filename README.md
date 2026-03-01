# Translation Bot

A Discord bot for translating text between languages using the [MyMemory API](https://mymemory.translated.net/doc/spec.php). Supports slash commands, per-user language preferences, server defaults, and automatic channel translation.

## Features

- Translate text between 60+ languages via `/translate`
- Detect the language of any text via `/detect`
- Per-user and per-server default target language
- Auto-translate channels that translate every message
- In-memory LRU cache to reduce duplicate API calls
- Rate limiting with daily character quotas
- SQLite-backed persistent preferences

## Prerequisites

- Node.js 18+
- A Discord bot token ([Discord Developer Portal](https://discord.com/developers/applications))
- npm

## Setup

1. Clone the repository and install dependencies:

```
npm install
```

2. Copy the example environment file and fill in your values:

```
cp .env.example .env
```

3. Edit `.env` with your credentials:

| Variable | Required | Description |
|---|---|---|
| `DISCORD_TOKEN` | Yes | Your Discord bot token |
| `CLIENT_ID` | Yes | Your Discord application client ID |
| `MYMEMORY_EMAIL` | No | Email for higher API limits (50k vs 5k chars/day) |
| `DEFAULT_TARGET_LANG` | No | Default target language code (default: `en`) |
| `LOG_LEVEL` | No | Log level: debug, info, warn, error (default: `info`) |

4. Register slash commands with Discord:

```
npm run deploy-commands
```

5. Start the bot:

```
npm run dev
```

## Commands

| Command | Description |
|---|---|
| `npm install` | Install dependencies |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run the compiled bot |
| `npm run dev` | Run in development mode with auto-reload |
| `npm run deploy-commands` | Register slash commands with Discord |
| `npm test` | Run tests |
| `npm run typecheck` | Type-check without emitting |

## Slash Commands

| Command | Description |
|---|---|
| `/translate` | Translate text to a target language |
| `/detect` | Detect the language of a text |
| `/setlang` | Set your preferred target language |
| `/languages` | List all supported languages |
| `/autotranslate` | Enable/disable auto-translation in a channel |
| `/help` | Show help information |

## Rate Limits

The MyMemory API enforces daily character limits:

- **Anonymous**: 5,000 characters/day
- **With email** (`MYMEMORY_EMAIL`): 50,000 characters/day

The bot also applies per-second request throttling to avoid overloading the API. Translations are cached in memory (LRU, 1 hour TTL) to minimize redundant requests.

## Project Structure

```
src/
  bot/           Discord client, event handlers, deploy script
  commands/      Slash command definitions
  services/      Business logic (translation, detection, caching, rate limiting)
  storage/       SQLite database, migrations, repositories
  types/         TypeScript interfaces and error types
  utils/         Logger, embed builder, language codes, constants
  config.ts      Environment variable loading
  index.ts       Application entry point
tests/
  integration/   Integration tests
```

## License

ISC
