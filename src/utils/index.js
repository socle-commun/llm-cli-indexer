import fs from 'fs';
import path from 'path';
import os from 'os';

const LLM_CLI_DIR = '.llm-cli';
const INDEX_FILE = 'index.json';

export function getIndexPath(isGlobal) {
  const base = isGlobal ? os.homedir() : '.';
  return path.join(base, LLM_CLI_DIR, INDEX_FILE);
}

export function readIndex(indexPath) {
  if (!fs.existsSync(indexPath)) {
    return [];
  }
  const content = fs.readFileSync(indexPath, 'utf8');
  return JSON.parse(content);
}

export function writeIndex(indexPath, data) {
  const dir = path.dirname(indexPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  console.log(`DEBUG: Write index to ${indexPath}.`);
  fs.writeFileSync(indexPath, JSON.stringify(data, null, 2));
}
