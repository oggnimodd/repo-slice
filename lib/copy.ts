import type { BunFile } from "bun";
import path from "path";

import { ALLOWED_TEXT_FILE_EXTENSIONS } from "@/constants";
import { estimateTokenCount } from "@/utils";

export async function copyFileContentsToClipboard(
  filePaths: string[],
  userPrompt: string,
  tree: string,
  aiResponseMode: "diff" | "normal"
) {
  const processedContents: string[] = [];

  let modeInstruction = "";
  if (aiResponseMode === "diff") {
    modeInstruction = "Please respond only with diffs.";
  } else {
    modeInstruction = "Please respond freely.";
  }

  const header = `AI Response Mode: ${aiResponseMode === "diff" ? "Diff" : "Normal"}\n${modeInstruction}\n\n`;
  const userPromptSection = `User's Request:\n${userPrompt}\n\n`;
  const treeSection = `Repository Tree:\n${tree}\n\n`;

  for (const filePath of filePaths) {
    const ext = path.extname(filePath).toLowerCase();
    const isAllowed =
      ALLOWED_TEXT_FILE_EXTENSIONS.includes(ext) ||
      ALLOWED_TEXT_FILE_EXTENSIONS.includes(path.basename(filePath));

    if (!isAllowed) {
      processedContents.push(filePath);
    } else {
      try {
        const file: BunFile = Bun.file(filePath);
        const content = await file.text();
        const cleanedContent = content.replace(/[\r\n]+/g, " ");
        const formattedContent = `<${filePath}> ${cleanedContent}`;
        processedContents.push(formattedContent);
      } catch (error) {
        console.error(`Error reading file ${filePath}:`, error);
        processedContents.push(filePath);
      }
    }
  }

  const finalContent = `${header}${userPromptSection}${treeSection}Relevant File Contents:\n${processedContents.join(" ")}`;
  await copyToClipboard(finalContent);

  const finalContentTokenCount = estimateTokenCount(finalContent);
  console.log(
    `Estimated token count for copied content: ${finalContentTokenCount}`
  );
}

async function copyToClipboard(text: string) {
  try {
    const proc = Bun.spawn(["xclip", "-selection", "clipboard"], {
      stdin: new TextEncoder().encode(text),
    });
    await proc.exited;
    if (proc.exitCode !== 0) {
      console.error(`xclip exited with code ${proc.exitCode}`);
      console.error(await new Response(proc.stderr).text());
    }
  } catch (error) {
    console.error(
      "Failed to copy to clipboard using xclip. Is xclip installed?",
      error
    );
  }
}

export async function copyFilePathsAsJson(filePaths: string[]) {
  const jsonContent = JSON.stringify(filePaths, null, 2);
  await copyToClipboard(jsonContent);
}

export async function copyFilePathsAsAtFileFormat(filePaths: string[]) {
  const atFileContent = filePaths.map((p) => `@${p}`).join(" ");
  await copyToClipboard(atFileContent);
}

export async function copyFilePathsAsNewlineSeparated(filePaths: string[]) {
  const newlineContent = filePaths.join("\n");
  await copyToClipboard(newlineContent);
}
