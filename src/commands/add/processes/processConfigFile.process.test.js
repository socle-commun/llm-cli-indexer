import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { processConfigFile } from './processConfigFile.process.js';
import { getCommandDescription } from './getCommandDescription.process.js';
import { inferTagsFromExtension } from './inferTagsFromExtension.process.js';

// Mock external dependencies


vi.mock('fs', async () => {
  const actual = await vi.importActual('fs');
  return {
    ...actual,
    existsSync: vi.fn(),
    readFileSync: vi.fn(),
  };
});

vi.mock('path', async () => {
  const actual = await vi.importActual('path');
  return {
    ...actual,
    extname: vi.fn(),
  };
});

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

describe('processConfigFile.process.js', () => {
  const mockIndexPath = '/mock/path/to/index.json';
  let mockIndex;

  beforeEach(() => {
    vi.clearAllMocks();
    mockIndex = [];
    mockReadIndex.mockReturnValue(mockIndex);
    fs.existsSync.mockReturnValue(true); // Assume config file exists by default
  });

  test('should add multiple commands from a valid config file', () => {
    const configContent = JSON.stringify([
      {
        name: 'cmd1',
        url: 'file:///path/to/script1.js',
        description: 'Desc 1',
        tags: ['tag1'],
      },
      {
        name: 'cmd2',
        url: 'file:///path/to/script2.py',
        llmHelpSource: '--ai',
      },
    ]);
    fs.readFileSync.mockReturnValue(configContent);
    getCommandDescription.mockReturnValueOnce('Inferred Desc 2');
    inferTagsFromExtension.mockReturnValueOnce(['python']);

    processConfigFile({ config: '/path/to/config.json' }, mockIndex, mockIndexPath, mockWriteIndex);

    expect(mockIndex.length).toBe(2);
    expect(mockIndex[0]).toEqual({
      name: 'cmd1',
      url: 'file:///path/to/script1.js',
      description: 'Desc 1',
      tags: ['tag1'],
      llmHelpSource: '--llm', // Default applied
      dev: false,
      global: false,
    });
    expect(mockIndex[1]).toEqual({
      name: 'cmd2',
      url: 'file:///path/to/script2.py',
      description: 'Inferred Desc 2',
      tags: ['python'],
      llmHelpSource: '--ai',
      dev: false,
      global: false,
    });
    expect(mockWriteIndex).toHaveBeenCalledWith(mockIndexPath, mockIndex);
  });

  test('should exit if config file not found', () => {
    fs.existsSync.mockReturnValue(false);
    const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => {});

    processConfigFile({ config: '/path/to/nonexistent.json' }, mockIndex, mockIndexPath, mockWriteIndex);

    expect(fs.existsSync).toHaveBeenCalledWith('/path/to/nonexistent.json');
    expect(mockExit).toHaveBeenCalledWith(1);
    expect(mockWriteIndex).not.toHaveBeenCalled();
    mockExit.mockRestore();
  });

  test('should exit if config file has invalid JSON', () => {
    fs.readFileSync.mockReturnValue('invalid json');
    const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => {});

    processConfigFile({ config: '/path/to/invalid.json' }, mockIndex, mockIndexPath, mockWriteIndex);

    expect(mockExit).toHaveBeenCalledWith(1);
    expect(mockWriteIndex).not.toHaveBeenCalled();
    mockExit.mockRestore();
  });

  test('should exit if config file content is not an array', () => {
    fs.readFileSync.mockReturnValue(JSON.stringify({}));
    const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => {});

    processConfigFile({ config: '/path/to/nonarray.json' }, mockIndex, mockIndexPath, mockWriteIndex);

    expect(mockExit).toHaveBeenCalledWith(1);
    expect(mockWriteIndex).not.toHaveBeenCalled();
    mockExit.mockRestore();
  });

  test('should exit if a command in config is missing required fields', () => {
    const configContent = JSON.stringify([
      {
        name: 'cmd1',
        url: 'file:///path/to/script1.js',
      }, // Missing description and tags
    ]);
    fs.readFileSync.mockReturnValue(configContent);
    getCommandDescription.mockReturnValueOnce('Inferred Desc 1');
    inferTagsFromExtension.mockReturnValueOnce(['js']);
    const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => {});

    processConfigFile({ config: '/path/to/missing.json' }, mockIndex, mockIndexPath, mockWriteIndex);

    expect(mockExit).toHaveBeenCalledWith(1);
    expect(mockWriteIndex).not.toHaveBeenCalled();
    mockExit.mockRestore();
  });

  test('should exit if duplicate command names exist in config file', () => {
    const configContent = JSON.stringify([
      {
        name: 'duplicate',
        url: 'file:///path/to/script1.js',
        description: 'Desc 1',
        tags: ['tag1'],
      },
      {
        name: 'duplicate',
        url: 'file:///path/to/script2.js',
        description: 'Desc 2',
        tags: ['tag2'],
      },
    ]);
    fs.readFileSync.mockReturnValue(configContent);
    const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => {});

    processConfigFile({ config: '/path/to/duplicate.json' }, mockIndex, mockIndexPath, mockWriteIndex);

    expect(mockExit).toHaveBeenCalledWith(1);
    expect(mockWriteIndex).not.toHaveBeenCalled();
    mockExit.mockRestore();
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
    const configContent = JSON.stringify([
      {
        name: 'existing-cmd',
        url: 'file:///path/to/new.js',
        description: 'New Desc',
        tags: [],
      },
    ]);
    fs.readFileSync.mockReturnValue(configContent);
    getCommandDescription.mockReturnValueOnce('New Desc');
    inferTagsFromExtension.mockReturnValueOnce(['js']);
    const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => {});

    processConfigFile({ config: '/path/to/existing.json' }, mockIndex, mockIndexPath, mockWriteIndex);

    expect(mockExit).toHaveBeenCalledWith(1);
    expect(mockWriteIndex).not.toHaveBeenCalled();
    mockExit.mockRestore();
  });
});
