import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

const localDir = path.join(process.cwd(), '.llm-cli');
const localIndex = path.join(localDir, 'index.json');

const cleanup = () => {
  if (fs.existsSync(localDir)) fs.rmSync(localDir, { recursive: true, force: true });
};

const writeIndex = (data) => {
  fs.mkdirSync(localDir, { recursive: true });
  fs.writeFileSync(localIndex, JSON.stringify(data, null, 2));
};

beforeEach(cleanup);
afterEach(cleanup);

describe('llm-cli list filtering', () => {
  // Helper to create a dummy command object with default values
  const createCommand = (name, url, description = '', tags = [], llmHelpSource = '--llm', dev = false, global = false) => ({
    name,
    url,
    description,
    tags,
    llmHelpSource,
    dev,
    global,
  });

  // Scenario: List commands filtered by type/extension
  test('should list commands filtered by type/extension', () => {
    writeIndex([
      createCommand('my-script.js', 'file:///path/to/my-script.js'),
      createCommand('another-script.sh', 'file:///path/to/another-script.sh'),
    ]);
    const out = execSync('node src/index.js list --type js', { encoding: 'utf8' });
    expect(out).toContain('my-script.js');
    expect(out).not.toContain('another-script.sh');
  });

  // Scenario: List commands filtered by tag
  test('should list commands filtered by tag', () => {
    writeIndex([
      createCommand('build-tool', 'file:///path/to/build', '', ['build', 'ci']),
      createCommand('test-tool', 'file:///path/to/test', '', ['test']),
    ]);
    const out = execSync('node src/index.js list --tag build', { encoding: 'utf8' });
    expect(out).toContain('build-tool');
    expect(out).not.toContain('test-tool');
  });

  // Scenario: List commands filtered by multiple tags
  test('should list commands filtered by multiple tags', () => {
    writeIndex([
      createCommand('deploy-script', 'file:///path/to/deploy', '', ['deploy', 'ci']),
      createCommand('lint-tool', 'file:///path/to/lint', '', ['lint']),
    ]);
    const out = execSync('node src/index.js list --tag deploy --tag ci', { encoding: 'utf8' });
    expect(out).toContain('deploy-script');
    expect(out).not.toContain('lint-tool');
  });

  // Scenario: List commands with no matching filters
  test('should list no commands when no filters match', () => {
    writeIndex([
      createCommand('my-script.js', 'file:///path/to/my-script.js'),
    ]);
    const out = execSync('node src/index.js list --type py', { encoding: 'utf8' });
    expect(out.trim()).toBe(''); // Output should be empty
  });

  // Scenario: List commands with --include-dev and filters
  test('should list dev commands with filters when --include-dev is used', () => {
    writeIndex([
      createCommand('prod-js', 'file:///path/to/prod.js'),
      createCommand('dev-js', 'file:///path/to/dev.js', '', [], '--llm', true),
    ]);
    const out = execSync('node src/index.js list --type js --include-dev', { encoding: 'utf8' });
    expect(out).toContain('prod-js');
    expect(out).toContain('dev-js');
  });
});