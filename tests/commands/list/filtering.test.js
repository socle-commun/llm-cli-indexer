import { describe, test, expect } from 'vitest';
import { execSync } from 'child_process';
import { cleanup, writeIndex, createCommand } from '../../test-utils.js';

describe('llm-cli list filtering', () => {
  // Scenario: List commands filtered by type/extension
  test('should list commands filtered by type/extension', () => {
    cleanup();
    writeIndex(false, [
      createCommand('my-script.js', 'file:///path/to/my-script.js'),
      createCommand('another-script.sh', 'file:///path/to/another-script.sh'),
    ]);
    const out = execSync('node src/index.js list --type js', { encoding: 'utf8' });
    expect(out).toContain('my-script.js');
    expect(out).not.toContain('another-script.sh');
  });

  // Scenario: List commands filtered by tag
  test('should list commands filtered by tag', () => {
    cleanup();
    writeIndex(false, [
      createCommand('build-tool', 'file:///path/to/build', '', ['build', 'ci']),
      createCommand('test-tool', 'file:///path/to/test', '', ['test']),
    ]);
    const out = execSync('node src/index.js list --tag build', { encoding: 'utf8' });
    expect(out).toContain('build-tool');
    expect(out).not.toContain('test-tool');
  });

  // Scenario: List commands filtered by multiple tags
  test('should list commands filtered by multiple tags', () => {
    cleanup();
    writeIndex(false, [
      createCommand('deploy-script', 'file:///path/to/deploy', '', ['deploy', 'ci']),
      createCommand('lint-tool', 'file:///path/to/lint', '', ['lint']),
    ]);
    const out = execSync('node src/index.js list --tag deploy --tag ci', { encoding: 'utf8' });
    expect(out).toContain('deploy-script');
    expect(out).not.toContain('lint-tool');
  });

  // Scenario: List commands with no matching filters
  test('should list no commands when no filters match', () => {
    cleanup();
    writeIndex(false, [
      createCommand('my-script.js', 'file:///path/to/my-script.js'),
    ]);
    const out = execSync('node src/index.js list --type py', { encoding: 'utf8' });
    expect(out.trim()).toBe(''); // Output should be empty
  });

  // Scenario: List commands with --include-dev and filters
  test('should list dev commands with filters when --include-dev is used', () => {
    cleanup();
    writeIndex(false, [
      createCommand('prod-js', 'file:///path/to/prod.js'),
      createCommand('dev-js', 'file:///path/to/dev.js', '', [], '--llm', true),
    ]);
    const out = execSync('node src/index.js list --type js --include-dev', { encoding: 'utf8' });
    expect(out).toContain('prod-js');
    expect(out).toContain('dev-js');
  });
});