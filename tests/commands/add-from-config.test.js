import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

const localDir = path.join(process.cwd(), '.llm-cli');
const localIndex = path.join(localDir, 'index.json');
const tempFilesDir = path.join(process.cwd(), 'tests', 'temp_files');

const cleanup = () => {
  if (fs.existsSync(localDir)) fs.rmSync(localDir, { recursive: true, force: true });
  if (fs.existsSync(tempFilesDir)) fs.rmSync(tempFilesDir, { recursive: true, force: true });
};

const writeIndex = (data) => {
  fs.mkdirSync(localDir, { recursive: true });
  fs.writeFileSync(localIndex, JSON.stringify(data, null, 2));
};

const createDummyFile = (fileName, content = 'dummy content') => {
  if (!fs.existsSync(tempFilesDir)) {
    fs.mkdirSync(tempFilesDir, { recursive: true });
  }
  const filePath = path.join(tempFilesDir, fileName);
  fs.writeFileSync(filePath, content);
  return `file://${path.resolve(filePath).replace(/\\/g, '/')}`;
};

beforeEach(cleanup);
afterEach(cleanup);

describe('llm-cli add --config', () => {
  // Scenario: Add multiple local commands from a JSON file
  test('should add multiple local commands from a JSON file', () => {
    writeIndex([]); // Ensure empty index
    const scriptAContent = 'console.log("Script A description.");';
    const scriptBContent = 'echo "Script B description."';
    const scriptAPath = createDummyFile('script-a.js', scriptAContent);
    const scriptBPath = createDummyFile('script-b.sh', scriptBContent);

    const configContent = JSON.stringify([
      {
        name: 'script-a',
        url: scriptAPath,
        description: 'Description for script A',
        tags: ['utility', 'js'],
        llmHelpSource: '--llm',
        dev: false,
        global: false
      },
      {
        name: 'script-b',
        url: scriptBPath,
        description: 'Description for script B',
        tags: ['shell'],
        llmHelpSource: '--llm',
        dev: false,
        global: false
      }
    ], null, 2);

    const configFilePath = path.join(tempFilesDir, 'commands.json');
    fs.writeFileSync(configFilePath, configContent);

    execSync(`node src/index.js add --config ${configFilePath}`);

    const index = JSON.parse(fs.readFileSync(localIndex, 'utf8'));
    expect(index.length).toBe(2);
    expect(index).toContainEqual(expect.objectContaining({ name: 'script-a', url: scriptAPath }));
    expect(index).toContainEqual(expect.objectContaining({ name: 'script-b', url: scriptBPath }));
  });

  // Scenario: Attempt to add commands from a non-existent configuration file
  test('should display an error for a non-existent configuration file', () => {
    writeIndex([]);
    const nonExistentConfigPath = path.join(tempFilesDir, 'non-existent.json');
    try {
      execSync(`node src/index.js add --config ${nonExistentConfigPath}`, { stdio: 'pipe' });
      // If no error is thrown, fail the test
      expect.fail('Command did not throw an error for non-existent config file.');
    } catch (e) {
      expect(e.stderr.toString()).toContain(`Error: Configuration file '${nonExistentConfigPath}' not found.`);
      const index = JSON.parse(fs.readFileSync(localIndex, 'utf8'));
      expect(index.length).toBe(0); // Index should not be modified
    }
  });

  // Scenario: Attempt to add commands from a malformed configuration file
  test('should display an error for a malformed configuration file', () => {
    writeIndex([]);
    fs.mkdirSync(tempFilesDir, { recursive: true });
    const malformedConfigPath = path.join(tempFilesDir, 'malformed.json');
    fs.writeFileSync(malformedConfigPath, '{"name":"test', 'utf8'); // Malformed JSON

    try {
      execSync(`node src/index.js add --config ${malformedConfigPath}`, { stdio: 'pipe' });
      expect.fail('Command did not throw an error for malformed config file.');
    } catch (e) {
      expect(e.stderr.toString()).toContain(`Error: Invalid JSON format in configuration file '${malformedConfigPath}'.`);
      const index = JSON.parse(fs.readFileSync(localIndex, 'utf8'));
      expect(index.length).toBe(0); // Index should not be modified
    }
  });

  // Scenario: Attempt to add commands with missing required fields in config
  test('should display an error for commands with missing required fields in config', () => {
    writeIndex([]);
    fs.mkdirSync(tempFilesDir, { recursive: true });
    const invalidConfigContent = JSON.stringify([
      {
        name: 'script-c',
        url: 'file:///path/to/script-c.js',
        // description is missing
      }
    ], null, 2);
    const invalidConfigPath = path.join(tempFilesDir, 'invalid-commands.json');
    fs.writeFileSync(invalidConfigPath, invalidConfigContent);

    try {
      execSync(`node src/index.js add --config ${invalidConfigPath}`, { stdio: 'pipe' });
      expect.fail('Command did not throw an error for missing required fields.');
    } catch (e) {
      expect(e.stderr.toString()).toContain("Error: Command from configuration is missing required fields");
      const index = JSON.parse(fs.readFileSync(localIndex, 'utf8'));
      expect(index.length).toBe(0); // Index should not be modified
    }
  });

  // Scenario: Attempt to add commands with duplicate names in config
  test('should display an error for commands with duplicate names in config', () => {
    writeIndex([]);
    fs.mkdirSync(tempFilesDir, { recursive: true });
    const duplicateNamesConfigContent = JSON.stringify([
      {
        name: 'duplicate-cmd',
        url: 'file:///path/to/dup1.js',
        description: 'Desc 1',
        tags: [], llmHelpSource: '--llm', dev: false, global: false
      },
      {
        name: 'duplicate-cmd',
        url: 'file:///path/to/dup2.js',
        description: 'Desc 2',
        tags: [], llmHelpSource: '--llm', dev: false, global: false
      }
    ], null, 2);
    const duplicateNamesConfigPath = path.join(tempFilesDir, 'duplicate-names.json');
    fs.writeFileSync(duplicateNamesConfigPath, duplicateNamesConfigContent);

    try {
      execSync(`node src/index.js add --config ${duplicateNamesConfigPath}`, { stdio: 'pipe' });
      expect.fail('Command did not throw an error for duplicate names in config.');
    } catch (e) {
      expect(e.stderr.toString()).toContain("Error: Duplicate command name found in configuration");
      const index = JSON.parse(fs.readFileSync(localIndex, 'utf8'));
      expect(index.length).toBe(0); // Index should not be modified
    }
  });

  // Scenario: Attempt to add commands with existing names in index
  test('should display an error for commands with existing names in index', () => {
    writeIndex([
      { name: 'existing-command', url: 'file:///path/to/existing.js', description: 'Existing', tags: [], llmHelpSource: '--llm', dev: false, global: false }
    ]);
    fs.mkdirSync(tempFilesDir, { recursive: true });
    const newCommandsConfigContent = JSON.stringify([
      {
        name: 'existing-command',
        url: 'file:///path/to/new.js',
        description: 'New',
        tags: [], llmHelpSource: '--llm', dev: false, global: false
      }
    ], null, 2);
    const newCommandsConfigPath = path.join(tempFilesDir, 'new-commands.json');
    fs.writeFileSync(newCommandsConfigPath, newCommandsConfigContent);

    try {
      execSync(`node src/index.js add --config ${newCommandsConfigPath}`, { stdio: 'pipe' });
      expect.fail('Command did not throw an error for existing names in index.');
    } catch (e) {
      expect(e.stderr.toString()).toContain("Error: Command with name 'existing-command' already exists in the index.");
      const index = JSON.parse(fs.readFileSync(localIndex, 'utf8'));
      expect(index.length).toBe(1); // Index should not be modified
      expect(index[0].name).toBe('existing-command');
      expect(index[0].url).toContain('existing.js'); // Ensure original command is still there
    }
  });
});