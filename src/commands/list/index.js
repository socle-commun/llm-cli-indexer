import fs from 'fs';
import path from 'path';
import os from 'os';
import { getIndexPath, readIndex, writeIndex } from '../../utils/index.js';

export const command = (program) => {
  program.command('list')
    .description('List commands in the llm-cli index')
    .option('-g, --global', 'Use global index')
    .option('--include-dev', 'Include dev commands')
    .option('-t, --tag <tag...>', 'Filter by tag(s)')
    .option('--type <type>', 'Filter by command type/extension (e.g., js, sh, py)')
    .action((options) => {
      const index = readIndex(getIndexPath(options.global));

      let filteredCmds = index.filter(c => options.includeDev || !c.dev);

      if (options.type) {
        filteredCmds = filteredCmds.filter(c => {
          const ext = path.extname(c.url).slice(1); // Get extension without the dot
          return ext === options.type;
        });
      }

      if (options.tag && options.tag.length > 0) {
        filteredCmds = filteredCmds.filter(c => {
          return c.tags && c.tags.some(tag => options.tag.includes(tag));
        });
      }

      filteredCmds.forEach(c => console.log(c.name));
    });
};
