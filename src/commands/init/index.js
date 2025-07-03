import fs from 'fs';
import path from 'path';
import os from 'os';
import { getIndexPath, readIndex, writeIndex } from '../../utils/index.js';

const LLM_CLI_DIR = '.llm-cli';
const INDEX_FILE = 'index.json';

export function initAction(options) {
  const llmCliDir = options.global ? path.join(os.homedir(), LLM_CLI_DIR) : path.join(process.cwd(), LLM_CLI_DIR);
  const indexPath = path.join(llmCliDir, INDEX_FILE);

  if (!fs.existsSync(llmCliDir)) {
    fs.mkdirSync(llmCliDir, { recursive: true });
    console.log(`Created directory: ${llmCliDir}`);
  } else {
    console.log(`Directory already exists: ${llmCliDir}`);
  }

  if (!fs.existsSync(indexPath)) {
    fs.writeFileSync(indexPath, '[]');
    console.log(`Created file: ${indexPath}`);
  } else {
    console.log(`File already exists: ${indexPath}`);
  }
  console.log('llm-cli initialized successfully.');
}

export const command = (program) => {
  program.command('init')
    .description('Initializes the local .llm-cli directory and index.json file')
    .option('-g, --global', 'Initialize in global ~/.llm-cli/ instead of local ./.llm-cli/')
    .action(initAction);
};
