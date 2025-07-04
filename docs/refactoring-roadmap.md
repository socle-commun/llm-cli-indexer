# Refactoring Roadmap: Full ES Modules Migration and Robust Testing

This document outlines the detailed plan for refactoring the `llm-cli` project to fully adopt ES Modules and establish a robust testing infrastructure. This roadmap will be updated as progress is made.

## Goal
To achieve a consistent and modern JavaScript module system (ES Modules) across the entire codebase, and to ensure reliable, fast, and easy-to-debug tests.

## Current Problems Identified

1.  **Incohérence des Modules**: Mixing `require` (CommonJS) and `import` (ES Modules) causing `TypeError: require(...).command is not a function` and `Cannot find module` errors in tests.
2.  **Tests Fragiles**: Tests are sensitive to console output and file system states between executions, leading to `ENOENT` errors and incorrect assertions.
3.  **Lack of Test Architecture Clarity**: Tests relying on `execSync` to call the full CLI make debugging difficult and tests slow.

## Detailed Plan

### Phase 1: Complete ES Modules Migration
*   **Objective**: Convert all `.js` files in the project to ES Modules.
*   **Status**: In Progress
*   **Steps**:
    *   **`package.json`**: Confirm `"type": "module"` is present. (Done)
    *   **`src/index.js`**: Ensure it uses `import` for `Command` from `commander` and for all command modules. Each command will be imported as an object with a `command` property. (Done)
    *   **`src/commands/**/*.js`**: Convert all `require` to `import` and `module.exports` to `export const` or `export default`. Ensure each file exports an object with a `command` property and any other necessary utility functions.
        *   `src/commands/init/index.js` (Done)
        *   `src/commands/add/index.js` (Done)
        *   `src/commands/list/index.js` (Done)
        *   `src/commands/remove/index.js` (Done)
        *   `src/commands/search/index.js` (Done)
        
    *   **`src/utils/index.js`**: Ensure all utility functions are exported individually with `export`. (Done)

### Phase 2: Refactor Tests for Robustness
*   **Objective**: Make tests more reliable, faster, and easier to debug by minimizing `execSync` and improving isolation.
*   **Status**: In Progress
*   **Steps**:
    *   **Modularization of `add` command**: The `add` command's logic has been fragmented into smaller, single-responsibility process files located in `src/commands/add/processes/`.
        *   `getCommandDescription.process.js`: Handles inferring command descriptions.
        *   `inferTagsFromExtension.process.js`: Handles inferring tags from file extensions.
        *   `processConfigFile.process.js`: Manages adding commands from a configuration file.
        *   `processSingleCommand.process.js`: Manages adding a single command.
    *   **Co-located Unit Tests for Processes**: Dedicated unit tests have been created for each process file, located alongside the process files themselves (e.g., `src/commands/add/processes/getCommandDescription.process.test.js`). These tests mock external dependencies to ensure true unit isolation.
    *   **`tests/commands/*.test.js`**: Convert all test files to use ES Module syntax (`import`).
        *   `tests/commands/init.test.js` (To do)
        *   `tests/commands/add.test.js` (To do)
        *   `tests/commands/list.test.js` (To do)
        *   `tests/commands/remove.test.js` (To do)
        *   `tests/commands/search.test.js` (To do)
        
    *   **Initialisation de l'Index dans les Tests**: For tests requiring an initialized index, import and call `initAction` directly instead of using `execSync('node src/index.js init')`. This will execute initialization within the same test process, avoiding `execSync` and file system state issues.
    *   **Robust Cleanup**: Confirm `cleanup` functions use `fs.rmSync(..., { recursive: true, force: true })` for reliable temporary directory removal. (Already implemented in some tests, needs verification across all).
    *   **Improved Assertions**: For `init` command tests, verify file system existence and content directly rather than relying on exact console output.
    *   **Simulated Test Scripts**: Ensure dummy scripts (`tests/temp_scripts/*.js`) are Node.js scripts and executed via `node <scriptPath> --help`.

### Phase 3: Verification and Validation
*   **Objective**: Confirm all modifications work as expected and the project is stable.
*   **Status**: Not Started
*   **Steps**:
    *   **Execute all tests**: Run `npm test` and ensure all tests pass.
    *   **Verify Consistency**: Ensure module and test structure is coherent and understandable.

## Next Immediate Steps

I will now proceed with running the newly created unit tests for the `add` command processes to ensure their correctness and then integrate them into the overall test suite. This will be followed by addressing the remaining issues in the higher-level `add` command tests.
