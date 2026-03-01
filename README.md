# Translation Bot

A Discord bot for translating text between languages using the [MyMemory API](https://mymemory.translated.net/doc/spec.php). Supports slash commands, per-user language preferences, server defaults, and automatic channel translation.

## Features

- **Flag emoji react-to-translate** — react to any message with a country flag (e.g. 🇫🇷 🇪🇸 🇩🇪 🇯🇵) and the bot replies with the translation
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

## Deploy to JustRunMy.app

The bot includes a production `Dockerfile` for easy deployment to [JustRunMy.app](https://justrunmy.app/discord-bots).

### Option A: Git Push (recommended)

1. Create a new app on [JustRunMy.app](https://justrunmy.app) and choose **Git** as the deploy method.
2. Copy the git remote command from the dashboard and run it in this project:

```bash
git remote add jrma <your-jrma-git-url>
git push jrma main
```

3. In the JustRunMy.app dashboard, add your environment variables:
   - `DISCORD_TOKEN` — your bot token
   - `CLIENT_ID` — your Discord application client ID
   - `MYMEMORY_EMAIL` — (optional) email for higher API limits

4. Start the container. Watch the logs until you see "Bot logged in as ...".

Every subsequent `git push jrma main` will redeploy automatically.

### Option B: Zip Upload

1. Build the project locally:

```bash
npm install && npm run build
```

2. Zip the project folder (excluding `node_modules`, `.git`, `tests`).
3. Upload the zip on [JustRunMy.app](https://justrunmy.app) — choose **Node.js** as the runtime.
4. Set your environment variables in the dashboard and start the app.

### Option C: Docker Push

1. Build the Docker image:

```bash
docker build -t translation-bot .
```

2. Tag and push to JustRunMy.app using the command from your dashboard:

```bash
docker tag translation-bot <your-jrma-registry-url>
docker push <your-jrma-registry-url>
```

3. Set environment variables in the dashboard and start.

### Register Slash Commands

After deploying, you still need to register slash commands once. You can do this locally:

```bash
npm run deploy-commands
```

Or via the JustRunMy.app web shell for your container.

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
