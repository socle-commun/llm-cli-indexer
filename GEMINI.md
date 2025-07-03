# Gemini Project Context

## Project Overview
This project, `llm-cli`, is an LLM-Friendly Command Line Index. Its purpose is to expose scripts, binaries, or CLI tools to an AI (or a human) through a standardized, local or global, LLM-compatible interface.

## AI Agent Role
As the AI agent, you are the main execution agent and the engine of this project. Your ongoing missions include:
1.  **Initialize** the project structure if missing (minimal but clean).
2.  **Observe** any modification and suggest reorganization if useful.
3.  **Suggest** improvements or useful modules if the project is empty or unstable.

## Agent Behavior
If you are unsure what to do, use the `/docs/roadmap.md` file as a base for action hypotheses.

## Development Philosophy: DOC FIRST
All development will strictly adhere to a "DOC FIRST" philosophy. This means:
1.  **Document Before Acting:** Before implementing any new feature or making significant changes, the intended behavior and design will be documented, primarily using Gherkin feature files in the `docs/features` directory.
2.  **Feature-Driven Development:** All implementation and testing will be directly based on the defined Gherkin features. Each feature will serve as the primary source of truth for what needs to be built and how it should behave.

### Workflow Steps:
    a.  **Document Features:** Create or update Gherkin `.feature` files in `docs/features` to describe the desired behavior.
    b.  **Code Tests:** Write automated tests (using Vitest) that directly correspond to the scenarios defined in the Gherkin feature files. These tests should initially fail.
    c.  **Implement Features:** Write the necessary code to make the newly written tests pass.
    d.  **Comment Code Intelligibly:** Ensure all code is clearly and concisely commented, explaining *why* a piece of code exists or *how* complex logic works, rather than simply *what* it does.

### Testing by Feature

To facilitate focused development and debugging, tests can be executed for specific features. This allows for rapid iteration on a single command or functionality without running the entire test suite.

**Steps:**
1.  **Identify the Test File**: Locate the test file corresponding to the feature you are working on (e.g., `tests/commands/init.test.js` for the `init` command).
2.  **Run Targeted Tests**: Use the Vitest CLI to execute only that specific test file:
    ```bash
    vitest <path/to/your/test/file.test.js>
    ```
    For example: `vitest tests/commands/init.test.js`
3.  **Iterate and Debug**: Work on the feature and its tests, running only the relevant tests until they pass.

### CLI Testing Guidelines

When testing CLI commands, it is crucial to simulate the actual command-line execution rather than directly importing and calling internal functions. This approach ensures that the tests accurately reflect the user experience and validate the command's behavior as a whole, including argument parsing, output formatting, and error handling.

-   **Use `child_process.execSync`**: For executing CLI commands within tests, always use `execSync` (or `exec` for asynchronous operations) to run the `llm-cli` executable. This mimics how a user would interact with the CLI.
-   **Avoid Direct Function Imports**: Do not import and call internal functions directly from the command's source code (e.g., `src/commands/add/index.js`). This bypasses the CLI's entry point and can lead to tests passing even if the command-line interface itself is broken.
-   **Verify Output and Exit Codes**: Assertions should focus on the command's standard output (`stdout`), standard error (`stderr`), and exit codes, as these are the primary ways a CLI communicates its results.

### Common Pitfalls and Solutions in CLI Testing

-   **Path Handling**: When constructing commands for `execSync`, especially in cross-platform environments (e.g., Windows), always normalize file paths to use forward slashes (`/`) using `path.join(...).replace(/\\/g, '/')`. This ensures consistent command interpretation across different operating systems.
-   **Escaping for Regular Expressions**: When dynamically building regular expressions (e.g., for `expect(...).toMatch(new RegExp(...))`), ensure that any variable parts of the string are properly escaped using a utility function like `escapeRegExp`. This prevents special regex characters in file names or paths from breaking the regular expression.
    ```javascript
    function escapeRegExp(string) {
      return string.replace(/[.*+?^${}()|[\]\\]/g, '\\-   **Verify Output and Exit Codes**: Assertions should focus on the command's standard output (`stdout`), standard error (`stderr`), and exit codes, as these are the primary ways a CLI communicates its results.'); // -   **Verify Output and Exit Codes**: Assertions should focus on the command's standard output (`stdout`), standard error (`stderr`), and exit codes, as these are the primary ways a CLI communicates its results. means the matched substring
    }
    ```
-   **Debugging Parsing Errors (Vitest/Vite)**: If you encounter "Failed to parse source for import analysis because the content contains invalid JS syntax" or similar errors during testing, especially after modifying test files:
    -   **Check for Malformed Strings**: Review any string literals, particularly template literals (` `` `), that might contain unescaped backticks or other characters that could be misinterpreted by the JavaScript parser.
    -   **Simplify Complex Lines**: Temporarily simplify complex lines, especially those involving string concatenation or dynamic regex construction, to isolate the problematic part.
    -   **Verify `replace` Tool Usage**: Ensure that when using the `replace` tool, the `new_string` argument is a perfectly valid and correctly escaped JavaScript string. Incorrect escaping or malformed strings passed to `replace` can corrupt the target file, leading to parsing errors. Always double-check the `new_string` content.

### Agent Tool Usage Best Practices

-   **`replace` Tool Precision**: When using the `replace` tool, always provide the `old_string` and `new_string` with exact literal content, including all whitespace and indentation. For multiple occurrences of the `old_string`, explicitly set the `expected_replacements` parameter to the number of expected replacements. This prevents unintended modifications or tool failures due to ambiguous matches.

```

## Key Documentation
-   [Creating New CLI Commands](./docs/commands.md)
-   [Refactoring Roadmap](./docs/refactoring-roadmap.md)



## Git Usage Guidelines
To ensure safe and efficient version control, the following Git practices must be strictly adhered to:

1.  **Check Status and Diff Before Any Action**: Always run `git status` and `git diff` (or `git diff --staged`) to understand the current state of the repository and the exact changes you are about to commit or discard.
2.  **Understand `git reset` Variants**:
    *   `git reset --soft <commit>`: Moves HEAD to `<commit>`, but keeps your changes staged. Useful for amending commits.
    *   `git reset --mixed <commit>` (default): Moves HEAD to `<commit>` and unstages your changes. Your working directory remains untouched.
    *   `git reset --hard <commit>`: **DANGEROUS**. Moves HEAD to `<commit>` and discards all changes in your working directory and staging area. **Use with extreme caution as it leads to irreversible data loss.**
3.  **Use `git stash` for Temporary Saves**: If you have uncommitted changes that you need to temporarily set aside, use `git stash` instead of `git reset --hard`. This safely stores your changes, which can be reapplied later.
4.  **Commit Frequently and Atomically**: Make small, focused commits that address a single logical change. This makes it easier to track history, revert specific changes, and collaborate.
5.  **Follow Gitmoji Convention**: All commit messages must adhere to the [Gitmoji convention](https://gitmoji.dev/). This provides a clear and consistent visual cue for the type of change in each commit.
6.  **Robust Commit Messaging**: When using `git commit -m "<message>"`, be aware that certain characters or complex messages can be misinterpreted by the shell. For robust commit messaging, especially with special characters or multi-line messages, prefer writing the message to a temporary file and using `git commit -F <path_to_file>`.

## Strict Restrictions
Limit file size to **100 lines per file**.
The root `README.md` may exceed this limit for comprehensive documentation.

## Technology Stack
-   **Language:** Javascript (ES Modules)
-   **Module System:** All new and refactored JavaScript code will use ES Module syntax (`import`/`export`). The `package.json` will be configured with `"type": "module"` to enable this.
-   **Distribution:** Published on NPM
-   **CLI Framework:** [Commander.js](https://www.npmjs.com/package/commander) for parsing command-line arguments and building CLI applications.
-   **Testing Framework:** [Vitest](https://vitest.dev/) for unit and integration testing.
