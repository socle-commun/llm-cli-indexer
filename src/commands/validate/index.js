import fs from 'fs';
import path from 'path';
import os from 'os';
import { getIndexPath, readIndex, writeIndex } from '../../utils/index.js';

export const command = (program) => {
  program.command('validate')
    .description('Validates the JSON index structure and binary presence')
    .option('-g, --global', 'Validate global ~/.llm-cli/ instead of local ./.llm-cli/')
    .action((options) => {
      const indexPath = getIndexPath(options.global);
      if (!fs.existsSync(indexPath)) {
        console.error(`Error: Index file not found at ${indexPath}`);
        process.exit(1);
      }

      try {
        const index = readIndex(indexPath);
        // Basic validation: check for required fields and duplicates
        const names = new Set();
        for (const cmd of index) {
          if (!cmd.name || !cmd.url || !cmd.description || !cmd.tags || cmd.llmHelpSource === undefined || cmd.dev === undefined || cmd.global === undefined) {
            console.error(`Error: Command missing required fields: ${JSON.stringify(cmd)}`);
            process.exit(1);
          }
          if (names.has(cmd.name)) {
            console.error(`Error: Duplicate command name found: ${cmd.name}`);
            process.exit(1);
          }
          names.add(cmd.name);

          // Check if URL points to an existing file
          const urlPath = cmd.url.replace(/^file:\/\//, '');
          if (!fs.existsSync(urlPath)) {
            console.error(`Error: Binary not found for command '${cmd.name}' at ${urlPath}`);
            process.exit(1);
          }
        }
        console.log('Index is valid.');
      } catch (error) {
        console.error(`Error: Invalid index file: ${error.message}`);
        process.exit(1);
      }
    });
};