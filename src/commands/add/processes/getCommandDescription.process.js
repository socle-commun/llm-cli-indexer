/**
 * @file getCommandDescription.process.js
 * @description This process infers the description of a command by executing it with a specified help source.
 * It handles both file-based scripts and system commands.
 * @module processes/getCommandDescription
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

/**
 * Infers the description of a command by executing it with a specified help source.
 * @param {string} commandToDescribe - The command or file path to describe.
 * @param {string} llmHelpSource - The argument to pass to the command to get its description (e.g., '--help', '--ai-doc').
 * @returns {string} The inferred description, or an empty string if inference fails.
 */
export function getCommandDescription(commandToDescribe, llmHelpSource) {
  let commandToExecute;
  let executionCwd = process.cwd(); // Default to project root

  // If commandToDescribe is a file path, ensure it's an absolute path for execution
  if (fs.existsSync(commandToDescribe) && fs.lstatSync(commandToDescribe).isFile()) {
    const absolutePath = path.resolve(commandToDescribe);
    if (commandToDescribe.endsWith('.js')) {
      commandToExecute = `node "${absolutePath}" ${llmHelpSource}`;
      executionCwd = path.dirname(absolutePath); // Set cwd to script's directory for Node.js scripts
    } else {
      // For other executable files (e.g., .py, .sh), try direct execution
      commandToExecute = `"${absolutePath}" ${llmHelpSource}`;
      executionCwd = path.dirname(absolutePath); // Set cwd to script's directory for other executables
    }
  } else {
    // Assume it's a system command
    commandToExecute = `${commandToDescribe} ${llmHelpSource}`;
  }

  try {
    const output = execSync(commandToExecute, { encoding: 'utf8', stdio: 'pipe', shell: true, cwd: executionCwd });
    const lines = output.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);
    return lines.length > 0 ? lines[0] : '';
  } catch (error) {
    console.error(`Error executing '${commandToExecute}': ${error.message}`);
    // Ne doit pas jeter d'erreur ici, car llmHelpSource peut être inconnu
    // exemple: un fichier de script qui ne prend pas --llm en argument
    return ''; // Return empty string if description cannot be inferred
  }
}