# Detailed Plan for `copy` function in `lib/copy.ts`

**Goal:** Implement a `copy` function that accepts an array of file paths, reads and processes their content (excluding files not in the allowed text file extensions list), and copies the concatenated result to the system clipboard using `xclip`.

## Steps:

1.  **Define the `copy` function signature:**
    *   The function will be an `async` function named `copy` that accepts a single argument: `filePaths: string[]`.
    *   It will return `Promise<void>`.

2.  **Define a constant for allowed text file extensions:**
    *   Create a `const` named `ALLOWED_TEXT_FILE_EXTENSIONS` (or similar) that is an array of strings, e.g., `['.ts', '.js', '.py', '.rs', '.go', '.json', '.md', '.txt', '.css', '.html', '.xml', '.yml', '.yaml', '.sh', '.bash', '.zsh', '.env']`. This list can be expanded as needed.

3.  **Initialize an empty array to store processed file contents:**
    *   This array will hold the formatted strings for each file before concatenation.

4.  **Iterate through each `filePath` in the `filePaths` array:**
    *   For each `filePath`:
        *   **Determine file type based on extension:**
            *   Extract the file extension from `filePath`.
            *   Check if the extracted extension is present in the `ALLOWED_TEXT_FILE_EXTENSIONS` constant.
        *   **Process content based on file type:**
            *   **If the file extension is NOT in `ALLOWED_TEXT_FILE_EXTENSIONS` (treat as binary/unsupported text):**
                *   Append the `filePath` directly to the processed content array (e.g., `processedContents.push(filePath)`).
            *   **If the file extension IS in `ALLOWED_TEXT_FILE_EXTENSIONS` (treat as text file):**
                *   Read the file content using `await Bun.file(filePath).text()`.
                *   Remove line breaks from the content: `content.replace(/[\r\n]+/g, ' ')`. This replaces one or more line breaks with a single space.
                *   Prepend the file path to the content: `const formattedContent = `<${filePath}> ${cleanedContent}`;`
                *   Append `formattedContent` to the `processedContents` array.

5.  **Concatenate all processed contents:**
    *   Join the elements of the `processedContents` array into a single string: `const finalContent = processedContents.join(' ');`.

6.  **Copy `finalContent` to clipboard using `xclip`:**
    *   Use `Bun.spawn` to execute the `xclip` command.
    *   The command will be `xclip -selection clipboard`.
    *   Pipe the `finalContent` to the standard input of the `xclip` process.
    *   Include error handling for cases where `xclip` might not be installed or the command fails.

## Mermaid Diagram:

```mermaid
graph TD
    A[Start] --> B{`copy(filePaths: string[])`};
    B --> C[Define `ALLOWED_TEXT_FILE_EXTENSIONS` constant];
    C --> D[Initialize `processedContents = []`];
    D --> E{For each `filePath` in `filePaths`};
    E --> F{Get `fileExtension` from `filePath`};
    F --> G{Is `fileExtension` in `ALLOWED_TEXT_FILE_EXTENSIONS`?};
    G -- No --> H[Add `filePath` to `processedContents`];
    G -- Yes --> I[Read `fileContent = await Bun.file(filePath).text()`];
    I --> J[Remove linebreaks from `fileContent`];
    J --> K[Format: `"<filePath> " + cleanedContent`];
    K --> L[Add formatted content to `processedContents`];
    H --> E;
    L --> E;
    E -- All files processed --> M[Join `processedContents` into `finalContent`];
    M --> N[Execute `Bun.spawn(['xclip', '-selection', 'clipboard'], { stdin: finalContent })`];
    N --> O[Handle `xclip` errors];
    O --> P[End];
```

## Bun API Considerations:

*   `Bun.file(path)`: Efficiently reads file content.
*   `Bun.spawn()`: For executing external commands like `xclip`. This is the recommended way to interact with the shell in Bun.