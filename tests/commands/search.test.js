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

describe('llm-cli search', () => {
  test('search by keyword', () => {
    writeIndex([
      { name: 'analyze-code', description: 'Analyzes source code', url: 'file:///a' },
      { name: 'build-project', url: 'file:///b' }
    ]);
    const out = execSync('node src/index.js search code', { encoding: 'utf8' });
    expect(out).toContain('analyze-code');
    expect(out).not.toContain('build-project');
  });

  test('search by tag', () => {
    writeIndex([
      { name: 'typescript-linter', tags: ['typescript', 'lint'], url: 'file:///t' },
      { name: 'python-formatter', tags: ['python', 'format'], url: 'file:///p' }
    ]);
    const out = execSync('node src/index.js search --tag lint lint', { encoding: 'utf8' });
    expect(out).toContain('typescript-linter');
    expect(out).not.toContain('python-formatter');
  });

  test('include dev commands', () => {
    writeIndex([
      { name: 'prod-tool', dev: false, url: 'file:///p' },
      { name: 'dev-tool', dev: true, url: 'file:///d' }
    ]);
    const out = execSync('node src/index.js search --include-dev tool', { encoding: 'utf8' });
    expect(out).toContain('prod-tool');
    expect(out).toContain('dev-tool');
  });
});
