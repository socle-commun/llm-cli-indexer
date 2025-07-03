#!/usr/bin/env node

import { Command } from 'commander';

const program = new Command();

program
  .name('llm-cli')
  .description('An LLM-Friendly Command Line Index')
  .version('0.0.1');

// Load commands
import { command as initCommand } from './commands/init/index.js';
import { command as addCommand } from './commands/add/index.js';
import { command as listCommand } from './commands/list/index.js';
import { command as removeCommand } from './commands/remove/index.js';
import { command as searchCommand } from './commands/search/index.js';
import { command as updateCommand } from './commands/update/index.js';
import { command as validateCommand } from './commands/validate/index.js';

initCommand(program);
addCommand(program);
listCommand(program);
removeCommand(program);
searchCommand(program);
updateCommand(program);
validateCommand(program);

program.parse(process.argv);