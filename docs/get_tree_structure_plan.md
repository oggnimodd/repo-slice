## Detailed Plan for `getTreeStructure` function in `lib/tree.ts`

**Goal:** Implement a `getTreeStructure` function that executes the `tree` CLI command, respects `.gitignore` files, explicitly excludes the `.git` directory, and returns the formatted directory tree as a string.

### Steps:

1.  **Define the `getTreeStructure` function signature:**
    *   The function will be an `async` function named `getTreeStructure`.
    *   It will accept an optional argument: `directoryPath: string = '.'` (defaulting to the current directory).
    *   It will return `Promise<string>`.

2.  **Construct the `tree` command arguments:**
    *   The base command will be `tree`.
    *   Include the `-a` flag to show all files (including hidden ones).
    *   Include the `--gitignore` flag to automatically ignore files and directories specified in `.gitignore` files.
    *   Include the `-I` flag with the pattern `".git"` to explicitly ignore the `.git` directory.
    *   Example command array: `['tree', '-a', '--gitignore', '-I', '.git', directoryPath]`

3.  **Execute the `tree` command using `Bun.spawn`:**
    *   Use `Bun.spawn` to execute the constructed command.
    *   Capture the standard output (`stdout`) of the `tree` process.

4.  **Handle potential errors:**
    *   Check the `proc.exitCode` after `await proc.exited`. If it's non-zero, it indicates an error (e.g., `tree` not installed, invalid path).
    *   Log any errors from `proc.stderr`.
    *   If `tree` is not found, provide a user-friendly message suggesting its installation.

5.  **Return the captured `stdout` as a string.**

### Mermaid Diagram:

```mermaid
graph TD
    A[Start] --> B{`getTreeStructure(directoryPath: string = '.')`};
    B --> C[Construct `tree` command arguments with `--gitignore` and `-I .git`];
    C --> D[Execute `Bun.spawn(['tree', '-a', '--gitignore', '-I', '.git', directoryPath])`];
    D --> E{Await process exit};
    E --> F{Check `proc.exitCode`};
    F -- Non-zero --> G[Log error from `proc.stderr` and handle `tree` not found];
    F -- Zero --> H[Return `proc.stdout` as string];
    G --> I[End];
    H --> I;
```

### Bun API Considerations:

*   `Bun.spawn()`: For executing external commands like `tree`. This is the recommended way to interact with the shell in Bun.