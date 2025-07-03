import fs from 'fs';
import path from 'path';
import os from 'os';
import { execSync } from 'child_process';
import { getIndexPath, readIndex, writeIndex } from '../../utils/index.js';

function getCommandDescription(commandPath, llmHelpSource) {
  let commandToExecute = `${commandPath} ${llmHelpSource}`;
  if (commandPath.endsWith('.js')) {
    commandToExecute = `node ${commandPath} ${llmHelpSource}`;
  }

  try {
    const output = execSync(commandToExecute, { encoding: 'utf8', stdio: 'pipe' });
    const lines = output.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);
    return lines.length > 0 ? lines[0] : '';
  } catch (error) {
    console.error(`Error executing '${commandToExecute}': ${error.message}`);
    throw new Error(`Command '${path.basename(commandPath)}' did not respond to ${llmHelpSource} or returned an error.`);
  }
}

export const command = (program) => {
  program.command('add <command-path>')
    .description('Registers a CLI command for AI invocation')
    .option('-n, --name <name>', 'Explicit name for the command (required if ambiguous)')
    .option('-t, --tag <tag...>', 'Tag(s) associated, repeatable (-t analyze -t ast)')
    .option('-g, --global', 'Register in ~/.llm-cli/ instead of ./.llm-cli/')
    .option('--dev', 'Mark the command as available only in dev')
    .option('--llm-help <command>', 'Command to execute to generate AI doc (default: --llm)', '--llm')
    .option('-d, --description <description>', 'Custom description for the command')
    .option('-i, --install <command>', 'Command to execute for installation')
    .action((commandPath, options) => {
      const indexPath = getIndexPath(options.global);
      let index = readIndex(indexPath);

      const resolvedPath = path.resolve(commandPath).replace(/\\/g, '/'); // Normalize path for URL

      let description = '';
      if (options.description) { // Prioritize user-provided description
        description = options.description;
      } else {
        // Validate if the command exists and responds to help
        try {
          description = getCommandDescription(resolvedPath, options.llmHelp || '--llm');
        } catch (error) {
          console.error(`Error: ${error.message}`);
          process.exit(1);
        }
      }

      const newCommand = {
        name: options.name || path.basename(commandPath),
        url: `file://${resolvedPath}`,
        description: description,
        tags: options.tag || [],
        llmHelpSource: options.llmHelp || '--llm',
        dev: options.dev || false,
        global: options.global || false,
        installCommand: options.install || undefined,
      };

      // Basic validation: check if command name already exists
      if (index.some(cmd => cmd.name === newCommand.name)) {
        console.error(`Error: Command with name '${newCommand.name}' already exists.`);
        process.exit(1);
      }

      index.push(newCommand);
      writeIndex(indexPath, index);
      console.log(`Command '${newCommand.name}' added successfully.`);
    });
};

// Export helper functions for testing if needed
export { getCommandDescription };
