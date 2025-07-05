import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execSync } from 'child_process';
import { existsSync, readFileSync, rmSync } from 'fs';

/**
 * Simple integration test for the documentation build process.
 * It runs `npm run docs:build` (see `docs/vitepress.md`) so that the
 * static site is generated before assertions run.
 *
 * The README details all CLI commands provided by this project. When new
 * features are added there, the test ensures the site still compiles.
 */

const buildDocs = () => {
  execSync('npm run docs:build', { stdio: 'inherit' });
};

const cleanDist = () => {
  if (existsSync('docs/.vitepress/dist')) {
    rmSync('docs/.vitepress/dist', { recursive: true, force: true });
  }
};

describe('Documentation build', () => {
  beforeAll(() => {
    buildDocs();
  });

  afterAll(() => {
    cleanDist();
  });

  it('generates index.html', () => {
    expect(existsSync('docs/.vitepress/dist/index.html')).toBe(true);
  });

  it('index.html contains welcome title', () => {
    const content = readFileSync('docs/.vitepress/dist/index.html', 'utf8');
    expect(content).toMatch(/Welcome/);
  });
});

