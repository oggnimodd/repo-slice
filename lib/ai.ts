import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject } from "ai";
import ora from "ora";
import { GEMINI_API_KEY, DEFAULT_MODEL_NAME } from "./constants";
import { z } from "zod";

const relevantFilesSchema = z.object({
  relevant_files: z.array(z.string()),
});

export async function callAI(
  prompt: string
): Promise<z.infer<typeof relevantFilesSchema>> {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set in the environment.");
  }

  const google = createGoogleGenerativeAI({
    apiKey: GEMINI_API_KEY,
  });

  const model = google(DEFAULT_MODEL_NAME);

  const spinner = ora("✨ Asking AI for relevant files...").start();

  try {
    const { object } = await generateObject({
      model: model,
      schema: relevantFilesSchema,
      prompt: prompt,
    });
    spinner.succeed("✅ AI analysis complete!");
    return object;
  } catch (error: unknown) {
    spinner.fail("❌ Error asking AI for relevant files.");
    if (error instanceof Error) {
      throw new Error(`Error generating content: ${error.message}`);
    } else {
      throw new Error("Error generating content: An unknown error occurred.");
    }
  }
}
