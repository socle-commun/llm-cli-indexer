### Agent Workflow Best Practices

To ensure efficient and safe task execution, the following workflow must be strictly adhered to:

1.  **Understand**: Thoroughly analyze the user's request and the relevant codebase context. Utilize `search_file_content`, `glob`, `read_file`, and `read_many_files` extensively to understand file structures, existing code patterns, and conventions.

2.  **Plan**: Formulate a clear and grounded plan. Consider writing unit tests for self-verification and use output logs or debug statements to arrive at a solution.

3.  **Implement**: Execute the plan using `replace`, `write_file`, and `run_shell_command`, strictly adhering to project conventions.

4.  **Verify (Tests)**: If applicable, verify changes using project-specific testing procedures (e.g., `vitest`).

5.  **Verify (Standards)**: After code changes, run project-specific build, linting, and type-checking commands (e.g., `tsc`, `npm run lint`, `ruff check .`).

6.  **Git Workflow**: Always check `git status` and `git diff` before any action. Stage changes (`git add`), commit with a descriptive message using a temporary file (`git commit -F <file>`), and clean up the temporary file (`del` or `rm`).

### Tool Specific Guidelines

-   **`replace` Tool Precision**: When using the `replace` tool, always provide the `old_string` and `new_string` with exact literal content, including all whitespace and indentation. For multiple occurrences of the `old_string`, explicitly set the `expected_replacements` parameter to the number of expected replacements. This prevents unintended modifications or tool failures due to ambiguous matches.
-   **Variable Casing and Import Consistency**: Ensure strict adherence to variable casing (e.g., `camelCase` vs. `SCREAMING_SNAKE_CASE`) and consistent import/export practices across files. Mismatched casing or incorrect import paths can lead to `undefined` variables and runtime errors, especially when dealing with file system operations.