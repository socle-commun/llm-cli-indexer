import fs from 'fs';
import path from 'path';
import os from 'os';
import { getIndexPath, readIndex, writeIndex } from '../../utils/index.js';

export const command = (program) => {
  program.command('search <keywords...>')
    .description('Searches registered commands by name, description, or tag')
    .option('-g, --global', 'Use global index')
    .option('-t, --tag <tag>', 'Filter by tag')
    .option('--include-dev', 'Include dev commands')
    .action((keywords, options) => {
      const terms = keywords.map(k => k.toLowerCase());
      const indexPath = getIndexPath(options.global);
      const index = readIndex(indexPath);

      const results = index.filter(c => {
        if (!options.includeDev && c.dev) return false;
        if (options.tag && !(c.tags || []).includes(options.tag)) return false;

        const text = `${c.name || ''} ${c.description || ''} ${(c.tags || []).join(' ')}`.toLowerCase();
        return terms.every(term => text.includes(term));
      });

      results.forEach(c => console.log(c.name));
    });
};