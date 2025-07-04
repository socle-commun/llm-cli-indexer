import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { cleanup, initCliIndex, localLlmCliDir, localIndexPath, globalLlmCliDir, globalIndexPath } from '../../test-utils.js';

describe('llm-cli init command', () => {
  test('should create local .llm-cli directory and index.json', () => {
    cleanup();
    initCliIndex();
    expect(fs.existsSync(localLlmCliDir)).toBe(true);
    expect(fs.existsSync(localIndexPath)).toBe(true);
    expect(fs.readFileSync(localIndexPath, 'utf8')).toBe('[]');
  });

  // Scenario: Re-initializing local llm-cli directory and index.json
  test('should report existing local .llm-cli directory and index.json on re-initialization', () => {
    cleanup();
    // First, ensure it's created
    initCliIndex();
    // Then, run again and check output
    const output = execSync('node src/index.js init', { encoding: 'utf8', stdio: 'pipe' });
    expect(output).toContain(`Directory already exists: ${localLlmCliDir}`);
    expect(output).toContain(`File already exists: ${localIndexPath}`);
  });

  // Scenario: Initialize global llm-cli directory and index.json
  test('should create global .llm-cli directory and index.json', () => {
    cleanup();
    initCliIndex(true);
    expect(fs.existsSync(globalLlmCliDir)).toBe(true);
    expect(fs.existsSync(globalIndexPath)).toBe(true);
    expect(fs.readFileSync(globalIndexPath, 'utf8')).toBe('[]');
  });

  // Scenario: Re-initializing global llm-cli directory and index.json
  test('should report existing global .llm-cli directory and index.json on re-initialization', () => {
    cleanup();
    // First, ensure it's created
    initCliIndex(true);
    // Then, run again and check output
    const output = execSync('node src/index.js init --global', { encoding: 'utf8', stdio: 'pipe' });
    expect(output).toContain(`Directory already exists: ${globalLlmCliDir}`);
    expect(output).toContain(`File already exists: ${globalIndexPath}`);
  });
});