export async function getTreeStructure(directoryPath: string = ".") {
  try {
    const proc = Bun.spawn(
      ["tree", "-a", "--gitignore", "-I", ".git", directoryPath],
      {
        stdout: "pipe",
        stderr: "pipe",
      }
    );

    const stdout = await new Response(proc.stdout).text();
    const stderr = await new Response(proc.stderr).text();

    await proc.exited;

    if (proc.exitCode !== 0) {
      if (
        stderr.includes("command not found") ||
        stderr.includes("No such file or directory")
      ) {
        console.error(
          `Error: 'tree' command not found. Please install it (e.g., 'sudo apt-get install tree' on Debian/Ubuntu, 'brew install tree' on macOS).`
        );
      } else {
        console.error(`'tree' command exited with code ${proc.exitCode}`);
        console.error(stderr);
      }
      throw new Error(`Failed to get tree structure for ${directoryPath}`);
    }

    return stdout;
  } catch (error) {
    console.error(
      `An unexpected error occurred while getting tree structure for ${directoryPath}:`,
      error
    );
    throw error;
  }
}
