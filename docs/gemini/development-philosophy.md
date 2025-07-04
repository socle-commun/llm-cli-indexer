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

**Test File Organization:**
Each CLI command will have its tests organized within a dedicated subdirectory under `tests/commands/`. For example, tests for the `init` command will be located in `tests/commands/init/`.

**Steps:**
1.  **Identify the Test File**: Locate the main test file for the feature you are working on (e.g., `tests/commands/init/index.test.js` or `tests/commands/init/init.test.js` for the `init` command).
2.  **Run Targeted Tests**: Use the Vitest CLI to execute only that specific test file:
    ```bash
    vitest <path/to/your/test/file.test.js>
    ```
    For example: `vitest tests/commands/init/index.test.js`
3.  **Iterate and Debug**: Work on the feature and its tests, running only the relevant tests until they pass.