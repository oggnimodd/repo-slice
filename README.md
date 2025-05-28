# repo-slice

`repo-slice` is a command-line interface (CLI) tool designed to help developers quickly identify and extract relevant files from a repository based on a natural language prompt. It leverages AI to analyze your project's structure and content, making it easier to focus on the files you need.

## Features

-   **AI-Powered File Identification**: Uses Google Gemini to find files relevant to your specific request.
-   **Flexible Output**: Copy file contents or paths in various formats (JSON, `@file` format, newline-separated) directly to your clipboard.
-   **Token Management**: Estimates prompt token count to prevent exceeding AI model limits.

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

You will be prompted to enter your request. After the AI identifies relevant files, you can choose how to copy the results to your clipboard.
