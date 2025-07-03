const { Command } = require('commander');

const program = new Command();

program
  .name('llm-cli')
  .description('An LLM-Friendly Command Line Index')
  .version('0.0.1');

// Load commands
require('./commands/init')(program);
require('./commands/add')(program);
require('./commands/list')(program);
require('./commands/remove')(program);
require('./commands/search')(program);
require('./commands/update')(program);
require('./commands/validate')(program);

program.parse(process.argv);
