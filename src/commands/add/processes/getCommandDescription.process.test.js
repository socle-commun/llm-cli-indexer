import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path'
import { getCommandDescription } from './getCommandDescription.process.js';
import { execSync } from 'child_process';

// Mock child_process.execSync
vi.mock('child_process', () => ({
  execSync: vi.fn(),
}));

// Mock fs and path for file existence checks

vi.mock('fs', () => ({
  default: {
    existsSync: vi.fn(),
    lstatSync: vi.fn(),
    readFileSync: vi.fn(),
  },
}));

vi.mock('path', () => ({
  default: {
    resolve: vi.fn((p) => p),
    dirname: vi.fn((p) => p.split('/').slice(0, -1).join('/')),
    extname: vi.fn(() => '.js'),
  },
}));

describe('getCommandDescription.process.js', () => {
  beforeEach(() => {
    // Reset mocks before each test
    execSync.mockClear();
    fs.existsSync.mockClear();
    fs.lstatSync.mockClear();
    path.resolve.mockClear();
    path.dirname.mockClear();
    path.extname.mockClear();
  });

  test('should infer description for a JS file', () => {
    const scriptPath = '/app/test_scripts/my-script.js';
    const expectedDescription = 'This is a test description.';

    fs.existsSync.mockReturnValue(true);
    fs.lstatSync.mockReturnValue({ isFile: () => true });
    path.extname.mockReturnValue('.js');
    execSync.mockReturnValue(expectedDescription);

    const description = getCommandDescription(scriptPath, '--help');

    expect(description).toBe(expectedDescription);
    expect(execSync).toHaveBeenCalledWith(
      `node "${scriptPath}" --help`,
      expect.any(Object)
    );
    expect(execSync.mock.calls[0][1].cwd).toBe(path.dirname(scriptPath));
  });

  test('should infer description for a non-JS executable file', () => {
    const scriptPath = '/app/test_scripts/my-script.sh';
    const expectedDescription = 'Shell script description.';

    fs.existsSync.mockReturnValue(true);
    fs.lstatSync.mockReturnValue({ isFile: () => true });
    path.extname.mockReturnValue('.sh');
    execSync.mockReturnValue(expectedDescription);

    const description = getCommandDescription(scriptPath, '--help');

    expect(description).toBe(expectedDescription);
    expect(execSync).toHaveBeenCalledWith(
      `"${scriptPath}" --help`,
      expect.any(Object)
    );
    expect(execSync.mock.calls[0][1].cwd).toBe(path.dirname(scriptPath));
  });

  test('should infer description for a system command', () => {
    const commandName = 'git';
    const expectedDescription = 'git command description.';

    fs.existsSync.mockReturnValue(false); // Not a file
    execSync.mockReturnValue(expectedDescription);

    const description = getCommandDescription(commandName, '--version');

    expect(description).toBe(expectedDescription);
    expect(execSync).toHaveBeenCalledWith(
      `git --version`,
      expect.any(Object)
    );
    expect(execSync.mock.calls[0][1].cwd).toBe(process.cwd()); // Should use default cwd
  });

  test('should return empty string if command execution fails', () => {
    const scriptPath = '/app/non-existent-script.js';

    fs.existsSync.mockReturnValue(true);
    fs.lstatSync.mockReturnValue({ isFile: () => true });
    path.extname.mockReturnValue('.js');
    execSync.mockImplementation(() => {
      throw new Error('Command failed');
    });

    const description = getCommandDescription(scriptPath, '--help');

    expect(description).toBe('');
    expect(execSync).toHaveBeenCalled();
  });

  test('should return empty string if command output is empty', () => {
    const scriptPath = '/app/empty-output-script.js';

    fs.existsSync.mockReturnValue(true);
    fs.lstatSync.mockReturnValue({ isFile: () => true });
    path.extname.mockReturnValue('.js');
    execSync.mockReturnValue('\n\n'); // Empty output with newlines

    const description = getCommandDescription(scriptPath, '--help');

    expect(description).toBe('');
    expect(execSync).toHaveBeenCalled();
  });
});
