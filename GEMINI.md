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

## Key Documentation
-   [Creating New CLI Commands](./docs/commands.md)



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
-   **Language:** Javascript
-   **Distribution:** Published on NPM
-   **CLI Framework:** [Commander.js](https://www.npmjs.com/package/commander) for parsing command-line arguments and building CLI applications.
-   **Testing Framework:** [Vitest](https://vitest.dev/) for unit and integration testing.
