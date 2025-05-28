export function buildPrompt(
  userRequest: string,
  tree: string,
  concatenatedContent: string
): string {
  return `Given the following repository file tree and concatenated file contents, identify the files most relevant to the user's request.

Repository Tree:
${tree}

Concatenated File Contents:
${concatenatedContent}

User's Request:
${userRequest}

Identify the most relevant file paths.`;
}
