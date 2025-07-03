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
  program.command('update <name>')
    .description('Update a command in the index')
    .option('-g, --global', 'Use global index')
    .option('--new-name <name>', 'New command name')
    .option('-t, --tag <tag...>', 'Set tags')
    .option('--dev', 'Set dev flag true')
    .option('--llm-help <cmd>', 'New llm help source')
    .option('-d, --description <desc>', 'New description')
    .action((name, options) => {
      const indexPath = getIndexPath(options.global);
      const index = readIndex(indexPath);
      const cmd = index.find(c => c.name === name);
      if (!cmd) {
        console.error(`Error: Command '${name}' not found.`);
        process.exit(1);
      }
      if (options.newName) {
        if (index.some(c => c.name === options.newName)) {
          console.error(`Error: Command with new name '${options.newName}' already exists.`);
          process.exit(1);
        }
        cmd.name = options.newName;
      }
      if (options.tag) cmd.tags = options.tag;
      if (options.dev !== undefined) cmd.dev = true;
      if (options.llmHelp) cmd.llmHelpSource = options.llmHelp;
      if (options.description) cmd.description = options.description;
      writeIndex(indexPath, index);
      console.log(`Command '${cmd.name}' updated successfully.`);
    });
};
