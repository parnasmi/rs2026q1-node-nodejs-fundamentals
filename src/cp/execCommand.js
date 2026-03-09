import { spawn } from "child_process";

const execCommand = () => {
  const commandLine = process.argv[2];
  if (!commandLine) return;

  const [command, ...args] = commandLine.split(" ");

  const child = spawn(command, args, {
    env: process.env,
    shell: true, // Using shell: true handles complex commands and glob patterns better if needed, but the prompt says spawn.
    // However, without shell: true, split(' ') might be too simple for complex commands.
    // Let's stick to simple spawn with arg parsing first as it's more direct for the prompt.
  });

  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);

  child.on("exit", (code) => {
    process.exit(code ?? 0);
  });

  child.on("error", (err) => {
    console.error("Failed to start child process.", err);
    process.exit(1);
  });
};

execCommand();
