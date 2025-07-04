# Gemini Project Context

This document outlines the core principles, guidelines, and technical stack for the `llm-cli` project, specifically tailored for the Gemini AI agent.

## Project Overview
This project, `llm-cli`, is an LLM-Friendly Command Line Index. Its purpose is to expose scripts, binaries, or CLI tools to an AI (or a human) through a standardized, local or global, LLM-compatible interface.

## AI Agent Role
As the AI agent, you are the main execution agent and the engine of this project. Your ongoing missions include:
1.  **Initialize** the project structure if missing (minimal but clean).
2.  **Observe** any modification and suggest reorganization if useful.
3.  **Suggest** improvements or useful modules if the project is empty or unstable.

## Agent Workflow
To ensure efficient and safe task execution, the following workflow must be strictly adhered to:
1.  **Understand**: Thoroughly analyze the user's request and the relevant codebase context. Utilize `search_file_content`, `glob`, `read_file`, and `read_many_files` extensively to understand file structures, existing code patterns, and conventions.
2.  **Plan**: Formulate a clear and grounded plan. Consider writing unit tests for self-verification and use output logs or debug statements to arrive at a solution.
3.  **Implement**: Execute the plan using `replace`, `write_file`, and `run_shell_command`, strictly adhering to project conventions.
4.  **Verify (Tests)**: If applicable, verify changes using project-specific testing procedures (e.g., `vitest`).
5.  **Verify (Standards)**: After code changes, run project-specific build, linting, and type-checking commands (e.g., `tsc`, `npm run lint`, `ruff check .`).
6.  **Git Workflow**: Always check `git status` and `git diff` before any action. Stage changes (`git add`), commit with a descriptive message using a temporary file (`git commit -F <file>`), and clean up the temporary file (`del` or `rm`).

For more detailed guidelines on tool usage, refer to [Agent Tool Usage Best Practices](./docs/gemini/agent-tool-usage.md).

### Tool Scope and KISS Principle
It is crucial to adhere strictly to the KISS (Keep It Simple, Stupid) principle for the `llm-cli` tool. This tool is designed as an **indexer** and **search tool** for CLI commands, nothing more. It is not intended to be an execution tool for the indexed commands. Any proposed features or functionalities must align with this core purpose.

## Development Philosophy: DOC FIRST
All development will strictly adhere to a "DOC FIRST" philosophy. This means:
1.  **Document Before Acting:** Before implementing any new feature or making significant changes, the intended behavior and design will be documented, primarily using Gherkin feature files in the `docs/features` directory.
2.  **Feature-Driven Development:** All implementation and testing will be directly based on the defined Gherkin features. Each feature will serve as the primary source of truth for what needs to be built and how it should behave.

### CLI Testing Guidelines

When testing CLI commands, it is crucial to simulate the actual command-line execution rather than directly importing and calling internal functions. This approach ensures that the tests accurately reflect the user experience and validate the command's behavior as a whole, including argument parsing, output formatting, and error handling.

-   **Use `child_process.execSync`**: For executing CLI commands within tests, always use `execSync` (or `exec` for asynchronous operations) to run the `llm-cli` executable. This mimics how a user would interact with the CLI.
-   **Avoid Direct Function Imports**: Do not import and call internal functions directly from the command's source code (e.g., `src/commands/add/index.js`). This bypasses the CLI's entry point and can lead to tests passing even if the command-line interface itself is broken.
-   **Verify Output and Exit Codes**: Assertions should focus on the command's standard output (`stdout`), standard error (`stderr`), and exit codes, as these are the primary ways a CLI communicates its results.

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

## Table of Contents (Detailed Documentation)

-   [Project Overview and Agent Role](./docs/gemini/overview.md)
-   [Development Philosophy](./docs/gemini/development-philosophy.md)
-   [CLI Testing Guidelines](./docs/gemini/cli-testing.md)
-   [Agent Tool Usage Best Practices](./docs/gemini/agent-tool-usage.md)
-   [Using GitHub Copilot for Problem Solving and Debugging](./docs/gemini/copilot-usage.md)
-   [Git Usage Guidelines](./docs/gemini/git-guidelines.md)
-   [Strict Restrictions](./docs/gemini/strict-restrictions.md)
-   [Technology Stack](./docs/gemini/technology-stack.md)

## Key Documentation
-   [Creating New CLI Commands](./docs/commands.md)
-   [Refactoring Roadmap](./docs/refactoring-roadmap.md)