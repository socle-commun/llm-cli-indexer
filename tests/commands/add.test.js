import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

// Import the initAction function directly
const { initAction } = require('../../../src/commands/init/index.js');

describe('llm-cli add command', () => {
  const localLlmCliDir = path.join(process.cwd(), '.llm-cli');
  const localIndexPath = path.join(localLlmCliDir, 'index.json');
  const globalLlmCliDir = path.join(os.homedir(), '.llm-cli');
  const globalIndexPath = path.join(globalLlmCliDir, 'index.json');
  const tempScriptsDir = path.join(process.cwd(), 'tests', 'temp_scripts');

  // Helper to clean up directories and files
  const cleanup = () => {
    console.log('--- Cleaning up ---');
    if (fs.existsSync(localLlmCliDir)) {
      console.log(`Removing local .llm-cli directory: ${localLlmCliDir}`);
      fs.rmSync(localLlmCliDir, { recursive: true, force: true });
    }
    if (fs.existsSync(globalLlmCliDir)) {
      console.log(`Removing global .llm-cli directory: ${globalLlmCliDir}`);
      fs.rmSync(globalLlmCliDir, { recursive: true, force: true });
    }
    // Clean up temp scripts directory
    if (fs.existsSync(tempScriptsDir)) {
      console.log(`Removing temporary scripts directory: ${tempScriptsDir}`);
      fs.rmSync(tempScriptsDir, { recursive: true, force: true });
    }
    console.log('--- Cleanup complete ---');
  };

  // Helper to initialize index using the imported initAction
  const initIndex = (isGlobal = false) => {
    const targetDir = isGlobal ? globalLlmCliDir : localLlmCliDir;
    const targetPath = isGlobal ? globalIndexPath : localIndexPath;
    console.log(`Initializing index: isGlobal=${isGlobal}, targetDir=${targetDir}, targetPath=${targetPath}`);
    // Call the initAction directly
    initAction({ global: isGlobal });
    console.log(`Index initialized. Exists: ${fs.existsSync(targetPath)}`);
  };

  // Helper to create a dummy script
  const createDummyScript = (scriptName, content, executable = true) => {
    if (!fs.existsSync(tempScriptsDir)) {
      fs.mkdirSync(tempScriptsDir, { recursive: true });
    }
    const scriptPath = path.join(tempScriptsDir, scriptName);
    fs.writeFileSync(scriptPath, content);
    if (executable) {
      fs.chmodSync(scriptPath, '755'); // Make executable
    }
    console.log(`Created dummy script: ${scriptPath}`);
    return scriptPath;
  };

  beforeEach(() => {
    cleanup();
  });

  afterEach(() => {
    cleanup();
  });

  // Scenario: Add a new local command with minimal information
  test('should add a new command to local index.json with description', () => {
    initIndex(); // Initialize index explicitly for this test
    const scriptPath = createDummyScript('my-script.js', 'console.log("My script description.");');
    console.log(`Executing: node src/index.js add ${scriptPath} --name my-script`);
    execSync(`node src/index.js add ${scriptPath} --name my-script`);

    const indexContent = JSON.parse(fs.readFileSync(localIndexPath, 'utf8'));
    expect(indexContent.length).toBe(1);
    expect(indexContent[0].name).toBe('my-script');
    expect(indexContent[0].url).toMatch(new RegExp(`file:\/\/.+\/${path.basename(scriptPath).replace(/\./g, '\\.')}$`));
    expect(indexContent[0].tags).toEqual([]);
    expect(indexContent[0].dev).toBe(false);
    expect(indexContent[0].global).toBe(false);
    expect(indexContent[0].description).toBe('My script description.');
  });

  // Scenario: Add a new global command with tags and dev flag
  test('should add a new command to global index.json with tags and dev flag', () => {
    initIndex(true); // Initialize global index explicitly for this test
    const scriptPath = createDummyScript('another-script.js', 'console.log("Another script description.");');
    console.log(`Executing: node src/index.js add ${scriptPath} --name global-script -t python -t utility --dev --global`);
    execSync(`node src/index.js add ${scriptPath} --name global-script -t python -t utility --dev --global`);

    const indexContent = JSON.parse(fs.readFileSync(globalIndexPath, 'utf8'));
    expect(indexContent.length).toBe(1);
    expect(indexContent[0].name).toBe('global-script');
    expect(indexContent[0].url).toMatch(new RegExp(`file:\/\/.+\/${path.basename(scriptPath).replace(/\./g, '\\.')}$`));
    expect(indexContent[0].tags).toEqual(['python', 'utility']);
    expect(indexContent[0].dev).toBe(true);
    expect(indexContent[0].global).toBe(true);
    expect(indexContent[0].description).toBe('Another script description.');
  });

  // Scenario: Add a command with a custom llm-help source
  test('should add a command with a custom llm-help source', () => {
    initIndex(); // Initialize index explicitly for this test
    const scriptPath = createDummyScript('help-script.js', 'console.log("Help script AI documentation.");');
    console.log(`Executing: node src/index.js add ${scriptPath} --name help-script --llm-help="--ai-doc"`);
    execSync(`node src/index.js add ${scriptPath} --name help-script --llm-help="--ai-doc"`);

    const indexContent = JSON.parse(fs.readFileSync(localIndexPath, 'utf8'));
    expect(indexContent[0].llmHelpSource).toBe('--ai-doc');
    expect(indexContent[0].description).toBe('Help script AI documentation.');
  });

  // Scenario: Add a command with a custom description
  test('should add a command with a custom description', () => {
    initIndex(); // Initialize index explicitly for this test
    const scriptPath = createDummyScript('custom-desc-script.js', 'console.log("This is the help description.");');
    console.log(`Executing: node src/index.js add ${scriptPath} --name custom-desc --description "My custom description."`);
    execSync(`node src/index.js add ${scriptPath} --name custom-desc --description "My custom description."`);

    const indexContent = JSON.parse(fs.readFileSync(localIndexPath, 'utf8'));
    expect(indexContent[0].name).toBe('custom-desc');
    expect(indexContent[0].description).toBe('My custom description.');
  });

  // Scenario: Add a command with an install command
  test('should add a command with an install command', () => {
    initIndex();
    const scriptPath = createDummyScript('installable-script.js', 'console.log("This script can be installed.");');
    const installCmd = 'npm install -g installable-script-cli';
    console.log(`Executing: node src/index.js add ${scriptPath} --name installable-script --install "${installCmd}"`);
    execSync(`node src/index.js add ${scriptPath} --name installable-script --install "${installCmd}"`);

    const indexContent = JSON.parse(fs.readFileSync(localIndexPath, 'utf8'));
    expect(indexContent.length).toBe(1);
    expect(indexContent[0].name).toBe('installable-script');
    expect(indexContent[0].installCommand).toBe(installCmd);
  });

  // Scenario: Attempt to add a command that does not respond to --help
  test('should error if command does not respond to help', () => {
    initIndex(); // Initialize index explicitly for this test
    const scriptPath = createDummyScript('non-responsive-script.js', 'process.exit(1);');
    console.log(`Executing: node src/index.js add ${scriptPath} --name non-responsive`);
    try {
      execSync(`node src/index.js add ${scriptPath} --name non-responsive`, { stdio: 'pipe' });
    } catch (error) {
      expect(error.stderr.toString()).toContain("Error: Command 'non-responsive-script.js' did not respond to --llm or returned an error.");
      const indexContent = JSON.parse(fs.readFileSync(localIndexPath, 'utf8'));
      expect(indexContent.length).toBe(0); // Index should not be modified
    }
  });

  // Scenario: Attempt to add a command with a duplicate name
  test('should prevent adding command with duplicate name', () => {
    initIndex(); // Initialize index explicitly for this test
    const script1Path = createDummyScript('script1.js', 'console.log("Script 1 description.");');
    console.log(`Executing: node src/index.js add ${script1Path} --name duplicate-name`);
    execSync(`node src/index.js add ${script1Path} --name duplicate-name`);

    const script2Path = createDummyScript('script2.js', 'console.log("Script 2 description.");');
    console.log(`Executing: node src/index.js add ${script2Path} --name duplicate-name`);
    try {
      execSync(`node src/index.js add ${script2Path} --name duplicate-name`, { stdio: 'pipe' });
    } catch (error) {
      expect(error.stderr.toString()).toContain("Error: Command with name 'duplicate-name' already exists.");
      const indexContent = JSON.parse(fs.readFileSync(localIndexPath, 'utf8'));
      expect(indexContent.length).toBe(1); // Should still only have one command
    }
  });
});