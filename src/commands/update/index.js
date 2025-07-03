import fs from 'fs';
import path from 'path';
import os from 'os';
import { getIndexPath, readIndex, writeIndex } from '../../utils/index.js';

export const command = (program) => {
  program.command('update <name>')
    .description('Modifies fields of a registered command')
    .option('-n, --new-name <name>', 'New name for the command')
    .option('-t, --tag <tag...>', 'New tag(s) associated, repeatable (-t analyze -t ast)')
    .option('-g, --global', 'Update in global ~/.llm-cli/ instead of local ./.llm-cli/')
    .option('--llm-help <command>', 'New command to execute to generate AI doc')
    .option('-d, --description <description>', 'New description for the command')
    .option('--dev', 'Set dev flag to true') // Only set to true if --dev is present
    .action((name, options) => {
      const indexPath = getIndexPath(options.global);
      let index = readIndex(indexPath);

      const commandIndex = index.findIndex(cmd => cmd.name === name);

      if (commandIndex === -1) {
        console.error(`Error: Command '${name}' not found.`);
        process.exit(1);
      }

      const commandToUpdate = index[commandIndex];

      // Handle new name, check for duplicates
      if (options.newName && options.newName !== name) {
        if (index.some((cmd, i) => i !== commandIndex && cmd.name === options.newName)) {
          console.error(`Error: Command with new name '${options.newName}' already exists.`);
          process.exit(1);
        }
        commandToUpdate.name = options.newName;
      }

      if (options.tag) {
        commandToUpdate.tags = options.tag;
      }
      // Only set dev to true if --dev is explicitly passed
      if (options.dev) {
        commandToUpdate.dev = true;
      }
      // If --dev is not passed, the dev flag remains unchanged.

      if (options.llmHelp) {
        commandToUpdate.llmHelpSource = options.llmHelp;
      }
      if (options.description) {
        commandToUpdate.description = options.description;
      }

      writeIndex(indexPath, index);
      console.log(`Command '${name}' updated successfully.`);
    });
};