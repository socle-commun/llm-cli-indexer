# Using GitHub Copilot for Problem Solving and Debugging

GitHub Copilot is an invaluable tool for accelerating development, especially during debugging and problem-solving. This document outlines best practices for leveraging Copilot effectively within the `llm-cli` project.

## When to Use Copilot

Copilot is particularly useful in the following scenarios:

*   **Complex Error Messages**: When encountering cryptic error messages (e.g., `RollupError`, `TypeError` from mocked modules, deep stack traces) that are difficult to decipher manually.
*   **Stuck on a Problem**: When traditional debugging methods (console logs, stepping through code) are not yielding results, and you need fresh perspectives or alternative solutions.
*   **Refactoring Suggestions**: To get ideas for improving code structure, readability, or performance, especially during refactoring tasks.
*   **Understanding Unfamiliar Code**: To quickly grasp the purpose or behavior of code you haven't written or are not familiar with.
*   **Syntax and Idiom Assistance**: For quick reminders on specific language syntax, API usage, or idiomatic patterns.

## How to Use Copilot Effectively

To get the most out of Copilot, consider the following:

1.  **Be Specific with Your Prompts**: Clearly describe the problem, including the exact error message, relevant code snippets, and what you've already tried.
    *   **Example Prompt for an Error**: "I'm getting a `TypeError: default.existsSync.mockClear is not a function` in my Vitest unit test. Here's my mock setup for `fs`: `vi.mock('fs', () => ({ existsSync: vi.fn() }))`. How can I correctly mock `fs` named exports so `mockClear` works?"
    *   **Example Prompt for Refactoring**: "This `add` command's `action` function is too long. Suggest ways to break it down into smaller, testable units, keeping in mind it handles both single commands and config files."

2.  **Provide Context**: Include relevant code, test files, or configuration snippets directly in your prompt or ensure Copilot has access to them in your editor.

3.  **Iterate and Refine**: Copilot's first suggestion might not be perfect. Refine your prompt, ask follow-up questions, or provide additional constraints to guide it towards a better solution.

4.  **Verify Suggestions**: Always critically evaluate Copilot's suggestions. Test the proposed solutions thoroughly to ensure they work as expected and don't introduce new issues.

5.  **Document Learnings**: If Copilot helps you solve a particularly tricky problem, consider documenting the solution and the process in the project's knowledge base (e.g., in `docs/gemini/` or `docs/troubleshooting.md`) for future reference.

## Example Interaction (Hypothetical)

**User**: "My Vitest mock for `fs` is failing with `TypeError: default.existsSync.mockClear is not a function`."

**Copilot Suggestion**: "This error usually means you're trying to access `existsSync` as a default export, but `fs` has named exports. Try modifying your mock like this: `vi.mock('fs', async () => { const actual = await vi.importActual('fs'); return { ...actual, existsSync: vi.fn(), lstatSync: vi.fn() }; });` This ensures you're mocking the named exports correctly."

By following these guidelines, you can effectively leverage GitHub Copilot to enhance your debugging process and improve code quality within the `llm-cli` project.
