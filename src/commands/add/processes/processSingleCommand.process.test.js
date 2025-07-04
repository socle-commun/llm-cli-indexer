import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { processSingleCommand } from './processSingleCommand.process.js';
import { getCommandDescription } from './getCommandDescription.process.js';
import { inferTagsFromExtension } from './inferTagsFromExtension.process.js';

// Mock external dependencies
vi.mock('fs', async () => {
  const actual = await vi.importActual('fs');
  return {
    ...actual,
    existsSync: vi.fn(),
    lstatSync: vi.fn(),
  };
});

vi.mock('path', () => ({
  resolve: vi.fn((p) => p),
  dirname: vi.fn((p) => p.split('/').slice(0, -1).join('/')),
  extname: vi.fn(),
}));

vi.mock('./getCommandDescription.process.js', () => ({
  getCommandDescription: vi.fn(),
}));

vi.mock('./inferTagsFromExtension.process.js', () => ({
  inferTagsFromExtension: vi.fn(),
}));

// Mock utility functions from ../../utils/index.js
const mockGetIndexPath = vi.fn(() => '/mock/path/to/index.json');
const mockReadIndex = vi.fn(() => []);
const mockWriteIndex = vi.fn();

describe('processSingleCommand.process.js', () => {
  const mockIndexPath = '/mock/path/to/index.json';
  let mockIndex;

  beforeEach(() => {
    vi.clearAllMocks();
    mockIndex = [];
    mockReadIndex.mockReturnValue(mockIndex);
    fs.existsSync.mockReturnValue(false); // Assume not a file by default
    fs.lstatSync.mockReturnValue({ isFile: () => false });
  });

  test('should add a new system command with inferred description', () => {
    const commandName = 'my-system-cmd';
    const expectedDescription = 'System command description.';

    getCommandDescription.mockReturnValue(expectedDescription);

    processSingleCommand(commandName, { name: 'my-cmd' }, mockIndex, mockIndexPath, mockWriteIndex);

    expect(mockIndex.length).toBe(1);
    expect(mockIndex[0]).toEqual({
      name: 'my-cmd',
      command: 'my-system-cmd',
      description: expectedDescription,
      tags: [],
      llmHelpSource: '--help',
      dev: false,
      global: false,
      installCommand: undefined,
    });
    expect(getCommandDescription).toHaveBeenCalledWith(commandName, '--help');
    expect(mockWriteIndex).toHaveBeenCalledWith(mockIndexPath, mockIndex);
  });

  test('should add a new file-based command with inferred description and tags', () => {
    const scriptPath = '/path/to/script.js';
    const expectedDescription = 'Script description.';
    const inferredTags = ['javascript'];

    fs.existsSync.mockReturnValue(true);
    fs.lstatSync.mockReturnValue({ isFile: () => true });
    path.extname.mockReturnValue('.js');
    getCommandDescription.mockReturnValue(expectedDescription);
    inferTagsFromExtension.mockReturnValue(inferredTags);

    processSingleCommand(scriptPath, { name: 'my-script' }, mockIndex, mockIndexPath, mockWriteIndex);

    expect(mockIndex.length).toBe(1);
    expect(mockIndex[0]).toEqual({
      name: 'my-script',
      url: `file://${scriptPath}`,
      description: expectedDescription,
      tags: inferredTags,
      llmHelpSource: '--help',
      dev: false,
      global: false,
      installCommand: undefined,
    });
    expect(getCommandDescription).toHaveBeenCalledWith(scriptPath, '--help');
    expect(inferTagsFromExtension).toHaveBeenCalledWith(scriptPath);
    expect(mockWriteIndex).toHaveBeenCalledWith(mockIndexPath, mockIndex);
  });

  test('should use provided description and tags over inferred ones', () => {
    const scriptPath = '/path/to/script.py';
    const customDescription = 'Custom Python script description.';
    const customTags = ['custom', 'tag'];

    fs.existsSync.mockReturnValue(true);
    fs.lstatSync.mockReturnValue({ isFile: () => true });
    path.extname.mockReturnValue('.py');
    getCommandDescription.mockReturnValue('Inferred description (should be ignored)');
    inferTagsFromExtension.mockReturnValue(['python']);

    processSingleCommand(
      scriptPath,
      { name: 'py-script', description: customDescription, tag: customTags },
      mockIndex,
      mockIndexPath,
      mockWriteIndex
    );

    expect(mockIndex.length).toBe(1);
    expect(mockIndex[0].description).toBe(customDescription);
    expect(mockIndex[0].tags).toEqual(customTags);
    expect(getCommandDescription).not.toHaveBeenCalled(); // Should not infer if description is provided
    expect(inferTagsFromExtension).not.toHaveBeenCalled(); // Should not infer if tags are provided
  });

  test('should exit if command name already exists in the index', () => {
    mockIndex.push({
      name: 'existing-cmd',
      url: 'file:///path/to/existing.js',
      description: 'Existing Desc',
      tags: [],
      llmHelpSource: '--help',
      dev: false,
      global: false,
    });
    const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => {});

    processSingleCommand(
      'new-cmd',
      { name: 'existing-cmd' },
      mockIndex,
      mockIndexPath,
      mockWriteIndex
    );

    expect(mockExit).toHaveBeenCalledWith(1);
    expect(mockWriteIndex).not.toHaveBeenCalled();
    mockExit.mockRestore();
  });

  test('should handle commandNameOrPath as an array for system commands', () => {
    const commandParts = ['git', 'log'];
    const expectedDescription = 'Git log command description.';

    fs.existsSync.mockReturnValue(false); // Not a file
    getCommandDescription.mockReturnValue(expectedDescription);

    processSingleCommand(commandParts, { name: 'git log' }, mockIndex, mockIndexPath, mockWriteIndex);

    expect(mockIndex.length).toBe(1);
    expect(mockIndex[0].name).toBe('git log');
    expect(mockIndex[0].command).toBe('git log');
    expect(getCommandDescription).toHaveBeenCalledWith('git log', '--help');
  });

  test('should handle commandNameOrPath as an array for file paths', () => {
    const scriptParts = ['./scripts', 'my-script.js'];
    const fullPath = './scripts/my-script.js';
    const expectedDescription = 'Script description.';
    const inferredTags = ['javascript'];

    fs.existsSync.mockImplementation((p) => p === fullPath);
    fs.lstatSync.mockReturnValue({ isFile: () => true });
    path.extname.mockReturnValue('.js');
    getCommandDescription.mockReturnValue(expectedDescription);
    inferTagsFromExtension.mockReturnValue(inferredTags);

    processSingleCommand(scriptParts, { name: 'my-script' }, mockIndex, mockIndexPath, mockWriteIndex);

    expect(mockIndex.length).toBe(1);
    expect(mockIndex[0].name).toBe('my-script');
    expect(mockIndex[0].url).toBe(`file://${fullPath}`);
    expect(getCommandDescription).toHaveBeenCalledWith(fullPath, '--help');
    expect(inferTagsFromExtension).toHaveBeenCalledWith(fullPath);
  });
});
