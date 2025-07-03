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
  program.command('add [command-path]') // command-path is now optional
    .description('Registers a CLI command for AI invocation or adds commands from a config file')
    .option('-n, --name <name>', 'Explicit name for the command (required if ambiguous)')
    .option('-t, --tag <tag...>', 'Tag(s) associated, repeatable (-t analyze -t ast)')
    .option('-g, --global', 'Register in ~/.llm-cli/ instead of ./.llm-cli/')
    .option('--dev', 'Mark the command as available only in dev')
    .option('--llm-help <command>', 'Command to execute to generate AI doc (default: --llm)', '--llm')
    .option('-d, --description <description>', 'Custom description for the command')
    .option('-i, --install <command>', 'Command to execute for installation')
    .option('--config <file>', 'Path to a JSON configuration file containing multiple commands')
    .action((commandPath, options) => {
      const indexPath = getIndexPath(options.global);
      let index = readIndex(indexPath);

      if (options.config) {
        // Logic for adding commands from a config file
        try {
          if (!fs.existsSync(options.config)) {
            console.error(`Error: Configuration file '${options.config}' not found.`);
            process.exit(1);
          }
          const configFileContent = fs.readFileSync(options.config, 'utf8');
          let commandsToAdd;
          try {
            commandsToAdd = JSON.parse(configFileContent);
          } catch (jsonError) {
            console.error(`Error: Invalid JSON format in configuration file '${options.config}'.`);
            process.exit(1);
          }

          if (!Array.isArray(commandsToAdd)) {
            console.error(`Error: Configuration file '${options.config}' must contain a JSON array of commands.`);
            process.exit(1);
          }

          const newCommandNames = new Set();
          for (const cmd of commandsToAdd) {
            // Validate required fields for each command from config
            if (!cmd.name || !cmd.url || !cmd.description || cmd.tags === undefined || cmd.llmHelpSource === undefined || cmd.dev === undefined || cmd.global === undefined) {
              console.error(`Error: Command from configuration is missing required fields: ${JSON.stringify(cmd)}`);
              process.exit(1);
            }

            // Check for duplicate names within the config file itself
            if (newCommandNames.has(cmd.name)) {
              console.error(`Error: Duplicate command name found in configuration: ${cmd.name}`);
              process.exit(1);
            }
            newCommandNames.add(cmd.name);

            // Check if command name already exists in the current index
            if (index.some(existingCmd => existingCmd.name === cmd.name)) {
              console.error(`Error: Command with name '${cmd.name}' already exists in the index.`);
              process.exit(1);
            }
          }

          // Add all commands from config to the index
          index.push(...commandsToAdd);
          writeIndex(indexPath, index);
          console.log(`Successfully added ${commandsToAdd.length} commands from '${options.config}'.`);

        } catch (error) {
          console.error(`Error processing configuration file: ${error.message}`);
          process.exit(1);
        }
      } else if (commandPath) {
        // Existing logic for adding a single command
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
      } else {
        console.error('Error: Missing command-path or --config option.');
        program.help();
      }
    });
};

// Export helper functions for testing if needed
export { getCommandDescription };