import { describe, test, expect } from 'vitest';
import { inferTagsFromExtension } from './inferTagsFromExtension.process.js';

describe('inferTagsFromExtension.process.js', () => {
  test('should return ['javascript'] for .js files', () => {
    expect(inferTagsFromExtension('script.js')).toEqual(['javascript']);
    expect(inferTagsFromExtension('path/to/file.js')).toEqual(['javascript']);
  });

  test('should return ['python'] for .py files', () => {
    expect(inferTagsFromExtension('script.py')).toEqual(['python']);
    expect(inferTagsFromExtension('path/to/file.py')).toEqual(['python']);
  });

  test('should return ['shell', 'bash'] for .sh files', () => {
    expect(inferTagsFromExtension('script.sh')).toEqual(['shell', 'bash']);
    expect(inferTagsFromExtension('path/to/file.sh')).toEqual(['shell', 'bash']);
  });

  test('should return empty array for unknown extensions', () => {
    expect(inferTagsFromExtension('script.txt')).toEqual([]);
    expect(inferTagsFromExtension('path/to/file.xyz')).toEqual([]);
    expect(inferTagsFromExtension('file_without_extension')).toEqual([]);
  });

  test('should handle mixed case extensions', () => {
    expect(inferTagsFromExtension('script.JS')).toEqual(['javascript']);
    expect(inferTagsFromExtension('script.Py')).toEqual(['python']);
    expect(inferTagsFromExtension('script.SH')).toEqual(['shell', 'bash']);
  });
});
