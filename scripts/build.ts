import { build } from "bun";
import * as fs from "node:fs/promises";

async function buildCli() {
  console.log("Cleaning up dist folder...");
  try {
    await fs.rm("./dist", { recursive: true, force: true });
    console.log("Dist folder cleaned.");
  } catch (error) {
    console.warn("Could not clean dist folder, it might not exist:", error);
  }

  console.log("Building CLI...");
  await build({
    entrypoints: ["./lib/cli.ts"],
    outdir: "./dist",
    target: "bun",
    sourcemap: "external",
    naming: {
      entry: "repo-slice.js",
    },
  });
  console.log("CLI build complete!");
}

buildCli();
