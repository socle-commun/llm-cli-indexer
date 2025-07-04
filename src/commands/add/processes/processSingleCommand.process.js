/**
 * @file processSingleCommand.process.js
 * @description This process handles adding a single command to the index.
 * @module processes/processSingleCommand
 */

import fs from 'fs';
import path from 'path';
import { getCommandDescription } from './getCommandDescription.process.js';
import { inferTagsFromExtension } from './inferTagsFromExtension.process.js';

/**
 * Processes a single command and adds it to the index.
 * @param {string|string[]} commandNameOrPath - The command name or path, potentially an array.
 * @param {object} options - The command line options.
 * @param {Array<object>} index - The current command index.
 * @param {string} indexPath - The path to the index file.
 * @param {function} writeIndex - Function to write the updated index.
 */
export function processSingleCommand(commandNameOrPath, options, index, indexPath, writeIndex) {
  let fullCommandString = Array.isArray(commandNameOrPath) ? commandNameOrPath.join(' ') : commandNameOrPath;

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
}
