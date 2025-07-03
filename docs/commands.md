# Creating New CLI Commands

This document outlines the process for adding new commands to the `llm-cli` tool, following the established modular structure.

## Command Structure
Each CLI command should reside in its own dedicated directory within `src/commands/`. The directory should be named after the command, and it must contain an `index.js` file that exports a function responsible for defining the command using `commander.js`.

Example: For a command named `my-command`, the structure would be:

```
src/
├── commands/
│   └── my-command/
│       └── index.js
└── index.js
```

## Step-by-Step Guide

### 1. Create the Command Directory and File
Create a new directory for your command inside `src/commands/` and an `index.js` file within it.

```bash
mkdir src/commands/my-command
touch src/commands/my-command/index.js
```

### 2. Define the Command Logic (`src/commands/my-command/index.js`)
Inside `src/commands/my-command/index.js`, export a function that takes the `commander` program instance as an argument. Use this instance to define your command, its description, options, and action.

```javascript
// src/commands/my-command/index.js

module.exports = (program) => {
  program.command('my-command <arg1>')
    .description('A brief description of what my-command does')
    .option('-o, --option <value>', 'An example option')
    .action((arg1, options) => {
      console.log(`Executing my-command with arg1: ${arg1}`);
      if (options.option) {
        console.log(`Option value: ${options.option}`);
      }
      // Implement your command's logic here
    });
};
```

### 3. Load the Command in `src/index.js`
In the main `src/index.js` file, `require` your new command module and pass the `program` instance to it. This will register your command with `commander.js`.

```javascript
// src/index.js (excerpt)

const { Command } = require('commander');

const program = new Command();

// ... basic program setup (name, description, version)

// Load commands
require('./commands/init')(program);
require('./commands/my-command')(program); // Add this line for your new command

// ... program.parse(process.argv);
```

### 4. Write Tests for the New Command
Following the "DOC FIRST" philosophy, ensure you write comprehensive tests for your new command in `tests/index.test.js` (or a dedicated test file if the test suite grows large). These tests should cover all scenarios defined in your Gherkin feature file for this command.

### 5. Update Gherkin Feature Files
Create or update a Gherkin `.feature` file in `docs/features/` that describes the behavior of your new command. This serves as the primary specification for your command.
