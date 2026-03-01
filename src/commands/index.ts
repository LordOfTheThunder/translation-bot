import { Collection } from 'discord.js';
import type { SlashCommand } from '../types/index.js';
import { translateCommand } from './translate.js';
import { detectCommand } from './detect.js';
import { setlangCommand } from './setlang.js';
import { languagesCommand } from './languages.js';
import { autotranslateCommand } from './autotranslate.js';
import { helpCommand } from './help.js';

export const commands = new Collection<string, SlashCommand>();

commands.set(translateCommand.data.name, translateCommand);
commands.set(detectCommand.data.name, detectCommand);
commands.set(setlangCommand.data.name, setlangCommand);
commands.set(languagesCommand.data.name, languagesCommand);
commands.set(autotranslateCommand.data.name, autotranslateCommand);
commands.set(helpCommand.data.name, helpCommand);
