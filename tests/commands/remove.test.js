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

describe('llm-cli remove', () => {
  test('removes an existing local command', () => {
    writeIndex(false, [{ name: 'my-script', url: 'file:///tmp/s' }]);
    execSync('node src/index.js remove my-script');
    const index = JSON.parse(fs.readFileSync(localIndex, 'utf8'));
    expect(index.length).toBe(0);
  });

  test('fails when command does not exist', () => {
    writeIndex(false, []);
    try {
      execSync('node src/index.js remove missing', { stdio: 'pipe' });
    } catch (e) {
      expect(e.stderr.toString()).toContain("Error: Command 'missing' not found.");
    }
  });
});
