# Detailed Plan for the CLI Tool

The CLI tool will be named `repo-slice` (or similar, based on the current project name). It will perform the following steps:

## 1. Initialize and Get User Prompt

*   **Current Directory Awareness**: The CLI will automatically determine the current working directory using `process.cwd()`. This will be the base for all file operations.
*   **User Input**: The tool will use the `inquirer` library to prompt the user for their request or prompt. This input will be crucial for the AI model to understand the user's intent.

## 2. Traverse Repository and Prepare Context

*   **File Tree Generation**: The existing `getTreeStructure` function from `lib/tree.ts` will be utilized to generate the repository's file tree. This function already leverages the `tree` command with `--gitignore` and `-I .git`, which is a good starting point for respecting version control exclusions.
*   **File Filtering**:
    *   **Extension and Basename Filtering**: Files will be filtered based on `ALLOWED_TEXT_FILE_EXTENSIONS` from `lib/constants.ts` to ensure only readable text files are considered.
    *   **Excluding Lock Files**: Specific `.lock` files (e.g., `package-lock.json`, `bun.lockb`, `pnpm-lock.yaml`, `yarn.lock`) will be explicitly excluded from processing.
    *   **Ignoring Large/Useless Files**: A mechanism will be implemented to ignore "big files" and other "useless" files. This will involve:
        *   Defining a maximum file size (e.g., 500KB or 1MB) to prevent reading excessively large files.
        *   Adding common build artifact directories (e.g., `node_modules`, `dist`, `build`) and binary file extensions (e.g., `.zip`, `.tar.gz`, `.jpg`, `.png`, `.pdf`) to an exclusion list.
*   **Content Concatenation**:
    *   For each file that passes the filtering criteria, its content will be read.
    *   A "max lines per file" rule will be applied to truncate very long files. This is critical to manage the overall context size and prevent exceeding the `gemini-2.0-flash` context window.
    *   The file path and its (potentially truncated) content will be formatted into a single string, similar to the `<filePath> content` format seen in `lib/copy.ts`.
    *   All these formatted file contents will be combined into a single, large string. This string will serve as the comprehensive context for the AI model.

## 3. AI Interaction

*   **Model Selection**: The `gemini-2.0-flash` model will be used via the `@ai-sdk/google` library, as specified by you and demonstrated in `index.ts`.
*   **Prompt Engineering**: A carefully constructed prompt will be sent to the AI, including:
    *   The user's original request.
    *   The concatenated repository context (file tree and file contents).
    *   Clear instructions for the AI to identify files most relevant to the user's request based on the provided context.
    *   A strict instruction for the AI to format its response as a JSON array of relevant file paths. For example:
        ```json
        {
          "relevant_files": [
            "src/utils/helper.ts",
            "src/components/Button.tsx",
            "README.md"
          ]
        }
        ```
        This structured format will ensure easy and reliable parsing of the AI's output.

## 4. Parse and Present Results

*   **Parse AI Response**: The CLI will parse the AI's JSON response to extract the list of identified relevant file paths.
*   **Present to User**: The identified relevant files will be displayed to the user in a clear, formatted list within the CLI. This could be a simple bulleted list of file paths, or optionally, include a brief snippet of content from each relevant file for immediate context.

## 5. Error Handling and User Feedback

*   Robust error handling will be implemented for all critical operations, including file system access, AI API calls, and `tree` command execution.
*   Clear feedback will be provided to the user throughout the process, utilizing spinners (e.g., `ora`, as seen in `index.ts`) for long-running operations.

## Mermaid Diagram

```mermaid
graph TD
    A[Start CLI] --> B{Get Current Working Directory};
    B --> C[Prompt User for Request (Inquirer)];
    C --> D[Generate File Tree (lib/tree.ts)];
    D --> E{Filter Files};
    E -- Exclude .lock, big files, non-text --> F[Read & Truncate File Contents];
    F --> G[Concatenate File Paths & Contents];
    G --> H[Construct AI Prompt];
    H --> I[Call Gemini 2.0 Flash (ai-sdk/google)];
    I --> J{Parse AI JSON Response};
    J -- Extract relevant file paths --> K[Present Relevant Files to User];
    K --> L[End CLI];

    subgraph Filtering Rules
        E -- .gitignore --> E;
        E -- Max File Size --> E;
        E -- Exclude Patterns (e.g., node_modules, binaries) --> E;
        E -- ALLOWED_TEXT_FILE_EXTENSIONS --> E;
    end

    subgraph AI Prompt Structure
        H -- User Request --> H;
        H -- Concatenated Context --> H;
        H -- JSON Output Instruction --> H;
    end