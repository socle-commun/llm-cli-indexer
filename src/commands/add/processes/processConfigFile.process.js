/**
 * @file processConfigFile.process.js
 * @description This process handles adding multiple commands from a configuration file.
 * @module processes/processConfigFile
 *
 * Intern note: this follows docs/features/add-from-config.feature where
 * a JSON file defines several commands at once.
*/

import fs from 'fs';
import { getCommandDescription } from './getCommandDescription.process.js';
import { inferTagsFromExtension } from './inferTagsFromExtension.process.js';

/**
 * Processes a configuration file to add multiple commands to the index.
 * @param {object} options - The command line options, including the config file path.
 * @param {Array<object>} index - The current command index.
 * @param {string} indexPath - The path to the index file.
 * @param {function} writeIndex - Function to write the updated index.
 */
export function processConfigFile(options, index, indexPath, writeIndex) {
  console.log(`DEBUG: options.config received: ${options.config}`);
  try {
    if (!fs.existsSync(options.config)) {
      console.error(`Error: Configuration file '${options.config}' not found.`);
      process.exit(1);
      return;
    }
    const configFileContent = fs.readFileSync(options.config, 'utf8');
    let commandsToAdd;
    try {
      commandsToAdd = JSON.parse(configFileContent);
    } catch (jsonError) {
      console.error(`Error: Invalid JSON format in configuration file '${options.config}'.`);
      process.exit(1);
      return;
    }

    if (!Array.isArray(commandsToAdd)) {
      console.error(`Error: Configuration file '${options.config}' must contain a JSON array of commands.`);
      process.exit(1);
      return;
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
        return;
      }

      // Check for duplicate names within the config file itself
      if (newCommandNames.has(cmd.name)) {
        console.error(`Error: Duplicate command name found in configuration: ${cmd.name}`);
        process.exit(1);
        return;
      }
      newCommandNames.add(cmd.name);

      // Check if command name already exists in the current index
      if (index.some(existingCmd => existingCmd.name === cmd.name)) {
        console.error(`Error: Command with name '${cmd.name}' already exists in the index.`);
        process.exit(1);
        return;
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
}
