import { describe, test, expect } from 'vitest';
import { execSync } from 'child_process';
import { cleanup, writeIndex } from '../../test-utils.js';
// Intern note: tests mirror docs/features/list.feature
import path from 'path';
import os from 'os';

const localDir = path.join(process.cwd(), '.llm-cli');
const localIndex = path.join(localDir, 'index.json');
const globalDir = path.join(os.homedir(), '.llm-cli');
const globalIndex = path.join(globalDir, 'index.json');

describe('llm-cli list', () => {
  test('lists local commands excluding dev', () => {
    cleanup();
    writeIndex(false, [
      { name: 'command1', url: 'file:///tmp/c1', dev: false },
      { name: 'command2', url: 'file:///tmp/c2', dev: true }
    ]);
    const out = execSync('node src/index.js list', { encoding: 'utf8' });
    expect(out).toContain('command1');
    expect(out).not.toContain('command2');
  });

  test('lists global commands', () => {
    cleanup();
    writeIndex(true, [{ name: 'global-command1', url: 'file:///tmp/g1', dev: false }]);
    const out = execSync('node src/index.js list --global', { encoding: 'utf8' });
    expect(out).toContain('global-command1');
  });

  test('lists dev commands when requested', () => {
    cleanup();
    writeIndex(false, [{ name: 'devcmd', url: 'file:///tmp/d', dev: true }]);
    const out = execSync('node src/index.js list --include-dev', { encoding: 'utf8' });
    expect(out).toContain('devcmd');
  });
});