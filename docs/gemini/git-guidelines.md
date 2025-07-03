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