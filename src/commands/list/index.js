import fs from 'fs';
import path from 'path';
import os from 'os';
import { getIndexPath, readIndex, writeIndex } from '../../utils/index.js';

export const command = (program) => {
  program.command('list')
    .description('List commands in the llm-cli index')
    .option('-g, --global', 'Use global index')
    .option('--include-dev', 'Include dev commands')
    .action((options) => {
      const index = readIndex(getIndexPath(options.global));
      const cmds = index.filter(c => options.includeDev || !c.dev);
      cmds.forEach(c => console.log(c.name));
    });
};
