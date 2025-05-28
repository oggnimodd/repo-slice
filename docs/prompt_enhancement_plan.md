# Plan: Enhance Prompt Building and Copying in `repo-slice`

## Objective

Enhance the `repo-slice` application to improve how prompts are built and copied, specifically for interacting with AI models.

## Requirements

1.  **Enhanced Final Copied Prompt Structure**: When the user selects "Copy all file content to clipboard", the copied content should include:
    *   The user's initial prompt.
    *   The repository tree structure.
    *   The relevant file contents (flattened, i.e., newlines replaced with spaces).
    *   The desired order for these elements in the final copied version is: User Prompt, then Repository Tree, then Relevant File Contents.

2.  **AI Response Modes**: Introduce two modes for the AI's expected response:
    *   **Diff Mode**: The AI should be instructed to respond only with diffs.
    *   **Normal Mode**: The AI can respond freely.
    *   The user will be prompted to select a mode *after* choosing "Copy all file content to clipboard".
    *   The selected mode will influence the instructions given to the AI in the final copied content.

## Detailed Plan

The implementation will involve modifications to [`lib/cli.ts`](lib/cli.ts) and [`lib/copy.ts`](lib/copy.ts) to accommodate the new prompt structure and AI response modes.

### Step 1: Modify [`lib/cli.ts`](lib/cli.ts)

*   **Goal**: Introduce a new prompt for AI response mode selection after the "Copy all file content to clipboard" option is chosen. Pass the selected mode, the `userPrompt`, and the `tree` to the `copyFileContentsToClipboard` function.
*   **Changes**:
    *   Within the `case "content":` block of the `switch (copyAnswers.copyOption)` statement, add a new `inquirer.prompt` to ask the user to select between "Diff Mode" and "Normal Mode".
    *   Modify the call to `copyFileContentsToClipboard` to include `userPrompt`, `tree`, and the selected `aiResponseMode` as arguments.

### Step 2: Modify [`lib/copy.ts`](lib/copy.ts)

*   **Goal**: Update `copyFileContentsToClipboard` to accept the user's initial prompt, the repository tree, and the selected AI response mode. Construct the final clipboard content in the specified order and include mode-specific instructions.
*   **Changes**:
    *   Update the `copyFileContentsToClipboard` function signature to accept `userPrompt: string`, `tree: string`, and `aiResponseMode: string`.
    *   Modify the `finalContent` assembly within `copyFileContentsToClipboard`. It should now concatenate:
        1.  A header indicating the AI response mode (e.g., "AI Response Mode: Diff" or "AI Response Mode: Normal").
        2.  Instructions for the AI based on the selected mode (e.g., "Please respond only with diffs." for Diff Mode).
        3.  The `userPrompt`.
        4.  The `tree` structure.
        5.  The `processedContents` (relevant file contents, which are already flattened).
    *   Ensure the `cleanedContent` logic (replacing newlines with spaces) remains as is, as confirmed by the user.

### Step 3: [`lib/prompt.ts`](lib/prompt.ts) (No direct changes)

*   **Note**: The `buildPrompt` function in [`lib/prompt.ts`](lib/prompt.ts) is used to build the prompt *for the AI to identify relevant files*. The new requirement is about building the *final content to be copied to the clipboard for the AI to act upon*. These are two distinct prompt-building processes. To avoid confusion, the new logic for the final clipboard content will be handled within [`lib/copy.ts`](lib/copy.ts), and `buildPrompt` will remain unchanged, serving its original purpose.

## Diagram of the Flow

```mermaid
graph TD
    A[User runs repo-slice] --> B{Enter Prompt?};
    B --> C[Get Tree Structure];
    C --> D[Get Concatenated File Content];
    D --> E[Build Initial AI Prompt (for file identification)];
    E --> F[Call AI for Relevant Files];
    F --> G[Display Relevant Files];
    G --> H{How to copy relevant files?};
    H -- "Copy all file content to clipboard" --> I{Select AI Response Mode?};
    I -- "Diff Mode" --> J[Construct Final Clipboard Content (Diff Mode)];
    I -- "Normal Mode" --> K[Construct Final Clipboard Content (Normal Mode)];
    J --> L[Copy to Clipboard];
    K --> L;
    H -- Other options --> M[Copy File Paths (JSON/At-file/Newline)];
    M --> L;
    L --> N[Display Success Message];