#!/usr/bin/env bun
import { Command } from "commander";
import inquirer from "inquirer";
import { getTreeStructure } from "./tree";
import { callAI } from "./ai";
import { buildPrompt, buildRefinementPrompt } from "./prompt";
import {
  copyFileContentsToClipboard,
  copyFilePathsAsJson,
  copyFilePathsAsAtFileFormat,
  copyFilePathsAsNewlineSeparated,
} from "./copy";
import {
  ALLOWED_TEXT_FILE_EXTENSIONS,
  MAX_FILE_LINES,
  MAX_FILE_SIZE_BYTES,
  EXCLUDED_FILE_PATTERNS,
  MAX_AI_TOKENS, // Add MAX_AI_TOKENS import
  ALLOWED_MODELS, // Import ALLOWED_MODELS
  DEFAULT_MODEL_ALIAS, // Import DEFAULT_MODEL_ALIAS
  DEFAULT_MODEL_NAME, // Import DEFAULT_MODEL_NAME
} from "./constants";
import { estimateTokenCount } from "./utils"; // Import estimateTokenCount
import path, { join } from "path";
import { readdir, stat } from "fs/promises";

const program = new Command();

program
  .name("repo-slice")
  .description(
    "CLI tool to analyze repository structure and identify relevant files"
  )
  .version("1.0.0")
  .option("-m, --model <alias>", "Select the AI model to use (2 or 2.5)");

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
    const options = program.opts();

    let selectedModelName = DEFAULT_MODEL_NAME;
    if (options.model) {
      const modelAlias = options.model;
      if (ALLOWED_MODELS[modelAlias]) {
        selectedModelName = ALLOWED_MODELS[modelAlias];
        console.log(`Using AI model: ${selectedModelName}`);
      } else {
        console.error(
          `Error: Invalid model alias '${modelAlias}'. Allowed aliases are: ${Object.keys(ALLOWED_MODELS).join(", ")}`
        );
        return;
      }
    } else {
      console.log(
        `No model specified, using default AI model: ${selectedModelName}`
      );
    }

    console.log("Analyzing repository structure...");
    const tree = await getTreeStructure();
    const concatenatedContent = await getConcatenatedFileContent(".");

    const fullPrompt = buildPrompt(userPrompt, tree, concatenatedContent);

    const promptTokenCount = estimateTokenCount(fullPrompt);
    console.log(`Estimated token count for AI prompt: ${promptTokenCount}`);

    if (promptTokenCount >= MAX_AI_TOKENS) {
      console.error(
        `Error: The prompt's estimated token count (${promptTokenCount}) exceeds the maximum allowed (${MAX_AI_TOKENS}). Aborting AI call.`
      );
      return; // Exit the action if token count is too high
    }

    const aiResponse = await callAI(fullPrompt, selectedModelName as string);

    let relevantFiles: string[] = aiResponse.relevant_files;
    console.log("Relevant files:");
    relevantFiles.forEach((file: string) => console.log(`- ${file}`));

    let continueLoop = true;
    while (continueLoop) {
      const copyAnswers = await inquirer.prompt([
        {
          type: "list",
          name: "copyOption",
          message: "How would you like to copy the relevant files?",
          choices: [
            {
              name: "Copy all file content to clipboard",
              value: "content",
            },
            {
              name: "Copy relevant file paths as JSON array",
              value: "json",
            },
            {
              name: "Copy relevant file paths as @file format (@file1 @file2)",
              value: "at_file",
            },
            {
              name: "Copy relevant file paths as newline-separated list",
              value: "newline",
            },
            {
              name: "Refine relevant files (add/remove files based on comments)",
              value: "refine",
            },
            {
              name: "Exit",
              value: "exit",
            },
          ],
        },
      ]);

      switch (copyAnswers.copyOption) {
        case "content":
          const modeAnswers = await inquirer.prompt([
            {
              type: "list",
              name: "aiResponseMode",
              message: "Select AI response mode:",
              choices: [
                { name: "Diff Mode (AI responds with diffs)", value: "diff" },
                { name: "Normal Mode (AI responds freely)", value: "normal" },
              ],
            },
          ]);
          const aiResponseMode = modeAnswers.aiResponseMode;
          await copyFileContentsToClipboard(
            relevantFiles,
            userPrompt,
            tree,
            aiResponseMode
          );
          console.log("All relevant file contents copied to clipboard!");
          continueLoop = false;
          break;
        case "json":
          await copyFilePathsAsJson(relevantFiles);
          console.log("Relevant file paths (JSON) copied to clipboard!");
          continueLoop = false;
          break;
        case "at_file":
          await copyFilePathsAsAtFileFormat(relevantFiles);
          console.log(
            "Relevant file paths (@file format) copied to clipboard!"
          );
          continueLoop = false;
          break;
        case "newline":
          await copyFilePathsAsNewlineSeparated(relevantFiles);
          console.log(
            "Relevant file paths (newline-separated) copied to clipboard!"
          );
          continueLoop = false;
          break;
        case "refine":
          const commentAnswer = await inquirer.prompt([
            {
              type: "input",
              name: "comments",
              message:
                "Please enter your comments to refine the file list (e.g., 'exclude these folders', 'include these files'):",
            },
          ]);
          const userComments = commentAnswer.comments;

          console.log("Refining relevant files based on your comments...");
          const refinementPrompt = buildRefinementPrompt(
            fullPrompt, // Pass the full initial prompt for context
            relevantFiles,
            userComments
          );
          const refinedResponse = await callAI(
            refinementPrompt,
            selectedModelName as string
          );
          relevantFiles = refinedResponse.relevant_files;
          console.log("Refined relevant files:");
          relevantFiles.forEach((file: string) => console.log(`- ${file}`));
          // Loop continues to allow further refinement or copy action
          break;
        case "exit":
          console.log("Exiting without copying files.");
          continueLoop = false;
          break;
      }
    }
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
