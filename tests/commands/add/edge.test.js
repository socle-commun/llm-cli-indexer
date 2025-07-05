import { describe, test, beforeEach, afterEach } from 'vitest';
import { execSync } from 'child_process';
import { cleanup, initCliIndex, createDummyScript } from '../../test-utils.js';

describe('llm-cli add command edge cases', () => {
  beforeEach(() => {
    initCliIndex(false);
  });

  afterEach(() => {
    cleanup();
  });

  test('should add a command with an install command', () => {
    cleanup();
    initCliIndex(false);
    //TODO: Ne pas utiliser de script local ici
    // Utiliser `npm i -g vitepress` pour tester l\'installation
  });

  test('should NOT error if command does not respond to help', () => {
    cleanup();
    initCliIndex(false);
    const scriptPath = createDummyScript('non-responsive-script.js', 'process.exit(1);');
    // TODO: This should not throw an error, but we need to ensure it does not crash
  });
});
