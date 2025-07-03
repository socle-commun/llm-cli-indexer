const { Command } = require('commander');

const program = new Command();

program
  .name('llm-cli')
  .description('An LLM-Friendly Command Line Index')
  .version('0.0.1');

// Load commands
require('./commands/init')(program);
require('./commands/add')(program);

program.parse(process.argv);
