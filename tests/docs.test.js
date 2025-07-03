import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execSync } from 'child_process';
import { existsSync, readFileSync, rmSync } from 'fs';

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

