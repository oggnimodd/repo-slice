import type { BunFile } from "bun";
import path from "path";

import { ALLOWED_TEXT_FILE_EXTENSIONS } from "./constants";

export async function copy(filePaths: string[]) {
  const processedContents: string[] = [];

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
        processedContents.push(filePath); // If error, just push the path
      }
    }
  }

  const finalContent = processedContents.join(" ");

  try {
    const proc = Bun.spawn(["xclip", "-selection", "clipboard"], {
      stdin: new TextEncoder().encode(finalContent),
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
