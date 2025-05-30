export const ALLOWED_TEXT_FILE_EXTENSIONS = [
  ".ts",
  ".js",
  ".py",
  ".rs",
  ".go",
  ".json",
  ".md",
  ".txt",
  ".css",
  ".html",
  ".xml",
  ".yml",
  ".yaml",
  ".sh",
  ".bash",
  ".zsh",
  ".env",
  ".toml",
  ".ini",
  ".log",
  ".jsx",
  ".tsx",
  ".vue",
  ".svelte",
  ".java",
  ".c",
  ".cpp",
  ".h",
  ".hpp",
  ".cs",
  ".php",
  ".rb",
  ".pl",
  ".sql",
  ".swift",
  ".kt",
  ".dart",
  ".r",
  ".jl",
  ".ex",
  ".exs",
  ".clj",
  ".scala",
  ".groovy",
  ".coffee",
  ".scss",
  ".less",
  ".jsonc",
  ".prettierrc",
  ".eslintrc",
  ".gitignore",
  ".gitattributes",
  ".npmrc",
  ".nvmrc",
  "Dockerfile",
  "Makefile",
  "LICENSE",
  "README",
];

export const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export const ALLOWED_MODELS: Record<string, string> = {
  "2.5": "gemini-2.5-flash-preview-05-20",
  "2": "gemini-2.0-flash-001",
};

export const DEFAULT_MODEL_ALIAS = "2";
export const DEFAULT_MODEL_NAME = ALLOWED_MODELS[DEFAULT_MODEL_ALIAS];
export const MAX_FILE_LINES = 500;
export const MAX_FILE_SIZE_BYTES = 1 * 1024 * 1024;
export const MAX_AI_TOKENS = 1_000_000;

export const EXCLUDED_FILE_PATTERNS = [
  "package-lock.json",
  "bun.lockb",
  "pnpm-lock.yaml",
  "yarn.lock",
  "node_modules",
  "dist",
  "build",
  ".git",
  ".DS_Store",
  "Thumbs.db",
];
