/**
 * @file inferTagsFromExtension.process.js
 * @description This process infers tags for a command based on its file extension.
 * @module processes/inferTagsFromExtension
 */

import path from 'path';

/**
 * Infers tags for a command based on its file extension.
 * @param {string} filePath - The path to the command file.
 * @returns {string[]} An array of inferred tags.
 */
export function inferTagsFromExtension(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.js':
      return ['javascript'];
    case '.py':
      return ['python'];
    case '.sh':
      return ['shell', 'bash'];
    default:
      return [];
  }
}
