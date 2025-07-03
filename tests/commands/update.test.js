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

describe('llm-cli update', () => {
  test('updates command name', () => {
    writeIndex([{ name: 'old-name', url: 'file:///a' }]);
    execSync('node src/index.js update old-name --new-name new-name');
    const idx = JSON.parse(fs.readFileSync(localIndex, 'utf8'));
    expect(idx[0].name).toBe('new-name');
  });

  test('updates tags', () => {
    writeIndex([{ name: 'my-script', tags: ['t1'], url: 'file:///b' }]);
    execSync('node src/index.js update my-script -t tagA -t tagB');
    const idx = JSON.parse(fs.readFileSync(localIndex, 'utf8'));
    expect(idx[0].tags).toEqual(['tagA', 'tagB']);
  });

  test('fails for non existent command', () => {
    writeIndex([]);
    try {
      execSync('node src/index.js update no-cmd --new-name x', { stdio: 'pipe' });
    } catch (e) {
      expect(e.stderr.toString()).toContain("Error: Command 'no-cmd' not found.");
    }
  });
});
