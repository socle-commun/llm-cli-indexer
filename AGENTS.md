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



## Strict Restrictions
Limit file size to **100 lines per file**.
The root `README.md` may exceed this limit for comprehensive documentation.

## Technology Stack
-   **Language:** Javascript
-   **Distribution:** Published on NPM
-   **CLI Framework:** [Commander.js](https://www.npmjs.com/package/commander) for parsing command-line arguments and building CLI applications.
-   **Testing Framework:** [Vitest](https://vitest.dev/) for unit and integration testing.
