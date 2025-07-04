
import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { cleanup, initCliIndex, createDummyScript } from '../../test-utils.js';

describe('llm-cli add command from configuration file', () => {
  const localIndexPath = path.join(process.cwd(), '.llm-cli', 'index.json');
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

  test('should add multiple local commands from a JSON file', () => {
    const scriptAPath = createDummyScript('script-a.js', 'console.log("Description for script A")');
    const scriptBPath = createDummyScript('script-b.sh', 'echo "Description for script B"');
    const config = [
      {
        "name": "script-a",
        "url": `file://${scriptAPath}`,
        "description": "Description for script A",
        "tags": ["utility", "js"]
      },
      {
        "name": "script-b",
        "url": `file://${scriptBPath}`,
        "description": "Description for script B",
        "tags": ["shell"]
      }
    ];
    fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2));
    execSync(`node src/index.js add --config ${configFilePath}`);
    const indexContent = JSON.parse(fs.readFileSync(localIndexPath, 'utf8'));
    expect(indexContent.length).toBe(2);
    expect(indexContent[0].name).toBe('script-a');
    expect(indexContent[1].name).toBe('script-b');
  });

  test('should display an error for non-existent configuration file', () => {
    try {
      execSync(`node src/index.js add --config non-existent.json`);
      expect.fail('Command did not throw an error.');
    } catch (error) {
      expect(error.stderr.toString()).toContain("Error: Configuration file 'non-existent.json' not found.");
    }
  });

  test('should display an error for malformed configuration file', () => {
    fs.writeFileSync(configFilePath, 'malformed json');
    try {
      execSync(`node src/index.js add --config ${configFilePath}`);
      expect.fail('Command did not throw an error.');
    } catch (error) {
      expect(error.stderr.toString()).toContain("Error: Invalid JSON format in configuration file");
    }
  });

  test('should display an error for missing required fields in config', () => {
    const config = [{ "url": "file:///path/to/script.js" }]; // Missing name and description
    fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2));
    try {
      execSync(`node src/index.js add --config ${configFilePath}`);
      expect.fail('Command did not throw an error.');
    } catch (error) {
      expect(error.stderr.toString()).toContain("Error: Command from configuration is missing required fields");
    }
  });

  test('should display an error for duplicate names in config', () => {
    const scriptPath = createDummyScript('script.js', 'console.log("description")');
    const config = [
      { "name": "duplicate", "url": `file://${scriptPath}`, "description": "desc1" },
      { "name": "duplicate", "url": `file://${scriptPath}`, "description": "desc2" }
    ];
    fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2));
    try {
      execSync(`node src/index.js add --config ${configFilePath}`);
      expect.fail('Command did not throw an error.');
    } catch (error) {
      expect(error.stderr.toString()).toContain("Error: Duplicate command name found in configuration: duplicate");
    }
  });

  test('should display an error for existing names in index', () => {
    const script1Path = createDummyScript('script1.js', 'console.log("desc1")');
    execSync(`node src/index.js add ${script1Path} --name existing-command`);
    const script2Path = createDummyScript('script2.js', 'console.log("desc2")');
    const config = [{ "name": "existing-command", "url": `file://${script2Path}`, "description": "desc2" }];
    fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2));
    try {
      execSync(`node src/index.js add --config ${configFilePath}`);
      expect.fail('Command did not throw an error.');
    } catch (error) {
      expect(error.stderr.toString()).toContain("Error: Command with name 'existing-command' already exists in the index.");
    }
  });
});
