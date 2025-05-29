# repo-slice

`repo-slice` is a command-line interface (CLI) tool designed to help developers quickly identify and extract relevant files from a repository based on a natural language prompt. It leverages AI to analyze your project's structure and content, making it easier to focus on the files you need.

## Features

-   **AI-Powered File Identification**: Uses Google Gemini to find files relevant to your specific request.
-   **AI Model Selection**: Select the AI model using the `-m, --model <alias>` option (e.g., `bun run cli -m 2.5`). Supported aliases are "2" for `gemini-2.0-flash-001` and "2.5" for `gemini-2.5-flash-preview-05-20`.
-   **Flexible Output**: Copy file contents or paths in various formats (JSON, `@file` format, newline-separated) directly to your clipboard.
-   **Prompt Token Limit Enforcement**: Estimates the prompt's token count and aborts the AI call if it exceeds `MAX_AI_TOKENS` (currently 1,000,000 tokens) to prevent excessive usage.
-   **File Refinement**: After initial file identification, refine the list of relevant files by providing comments (e.g., "exclude these folders", "include these files").
-   **AI Response Modes**: When copying file content to the clipboard, choose between "Diff Mode" (AI responds with diffs) and "Normal Mode" (AI responds freely).

## Installation

To install `repo-slice`, ensure you have [Bun](https://bun.sh/) installed. Then, clone the repository and install dependencies:

```bash
git clone <repository-url>
cd repo-slice
bun install
```

You will also need to set your `GEMINI_API_KEY` environment variable.

```bash
export GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
```

## Usage

Run the tool from your project's root directory:

```bash
bun run cli
```

You will be prompted to enter your request. You can also specify the AI model:
```bash
bun run cli -m 2.5
```
After the AI identifies relevant files, refine the list by providing additional comments (e.g., "exclude these folders", "include these files"). When copying file content to your clipboard, choose between "Diff Mode" (AI responds with diffs) and "Normal Mode" (AI responds freely).

## Development Guide

### Building the Project
To build the project, run:
```bash
bun run build
```

### Local Installation
To install the built CLI tool locally (e.g., to `~/bin/repo-slice`), run:
```bash
bun run install
```
This command builds the project and attempts to copy the executable to `~/bin/repo-slice`.
