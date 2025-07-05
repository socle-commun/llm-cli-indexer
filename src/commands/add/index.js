import { getIndexPath, readIndex, writeIndex } from '../../utils/index.js';
import { processConfigFile } from './processes/processConfigFile.process.js';
import { processSingleCommand } from './processes/processSingleCommand.process.js';

/**
 * Intern note: `add` command behavior is described in
 * {@link ../docs/features/add.feature docs/features/add.feature}.
 * Auto inference and config file support live in
 * docs/features/add-auto-infer.feature and add-from-config.feature.
 */

export const command = (program) => {
  program.command('add [command...]')
    .description('Registers a CLI command for AI invocation or adds commands from a config file')
    .option('-n, --name <name>', 'Explicit name for the command (required if ambiguous)')
    .option('-t, --tag <tag...>', 'Tag(s) associated, repeatable (-t analyze -t ast)')
    .option('-g, --global', 'Register in ~/.llm-cli/ instead of ./.llm-cli/')
    .option('--dev', 'Mark the command as available only in dev')
    .option('--llm-help <command>', 'Command to execute to generate AI doc (default: --help)', '--help')
    .option('-d, --description <description>', 'Custom description for the command')
    .option('-i, --install <command>', 'Command to execute for installation')
    .option('--config <file>', 'Path to a JSON configuration file containing multiple commands')
    .action((commandNameOrPath, options) => {
      const indexPath = getIndexPath(options.global);
      let index = readIndex(indexPath);

      if (options.config) {
        processConfigFile(options, index, indexPath, writeIndex);
      } else if (commandNameOrPath && commandNameOrPath.length > 0) {
        processSingleCommand(commandNameOrPath, options, index, indexPath, writeIndex);
      } else {
        console.error('Error: Missing command or --config option.');
        program.help();
      }
    });
};
