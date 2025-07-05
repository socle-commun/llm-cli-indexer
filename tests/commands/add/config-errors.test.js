import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { cleanup, initCliIndex, createDummyScript } from '../../test-utils.js';

describe('llm-cli add command from configuration file errors', () => {
  const configFilePath = path.join(process.cwd(), 'commands.json');

  beforeEach(() => {
    initCliIndex(false);
  });

  afterEach(() => {
    cleanup();
    if (fs.existsSync(configFilePath)) {
      fs.unlinkSync(configFilePath);
    }
  });

  test('should display an error for missing required fields in config', () => {
    const config = [{ "url": "file:///path/to/script.js" }];
    fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2));
    try {
      execSync(`node src/index.js add --config ${configFilePath}`);
      expect.fail('Command did not throw an error.');
    } catch (error) {
      expect(error.stderr.toString()).toContain('Error: Command from configuration is missing required fields');
    }
  });

  test('should display an error for duplicate names in config', () => {
    const scriptPath = createDummyScript('script.js', 'console.log("description")');
    const config = [
      { name: 'duplicate', url: `file://${scriptPath}`, description: 'desc1' },
      { name: 'duplicate', url: `file://${scriptPath}`, description: 'desc2' }
    ];
    fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2));
    try {
      execSync(`node src/index.js add --config ${configFilePath}`);
      expect.fail('Command did not throw an error.');
    } catch (error) {
      expect(error.stderr.toString()).toContain('Error: Duplicate command name found in configuration: duplicate');
    }
  });

  test('should display an error for existing names in index', () => {
    const script1Path = createDummyScript('script1.js', 'console.log("desc1")');
    execSync(`node src/index.js add ${script1Path} --name existing-command`);
    const script2Path = createDummyScript('script2.js', 'console.log("desc2")');
    const config = [{ name: 'existing-command', url: `file://${script2Path}`, description: 'desc2' }];
    fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2));
    try {
      execSync(`node src/index.js add --config ${configFilePath}`);
      expect.fail('Command did not throw an error.');
    } catch (error) {
      expect(error.stderr.toString()).toContain("Error: Command with name 'existing-command' already exists in the index.");
    }
  });
});
