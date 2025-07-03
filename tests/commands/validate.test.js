import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

const localDir = path.join(process.cwd(), '.llm-cli');
const localIndex = path.join(localDir, 'index.json');
const tempFilesDir = path.join(process.cwd(), 'tests', 'temp_files');

const cleanup = () => {
  if (fs.existsSync(localDir)) fs.rmSync(localDir, { recursive: true, force: true });
  if (fs.existsSync(tempFilesDir)) fs.rmSync(tempFilesDir, { recursive: true, force: true });
};

const writeIndex = (data) => {
  fs.mkdirSync(localDir, { recursive: true });
  fs.writeFileSync(localIndex, JSON.stringify(data, null, 2));
};

const createDummyFile = (fileName) => {
  if (!fs.existsSync(tempFilesDir)) {
    fs.mkdirSync(tempFilesDir, { recursive: true });
  }
  const filePath = path.join(tempFilesDir, fileName);
  fs.writeFileSync(filePath, 'dummy content');
  return `file://${path.resolve(filePath).replace(/\\/g, '/')}`;
};

beforeEach(cleanup);
afterEach(cleanup);

describe('llm-cli validate', () => {
  test('reports success for valid index', () => {
    const dummyFilePath = createDummyFile('valid-cmd.js');
    writeIndex([{ name: 'cmd', url: dummyFilePath, description: 'A test command', tags: [], llmHelpSource: '--llm', dev: false, global: false }]);
    const out = execSync('node src/index.js validate', { encoding: 'utf8' });
    expect(out).toContain('Index is valid.');
  });

  test('fails for missing file', () => {
    const nonExistentPath = `file://${path.resolve(tempFilesDir, 'non-existent-file.js').replace(/\\/g, '/')}`;
    writeIndex([{ name: 'bad', url: nonExistentPath, description: 'Missing file', tags: [], llmHelpSource: '--llm', dev: false, global: false }]);
    try {
      execSync('node src/index.js validate', { stdio: 'pipe' });
    } catch (e) {
      expect(e.stderr.toString()).toContain(`Error: Binary not found for command 'bad' at ${nonExistentPath.replace(/^file:\/\//, '')}`);
    }
  });
});
