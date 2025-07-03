const fs = require('fs');
const path = require('path');
const os = require('os');

function getIndexPath(isGlobal) {
  const base = isGlobal ? os.homedir() : process.cwd();
  return path.join(base, '.llm-cli', 'index.json');
}

function readIndex(indexPath) {
  if (!fs.existsSync(indexPath)) return [];
  return JSON.parse(fs.readFileSync(indexPath, 'utf8'));
}

module.exports = (program) => {
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
