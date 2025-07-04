### CLI Testing Guidelines

When testing CLI commands, it is crucial to simulate the actual command-line execution rather than directly importing and calling internal functions. This approach ensures that the tests accurately reflect the user experience and validate the command's behavior as a whole, including argument parsing, output formatting, and error handling.

Test files are organized into subdirectories per command (e.g., `tests/commands/init/init.test.js`).

-   **Use `child_process.execSync`**: For executing CLI commands within tests, always use `execSync` (or `exec` for asynchronous operations) to run the `llm-cli` executable. This mimics how a user would interact with the CLI.
-   **Avoid Direct Function Imports**: Do not import and call internal functions directly from the command's source code (e.g., `src/commands/add/index.js`). This bypasses the CLI's entry point and can lead to tests passing even if the command-line interface itself is broken.
-   **Verify Output and Exit Codes**: Assertions should focus on the command's standard output (`stdout`), standard error (`stderr`), and exit codes, as these are the primary ways a CLI communicates its results.

### Common Pitfalls and Solutions in CLI Testing

-   **Path Handling in Docker**: When running tests inside a Docker container, be aware that `process.cwd()` will resolve to the container's working directory (e.g., `/app`). This can cause discrepancies if your test setup relies on relative paths from the project root. To avoid this, use relative paths (e.g., `.` or `./`) instead of `process.cwd()` when constructing paths for file operations or command execution within your tests. This ensures that paths are resolved consistently, regardless of the execution environment.
-   **Path Handling**: When constructing commands for `execSync`, especially in cross-platform environments (e.g., Windows), always normalize file paths to use forward slashes (`/`) using `path.join(...).replace(/\\/g, '/')`). This ensures consistent command interpretation across different operating systems.

-   **Escaping for Regular Expressions**: When dynamically building regular expressions (e.g., for `expect(...).toMatch(new RegExp(...))`), ensure that any variable parts of the string are properly escaped using a utility function like `escapeRegExp`. This prevents special regex characters in file names or paths from breaking the regular expression.
    ```javascript
    function escapeRegExp(string) {
      return string.replace(/[.*+?^${}()|[\]\\]/g, '\$&'); // $& means the matched substring
    }
    ```
-   **Debugging Parsing Errors (Vitest/Vite)**: If you encounter "Failed to parse source for import analysis because the content contains invalid JS syntax" or similar errors during testing, especially after modifying test files:
    -   **Check for Malformed Strings**: Review any string literals, particularly template literals (` `` `), that might contain unescaped backticks or other characters that could be misinterpreted by the JavaScript parser.
    -   **Simplify Complex Lines**: Temporarily simplify complex lines, especially those involving string concatenation or dynamic regex construction, to isolate the problematic part.
    -   **Verify `replace` Tool Usage**: Ensure that when using the `replace` tool, the `new_string` argument is a perfectly valid and correctly escaped JavaScript string. Incorrect escaping or malformed strings passed to `replace` can corrupt the target file, leading to parsing errors. Always double-check the `new_string` content.
