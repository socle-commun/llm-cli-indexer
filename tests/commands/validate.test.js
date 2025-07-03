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

describe('llm-cli validate', () => {
  test('reports success for valid index', () => {
    writeIndex([{ name: 'cmd', url: 'file:///tmp/cmd' }]);
    const out = execSync('node src/index.js validate', { encoding: 'utf8' });
    expect(out).toContain('Index is valid.');
  });

  test('fails for missing file', () => {
    writeIndex([{ name: 'bad', url: 'file:///no/file' }]);
    try {
      execSync('node src/index.js validate', { stdio: 'pipe' });
    } catch (e) {
      expect(e.stderr.toString()).toContain('Missing file bad');
    }
  });
});
