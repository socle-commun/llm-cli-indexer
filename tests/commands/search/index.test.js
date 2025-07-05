import { describe, test, expect } from 'vitest';
import { execSync } from 'child_process';
import { cleanup, writeIndex } from '../../test-utils.js';
// Intern note: these tests exercise docs/features/search.feature
import path from 'path';

const localDir = path.join(process.cwd(), '.llm-cli');
const localIndex = path.join(localDir, 'index.json');

describe('llm-cli search', () => {
  test('search by keyword', () => {
    cleanup();
    writeIndex(false, [
      { name: 'analyze-code', description: 'Analyzes source code', url: 'file:///a' },
      { name: 'build-project', url: 'file:///b' }
    ]);
    const out = execSync('node src/index.js search code', { encoding: 'utf8' });
    expect(out).toContain('analyze-code');
    expect(out).not.toContain('build-project');
  });

  test('search by tag', () => {
    cleanup();
    writeIndex(false, [
      { name: 'typescript-linter', tags: ['typescript', 'lint'], url: 'file:///t' },
      { name: 'python-formatter', tags: ['python', 'format'], url: 'file:///p' }
    ]);
    const out = execSync('node src/index.js search --tag lint lint', { encoding: 'utf8' });
    expect(out).toContain('typescript-linter');
    expect(out).not.toContain('python-formatter');
  });

  test('include dev commands', () => {
    cleanup();
    writeIndex(false, [
      { name: 'prod-tool', dev: false, url: 'file:///p' },
      { name: 'dev-tool', dev: true, url: 'file:///d' }
    ]);
    const out = execSync('node src/index.js search --include-dev tool', { encoding: 'utf8' });
    expect(out).toContain('prod-tool');
    expect(out).toContain('dev-tool');
  });
});