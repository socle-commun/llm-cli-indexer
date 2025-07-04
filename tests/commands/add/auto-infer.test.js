
import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { cleanup, initCliIndex, createDummyScript } from '../../test-utils.js';

describe('llm-cli add command with auto-inference', () => {
  const localIndexPath = path.join(process.cwd(), '.llm-cli', 'index.json');

  beforeEach(() => {
    initCliIndex(false);
  });

  afterEach(() => {
    cleanup();
  });

  test('should auto-infer description from --llm output', () => {
    const scriptPath = createDummyScript('my-auto-script.js', 'This is an auto-inferred description.');
    execSync(`node src/index.js add ${scriptPath} --name auto-script`);
    const indexContent = JSON.parse(fs.readFileSync(localIndexPath, 'utf8'));
    expect(indexContent[0].description).toBe('This is an auto-inferred description.');
  });

  test('should auto-infer tags from file extension', () => {
    const scriptPath = createDummyScript('python-script.py', 'A Python script.');
    execSync(`node src/index.js add ${scriptPath} --name py-script`);
    const indexContent = JSON.parse(fs.readFileSync(localIndexPath, 'utf8'));
    expect(indexContent[0].tags).toContain('python');
  });

  test('should auto-infer tags from file extension (multiple)', () => {
    const scriptPath = createDummyScript('shell-script.sh', 'A shell script.');
    execSync(`node src/index.js add ${scriptPath} --name sh-script`);
    const indexContent = JSON.parse(fs.readFileSync(localIndexPath, 'utf8'));
    expect(indexContent[0].tags).toEqual(['shell', 'bash']);
  });

  test('explicit description should override auto-inference', () => {
    const scriptPath = createDummyScript('overridden-script.js', 'This description should be ignored.');
    execSync(`node src/index.js add ${scriptPath} --name override-desc -d "My custom description."`);
    const indexContent = JSON.parse(fs.readFileSync(localIndexPath, 'utf8'));
    expect(indexContent[0].description).toBe('My custom description.');
  });

  test('explicit tags should override auto-inference', () => {
    const scriptPath = createDummyScript('overridden-tags.py', 'A script with tags.');
    execSync(`node src/index.js add ${scriptPath} --name override-tags -t custom-tag`);
    const indexContent = JSON.parse(fs.readFileSync(localIndexPath, 'utf8'));
    expect(indexContent[0].tags).toContain('custom-tag');
    expect(indexContent[0].tags).not.toContain('python');
  });
});
