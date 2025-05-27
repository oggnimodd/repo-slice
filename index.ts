import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import ora from "ora";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const DEFAULT_MODEL_NAME = "gemini-2.0-flash";

async function main() {
  if (!GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is not set in the environment.");
    return;
  }

  const google = createGoogleGenerativeAI({
    apiKey: GEMINI_API_KEY,
  });

  const model = google(DEFAULT_MODEL_NAME);

  const spinner = ora("✨ Generating content...").start();

  try {
    const { text } = await generateText({
      model: model,
      prompt: "Write a short poem about the moon.",
    });
    spinner.succeed("✅ Content generated!");
    console.log(text);
  } catch (error) {
    spinner.fail("❌ Error generating content.");
    console.error("Error generating content:", error);
  }
}

main();
