import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { cleanup, initCliIndex, createDummyScript, escapeRegExp } from '../../test-utils.js';

describe('llm-cli add command', () => {
  const localLlmCliDir = path.join(process.cwd(), '.llm-cli');
  const localIndexPath = path.join(localLlmCliDir, 'index.json');
  const globalLlmCliDir = path.join(os.homedir(), '.llm-cli');
  const globalIndexPath = path.join(globalLlmCliDir, 'index.json');

  beforeEach(() => {
    initCliIndex(false);
  });

  afterEach(() => {
    cleanup();
  });

  test('should add a new command to local index.json with description', () => {
    const scriptPath = createDummyScript('my-script.js', 'My script description.');
    execSync(`node src/index.js add --name my-script ${scriptPath}`);

    const indexContent = JSON.parse(fs.readFileSync(localIndexPath, 'utf8'));
    expect(indexContent.length).toBe(1);
    expect(indexContent[0].name).toBe('my-script');
    const escapedBasename = escapeRegExp(path.basename(scriptPath));
    expect(indexContent[0].url).toMatch(new RegExp(`file:\/\/.+\/${escapedBasename}`));
    expect(indexContent[0].tags).toEqual(['javascript']);
    expect(indexContent[0].dev).toBe(false);
    expect(indexContent[0].global).toBe(false);
    expect(indexContent[0].description).toBe('My script description.');
  });

  // Scenario: Add a new global command with tags and dev flag
  test('should add a new command to global index.json with tags and dev flag', () => {
    cleanup();
    initCliIndex(true); // Initialize global index explicitly for this test
    const scriptPath = createDummyScript('another-script.js', 'Another script description.');
    execSync(`node src/index.js add ${scriptPath} --name global-script -t python -t utility --dev --global`, { stdio: 'pipe', cwd: process.cwd() });

    const indexContent = JSON.parse(fs.readFileSync(globalIndexPath, 'utf8'));
    expect(indexContent.length).toBe(1);
    expect(indexContent[0].name).toBe('global-script');
    const escapedBasename = escapeRegExp(path.basename(scriptPath));
    expect(indexContent[0].url).toMatch(new RegExp(`file:\/\/.+\/${escapedBasename}`));
    expect(indexContent[0].tags).toEqual(['python', 'utility']);
    expect(indexContent[0].dev).toBe(true);
    expect(indexContent[0].global).toBe(true);
    expect(indexContent[0].description).toBe('Another script description.');
  });

  // Scenario: Add a command with a custom llm-help source
  test('should add a command with a custom llm-help source', () => {
    cleanup();
    initCliIndex(false); // Initialize index explicitly for this test
    const scriptPath = createDummyScript('help-script.js', 'Help script AI documentation.');
    execSync(`node src/index.js add ${scriptPath} --name help-script --llm-help="--ai-doc"`, { stdio: 'pipe', cwd: process.cwd() });

    const indexContent = JSON.parse(fs.readFileSync(localIndexPath, 'utf8'));
    expect(indexContent[0].llmHelpSource).toBe('--ai-doc');
    expect(indexContent[0].description).toBe('Help script AI documentation.');
  });

  // Scenario: Add a command with a custom description
  test('should add a command with a custom description', () => {
    const scriptPath = createDummyScript('custom-desc-script.js', 'This is the help description.');
    execSync(`node src/index.js add ${scriptPath} --name custom-desc --description "My custom description."`, { stdio: 'pipe', cwd: process.cwd() });

    const indexContent = JSON.parse(fs.readFileSync(localIndexPath, 'utf8'));
    expect(indexContent[0].name).toBe('custom-desc');
    expect(indexContent[0].description).toBe('My custom description.');
  });

  // Scenario: Add a command with an install command
  test('should add a command with an install command', () => {
    cleanup();
    initCliIndex(false);
    //TODO: Ne pas utiliser de script local ici
    // Utiliser `npm i -g vitepress` pour tester l'installation
  });

  // Scenario: Attempt to add a command that does not respond to --help
  test('should NOT error if command does not respond to help', () => {
    cleanup();
    initCliIndex(false); // Initialize index explicitly for this test
    const scriptPath = createDummyScript('non-responsive-script.js', 'process.exit(1);');
    // TODO: This should not throw an error, but we need to ensure it does not crash
  });

  // Scenario: Attempt to add a command with a duplicate name
  test('should prevent adding command with duplicate name', () => {
    cleanup();
    initCliIndex(false); // Initialize index explicitly for this test
    const script1Path = createDummyScript('script1.js', 'Script 1 description.');
    // Add the first command successfully.
    execSync(`node src/index.js add ${script1Path} --name duplicate-name`, { stdio: 'pipe', cwd: process.cwd() });

    const script2Path = createDummyScript('script2.js', 'Script 2 description.');
    try {
      execSync(`node src/index.js add ${script2Path} --name duplicate-name`, { stdio: 'pipe', cwd: process.cwd() });
      expect.fail('Command did not throw an error for duplicate name.');
    } catch (error) {
      expect(error.stderr.toString()).toContain("Error: Command with name 'duplicate-name' already exists.");
      const indexContent = JSON.parse(fs.readFileSync(localIndexPath, 'utf8'));
      expect(indexContent.length).toBe(1); // Should still only have one command
    }
  });
});