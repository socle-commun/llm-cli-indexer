import fs from 'fs';
import path from 'path';
import os from 'os';
import { getIndexPath, readIndex, writeIndex } from '../../utils/index.js';

/**
 * Intern note: command removal scenarios live in docs/features/remove.feature.
 */

export const command = (program) => {
  program.command('remove <name>')
    .description('Remove a command from the index')
    .option('-g, --global', 'Use global index')
    .action((name, options) => {
      const indexPath = getIndexPath(options.global);
      const index = readIndex(indexPath);
      const filtered = index.filter(c => c.name !== name);
      if (filtered.length === index.length) {
        console.error(`Error: Command '${name}' not found.`);
        process.exit(1);
      }
      writeIndex(indexPath, filtered);
      console.log(`Command '${name}' removed successfully.`);
    });
};