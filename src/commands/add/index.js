import fs from 'fs';
import path from 'path';
import os from 'os';
import { execSync } from 'child_process';
import { getIndexPath, readIndex, writeIndex } from '../../utils/index.js';

function getCommandDescription(commandToDescribe, llmHelpSource) {
  let commandToExecute;
  // Always execute from the project root
  let cwd = process.cwd(); 

  // If commandToDescribe is a file path, ensure it's an absolute path for execution
  if (fs.existsSync(commandToDescribe) && fs.lstatSync(commandToDescribe).isFile()) {
    const absolutePath = path.resolve(commandToDescribe);
    console.log(`DEBUG: getCommandDescription - commandToDescribe: ${commandToDescribe}, absolutePath: ${absolutePath}, cwd: ${cwd}`);
    if (commandToDescribe.endsWith('.js')) {
      commandToExecute = `node "${absolutePath}" ${llmHelpSource}`;
    } else {
      // For other executable files (e.g., .py, .sh), try direct execution
      commandToExecute = `"${absolutePath}" ${llmHelpSource}`;
    }
  } else {
    // Assume it's a system command
    commandToExecute = `${commandToDescribe} ${llmHelpSource}`;
  }

  try {
    const output = execSync(commandToExecute, { encoding: 'utf8', stdio: 'pipe', shell: true, cwd: cwd });
    const lines = output.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);
    return lines.length > 0 ? lines[0] : '';
  } catch (error) {
    console.error(`Error executing '${commandToExecute}': ${error.message}`);
    // Ne doit pas jeter d'erreur ici, car llmHelpSource peut être inconnu
    // exemple: un fichier de script qui ne prend pas --llm en argument
    return ''; // Return empty string if description cannot be inferred
  }
}

function inferTagsFromExtension(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.js':
      return ['javascript'];
    case '.py':
      return ['python'];
    case '.sh':
      return ['shell', 'bash'];
    default:
      return [];
  }
}

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
      let fullCommandString;
      if (Array.isArray(commandNameOrPath)) {
        fullCommandString = commandNameOrPath.join(' ');
      } else {
        fullCommandString = commandNameOrPath;
      }

      const indexPath = getIndexPath(options.global);
      let index = readIndex(indexPath);

      if (options.config) {
        console.log(`DEBUG: options.config received: ${options.config}`);
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
            // Apply default values if not provided in config
            cmd.llmHelpSource = cmd.llmHelpSource || '--llm';
            cmd.dev = cmd.dev || false;
            cmd.global = cmd.global || false;
            cmd.tags = cmd.tags || [];

            // Infer description and tags if not provided in config
            if (!cmd.description && cmd.url.startsWith('file://')) {
              try {
                const resolvedPath = cmd.url.replace(/^file:\/\//, '');
                cmd.description = getCommandDescription(resolvedPath, cmd.llmHelpSource);
              } catch (error) {
                console.warn(`Warning: Could not infer description for command '${cmd.name}': ${error.message}`);
                cmd.description = ''; // Default to empty if inference fails
              }
            }
            if (cmd.tags.length === 0 && cmd.url.startsWith('file://')) {
              const resolvedPath = cmd.url.replace(/^file:\/\//, '');
              cmd.tags = inferTagsFromExtension(resolvedPath);
            }

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
      } else if (fullCommandString || options.name) {
        let newCommand = {
          name: options.name || fullCommandString,
          tags: options.tag || [],
          llmHelpSource: options.llmHelp || '--help',
          dev: options.dev || false,
          global: options.global || false,
          installCommand: options.install || undefined,
        };

        let description = '';
        let executablePath = '';

        // Determine if fullCommandString is a file path or a system command
        const isFilePath = fs.existsSync(fullCommandString) && fs.lstatSync(fullCommandString).isFile();

        if (isFilePath) {
          executablePath = path.resolve(fullCommandString).replace(/\\/g, '/');
          newCommand.url = `file://${executablePath}`;
          if (newCommand.tags.length === 0) {
            newCommand.tags = inferTagsFromExtension(executablePath);
          }
        } else {
          // Assume it's a system command
          newCommand.command = fullCommandString;
        }

        if (options.description) {
          description = options.description;
        } else {
          try {
            // For system commands, pass the command name directly
            // For file paths, pass the resolved path
            const commandToDescribe = isFilePath ? executablePath : fullCommandString;
            description = getCommandDescription(commandToDescribe, newCommand.llmHelpSource);
          } catch (error) {
            console.error(`Error: ${error.message}`);
            process.exit(1);
          }
        }
        newCommand.description = description;

        // Basic validation: check if command name already exists
        if (index.some(cmd => cmd.name === newCommand.name)) {
          console.error(`Error: Command with name '${newCommand.name}' already exists.`);
          process.exit(1);
        }

        index.push(newCommand);
        writeIndex(indexPath, index);
        console.log(`Command '${newCommand.name}' added successfully.`);
      } else {
        console.error('Error: Missing command or --config option.');
        program.help();
      }
    });
};

// Export helper functions for testing if needed
export { getCommandDescription, inferTagsFromExtension };