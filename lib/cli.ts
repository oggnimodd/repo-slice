import { Command } from "commander";
import inquirer from "inquirer";
import { getTreeStructure } from "./tree";
import { callAI } from "./ai";
import { buildPrompt } from "./prompt";
import {
  ALLOWED_TEXT_FILE_EXTENSIONS,
  MAX_FILE_LINES,
  MAX_FILE_SIZE_BYTES,
  EXCLUDED_FILE_PATTERNS,
} from "./constants";
import path, { join } from "path";
import { readdir, stat } from "fs/promises";

const program = new Command();

program
  .name("repo-slice")
  .description(
    "CLI tool to analyze repository structure and identify relevant files"
  )
  .version("1.0.0");

program.action(async () => {
  try {
    const answers = await inquirer.prompt([
      {
        type: "input",
        name: "prompt",
        message: "Please enter your prompt:",
      },
    ]);
    const userPrompt = answers.prompt;

    console.log("Analyzing repository structure...");
    const tree = await getTreeStructure();
    const concatenatedContent = await getConcatenatedFileContent(".");

    const fullPrompt = buildPrompt(userPrompt, tree, concatenatedContent);
    const aiResponse = await callAI(fullPrompt);

    const relevantFiles: string[] = aiResponse.relevant_files; // Directly access relevant_files
    console.log("Relevant files:");
    relevantFiles.forEach((file: string) => console.log(`- ${file}`));
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error analyzing repository:", error.message);
    } else {
      console.error("Error analyzing repository: An unknown error occurred.");
    }
  }
});

async function getConcatenatedFileContent(directoryPath: string) {
  let allContent: string[] = [];
  const files = await getFilesRecursively(directoryPath);

  for (const filePath of files) {
    const ext = path.extname(filePath).toLowerCase();
    const basename = path.basename(filePath);

    const isExcluded = EXCLUDED_FILE_PATTERNS.some(
      (pattern) => filePath.includes(pattern) || basename === pattern
    );

    if (isExcluded) {
      continue;
    }

    const isAllowedTextFile =
      ALLOWED_TEXT_FILE_EXTENSIONS.includes(ext) ||
      ALLOWED_TEXT_FILE_EXTENSIONS.includes(basename);

    if (!isAllowedTextFile) {
      continue;
    }

    try {
      const fileStat = await stat(filePath);
      if (fileStat.size > MAX_FILE_SIZE_BYTES) {
        console.warn(
          `Skipping large file: ${filePath} (${(fileStat.size / (1024 * 1024)).toFixed(2)} MB)`
        );
        continue;
      }

      const file = Bun.file(filePath);
      const content = await file.text();
      const lines = content.split("\n");
      const truncatedContent = lines.slice(0, MAX_FILE_LINES).join("\n");
      allContent.push(`<${filePath}>\n${truncatedContent}\n</${filePath}>`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.warn(`Could not read file ${filePath}: ${error.message}`);
      } else {
        console.warn(
          `Could not read file ${filePath}: An unknown error occurred.`
        );
      }
    }
  }
  return allContent.join("\n\n");
}

async function getFilesRecursively(directory: string) {
  let files: string[] = [];
  const entries = await readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(directory, entry.name);
    if (entry.isDirectory()) {
      if (!EXCLUDED_FILE_PATTERNS.includes(entry.name)) {
        files = files.concat(await getFilesRecursively(fullPath));
      }
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

program.parse(process.argv);
