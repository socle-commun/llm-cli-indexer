const fs = require('fs');
const path = require('path');
const os = require('os');

function getIndexPath(isGlobal) {
  const base = isGlobal ? os.homedir() : process.cwd();
  return path.join(base, '.llm-cli', 'index.json');
}

function readIndex(p) {
  if (!fs.existsSync(p)) return [];
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

module.exports = (program) => {
  program.command('search <query>')
    .description('Search commands in the index')
    .option('-g, --global', 'Use global index')
    .option('-t, --tag <tag>', 'Filter by tag')
    .option('--include-dev', 'Include dev commands')
    .action((query, options) => {
      const terms = query.toLowerCase().split(/\s+/);
      const index = readIndex(getIndexPath(options.global));
      const results = index.filter(c => {
        if (!options.includeDev && c.dev) return false;
        if (options.tag && !(c.tags || []).includes(options.tag)) return false;
        const text = `${c.name} ${c.description}`.toLowerCase();
        return terms.every(t => text.includes(t));
      });
      results.forEach(c => console.log(c.name));
    });
};
