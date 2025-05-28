export function estimateTokenCount(text: string) {
  if (!text || text.length === 0) {
    return 0;
  }

  let tokenCount = 0;
  let i = 0;
  const len = text.length;
  let inAlphanumericSequence = false;

  while (i < len) {
    const char = text[i]!; // Non-null assertion as i is always within bounds

    // Check if character is alphanumeric
    const isAlphanumeric =
      (char >= "a" && char <= "z") ||
      (char >= "A" && char <= "Z") ||
      (char >= "0" && char <= "9");

    // Check if character is whitespace
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
      // Character is non-alphanumeric and non-whitespace (e.g., punctuation)
      // Each such character counts as a new token.
      tokenCount++;
      inAlphanumericSequence = false; // A punctuation mark breaks an alphanumeric sequence
    }
    i++;
  }
  return tokenCount;
}
