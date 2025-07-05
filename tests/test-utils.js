import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
// Intern note: helpers here support command tests defined by the feature files

const LLM_CLI_DIR = '.llm-cli';
const INDEX_FILE = 'index.json';
const TEMP_SCRIPTS_DIR = path.join(process.cwd(), 'tests', 'temp_scripts');
export const TEMP_FILES_DIR = path.join(process.cwd(), 'tests', 'temp_files');

export const localLlmCliDir = path.join(process.cwd(), LLM_CLI_DIR);
export const localIndexPath = path.join(localLlmCliDir, INDEX_FILE);
export const globalLlmCliDir = path.join(os.homedir(), LLM_CLI_DIR);
export const globalIndexPath = path.join(globalLlmCliDir, INDEX_FILE);

export const cleanup = () => {
  
  const dirsToClean = [localLlmCliDir, globalLlmCliDir, TEMP_SCRIPTS_DIR, TEMP_FILES_DIR];
  dirsToClean.forEach(dir => {
    if (fs.existsSync(dir)) {
      
      let retries = 5;
      while (retries > 0) {
        try {
          fs.rmSync(dir, { recursive: true, force: true });
          
          break; // Success, exit loop
        } catch (e) {
          console.warn(`DEBUG: Failed to remove directory ${dir}. Retrying... (${retries} left). Error: ${e.message}`);
          retries--;
          // Simple synchronous delay
          const start = Date.now();
          while (Date.now() - start < 200); // Wait for 200ms
          
        }
      }
      if (fs.existsSync(dir)) {
        console.error(`DEBUG: Failed to clean up directory after multiple retries: ${dir}`);
        // Optionally, throw an error to fail the test if cleanup is critical
        // throw new Error(`Failed to clean up directory: ${dir}`);
      }
    }
  });
  // Add a small delay after all directories are processed
  const start = Date.now();
  while (Date.now() - start < 1000); // Wait for 1000ms to ensure file system is ready
  
};

export const writeIndex = (isGlobal, data) => {
  const dir = isGlobal ? globalLlmCliDir : localLlmCliDir;
  const indexPath = isGlobal ? globalIndexPath : localIndexPath;
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(indexPath, JSON.stringify(data, null, 2));
};

export const createDummyScript = (scriptName, descriptionContent, executable = true) => {
  if (!fs.existsSync(TEMP_SCRIPTS_DIR)) {
    fs.mkdirSync(TEMP_SCRIPTS_DIR, { recursive: true });
  }
  // Use the full scriptName to preserve its original extension (e.g., .py, .sh)
  const scriptPath = path.join(TEMP_SCRIPTS_DIR, scriptName);
  console.log(`DEBUG: createDummyScript - scriptName: ${scriptName}, scriptPath: ${scriptPath}`);

  const scriptContent = `#!/usr/bin/env node
console.log("${descriptionContent}");
`;

  fs.writeFileSync(scriptPath, scriptContent);
  if (executable) {
    fs.chmodSync(scriptPath, '755'); // Make executable
  }
  return path.relative(process.cwd(), scriptPath).replace(/\\/g, '/'); // Normalize to forward slashes and relative
};

export const createDummyFile = (fileName, content = 'dummy content') => {
  if (!fs.existsSync(TEMP_FILES_DIR)) {
    
    fs.mkdirSync(TEMP_FILES_DIR, { recursive: true });
  }
  const filePath = path.join(TEMP_FILES_DIR, fileName);
  
  fs.writeFileSync(filePath, content);
  return `file://${path.resolve(filePath).replace(/\\/g, '/')}`;
};

export const createCommand = (name, url, description = '', tags = [], llmHelpSource = '--llm', dev = false, global = false) => ({
  name,
  url,
  description,
  tags,
  llmHelpSource,
  dev,
  global,
});

export const initCliIndex = (isGlobal = false) => {
  
  // First, ensure a clean slate for the specific environment
  cleanup(); // Call cleanup before setting up

  const llmCliDir = isGlobal ? globalLlmCliDir : localLlmCliDir;
  const indexPath = isGlobal ? globalIndexPath : localIndexPath;

  // Ensure the directory exists
  if (!fs.existsSync(llmCliDir)) {
    fs.mkdirSync(llmCliDir, { recursive: true });
  }

  // Always ensure a clean index.json file
  fs.writeFileSync(indexPath, '[]');
  // Add a small delay after writing the index file
  const start = Date.now();
  while (Date.now() - start < 100); // Wait for 100ms
};

export const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the matched substring
};