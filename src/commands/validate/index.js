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
  program.command('validate')
    .description('Validate the llm-cli index')
    .option('-g, --global', 'Use global index')
    .action((options) => {
      const indexPath = getIndexPath(options.global);
      try {
        const index = readIndex(indexPath);
        const seen = new Set();
        index.forEach(cmd => {
          if (!cmd.name || !cmd.url) throw new Error('Missing required field');
          if (seen.has(cmd.name)) throw new Error('Duplicate names');
          seen.add(cmd.name);
          const filePath = cmd.url.replace('file://', '');
          if (!fs.existsSync(filePath)) throw new Error(`Missing file ${cmd.name}`);
        });
        console.log('Index is valid.');
      } catch (e) {
        console.error(`Validation error: ${e.message}`);
        process.exit(1);
      }
    });
};
