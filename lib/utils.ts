export function estimateTokenCount(text: string) {
  if (!text || text.length === 0) {
    return 0;
  }

  let tokenCount = 0;
  let i = 0;
  const len = text.length;
  let inAlphanumericSequence = false;

  while (i < len) {
    const char = text[i]!;

    const isAlphanumeric =
      (char >= "a" && char <= "z") ||
      (char >= "A" && char <= "Z") ||
      (char >= "0" && char <= "9");

    const isWhitespace =
      char === " " || char === "\n" || char === "\r" || char === "\t";

    if (isAlphanumeric) {
      if (!inAlphanumericSequence) {
        tokenCount++;
        inAlphanumericSequence = true;
      }
    } else if (isWhitespace) {
      inAlphanumericSequence = false;
    } else {
      tokenCount++;
      inAlphanumericSequence = false;
    }
    i++;
  }
  return tokenCount;
}
