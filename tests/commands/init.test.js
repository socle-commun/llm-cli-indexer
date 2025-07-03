import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

describe('llm-cli init command', () => {
  const localLlmCliDir = path.join(process.cwd(), '.llm-cli');
  const localIndexPath = path.join(localLlmCliDir, 'index.json');
  const globalLlmCliDir = path.join(os.homedir(), '.llm-cli');
  const globalIndexPath = path.join(globalLlmCliDir, 'index.json');

  // Helper to clean up directories and files
  const cleanup = () => {
    if (fs.existsSync(localLlmCliDir)) {
      fs.rmSync(localLlmCliDir, { recursive: true, force: true });
    }
    if (fs.existsSync(globalLlmCliDir)) {
      fs.rmSync(globalLlmCliDir, { recursive: true, force: true });
    }
  };

  beforeEach(() => {
    cleanup();
  });

  afterEach(() => {
    cleanup();
  });

  // Scenario: Initialize local llm-cli directory and index.json
  test('should create local .llm-cli directory and index.json', () => {
    execSync('node src/index.js init', { encoding: 'utf8' });
    expect(fs.existsSync(localLlmCliDir)).toBe(true);
    expect(fs.existsSync(localIndexPath)).toBe(true);
    expect(fs.readFileSync(localIndexPath, 'utf8')).toBe('[]');
  });

  // Scenario: Re-initializing local llm-cli directory and index.json
  test('should report existing local .llm-cli directory and index.json on re-initialization', () => {
    // First, ensure it's created
    execSync('node src/index.js init', { encoding: 'utf8' });
    // Then, run again and check output
    const output = execSync('node src/index.js init', { encoding: 'utf8' });
    expect(output).toContain(`Directory already exists: ${localLlmCliDir}`);
    expect(output).toContain(`File already exists: ${localIndexPath}`);
  });

  // Scenario: Initialize global llm-cli directory and index.json
  test('should create global .llm-cli directory and index.json', () => {
    execSync('node src/index.js init --global', { encoding: 'utf8' });
    expect(fs.existsSync(globalLlmCliDir)).toBe(true);
    expect(fs.existsSync(globalIndexPath)).toBe(true);
    expect(fs.readFileSync(globalIndexPath, 'utf8')).toBe('[]');
  });

  // Scenario: Re-initializing global llm-cli directory and index.json
  test('should report existing global .llm-cli directory and index.json on re-initialization', () => {
    // First, ensure it's created
    execSync('node src/index.js init --global', { encoding: 'utf8' });
    // Then, run again and check output
    const output = execSync('node src/index.js init --global', { encoding: 'utf8' });
    expect(output).toContain(`Directory already exists: ${globalLlmCliDir}`);
    expect(output).toContain(`File already exists: ${globalIndexPath}`);
  });
});
