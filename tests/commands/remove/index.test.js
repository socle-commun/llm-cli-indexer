import { describe, test, expect } from 'vitest';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { cleanup, writeIndex, localIndexPath } from '../../test-utils.js';

describe('llm-cli remove', () => {
  test('removes an existing local command', () => {
    cleanup();
    writeIndex(false, [{ name: 'my-script', url: 'file:///tmp/s' }]);
    execSync('node src/index.js remove my-script');
    const index = JSON.parse(fs.readFileSync(localIndexPath, 'utf8'));
    expect(index.length).toBe(0);
  });

  test('fails when command does not exist', () => {
    cleanup();
    writeIndex(false, []);
    try {
      execSync('node src/index.js remove missing', { stdio: 'pipe' });
    } catch (e) {
      expect(e.stderr.toString()).toContain("Error: Command 'missing' not found.");
    }
  });
});