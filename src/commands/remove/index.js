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

function writeIndex(p, data) {
  fs.writeFileSync(p, JSON.stringify(data, null, 2));
}

module.exports = (program) => {
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
