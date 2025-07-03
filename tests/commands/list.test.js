import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

const localDir = path.join(process.cwd(), '.llm-cli');
const localIndex = path.join(localDir, 'index.json');
const globalDir = path.join(os.homedir(), '.llm-cli');
const globalIndex = path.join(globalDir, 'index.json');

const writeIndex = (isGlobal, data) => {
  const dir = isGlobal ? globalDir : localDir;
  const indexPath = isGlobal ? globalIndex : localIndex;
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(indexPath, JSON.stringify(data, null, 2));
};

const cleanup = () => {
  if (fs.existsSync(localDir)) fs.rmSync(localDir, { recursive: true, force: true });
  if (fs.existsSync(globalDir)) fs.rmSync(globalDir, { recursive: true, force: true });
};

beforeEach(cleanup);
afterEach(cleanup);

describe('llm-cli list', () => {
  test('lists local commands excluding dev', () => {
    writeIndex(false, [
      { name: 'command1', url: 'file:///tmp/c1', dev: false },
      { name: 'command2', url: 'file:///tmp/c2', dev: true }
    ]);
    const out = execSync('node src/index.js list', { encoding: 'utf8' });
    expect(out).toContain('command1');
    expect(out).not.toContain('command2');
  });

  test('lists global commands', () => {
    writeIndex(true, [{ name: 'global-command1', url: 'file:///tmp/g1', dev: false }]);
    const out = execSync('node src/index.js list --global', { encoding: 'utf8' });
    expect(out).toContain('global-command1');
  });

  test('lists dev commands when requested', () => {
    writeIndex(false, [{ name: 'devcmd', url: 'file:///tmp/d', dev: true }]);
    const out = execSync('node src/index.js list --include-dev', { encoding: 'utf8' });
    expect(out).toContain('devcmd');
  });
});
