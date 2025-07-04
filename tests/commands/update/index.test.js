import { describe, test, expect } from 'vitest';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { cleanup, writeIndex, localIndexPath } from '../../test-utils.js';

describe('llm-cli update', () => {
  test('updates command name', () => {
    cleanup();
    writeIndex(false, [{ name: 'old-name', url: 'file:///a' }]);
    execSync('node src/index.js update old-name --new-name new-name');
    const idx = JSON.parse(fs.readFileSync(localIndexPath, 'utf8'));
    expect(idx[0].name).toBe('new-name');
  });

  test('updates tags', () => {
    cleanup();
    writeIndex(false, [{ name: 'my-script', tags: ['t1'], url: 'file:///b' }]);
    execSync('node src/index.js update my-script -t tagA -t tagB');
    const idx = JSON.parse(fs.readFileSync(localIndexPath, 'utf8'));
    expect(idx[0].tags).toEqual(['tagA', 'tagB']);
  });

  test('fails for non existent command', () => {
    cleanup();
    writeIndex(false, []);
    try {
      execSync('node src/index.js update no-cmd --new-name x', { stdio: 'pipe' });
    } catch (e) {
      expect(e.stderr.toString()).toContain("Error: Command 'no-cmd' not found.");
    }
  });
});