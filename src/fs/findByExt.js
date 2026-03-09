import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const findByExt = async () => {
  const workspacePath = path.resolve(__dirname, "files", "workspace");

  try {
    await fs.access(workspacePath);
  } catch {
    throw new Error("FS operation failed");
  }

  let ext = ".txt";
  const extIndex = process.argv.indexOf("--ext");
  if (extIndex !== -1 && process.argv[extIndex + 1]) {
    ext = process.argv[extIndex + 1];
    if (!ext.startsWith(".")) {
      ext = "." + ext;
    }
  }

  const files = [];

  async function scan(currentPath) {
    const items = await fs.readdir(currentPath, { withFileTypes: true });
    for (const item of items) {
      const fullPath = path.join(currentPath, item.name);
      if (item.isDirectory()) {
        await scan(fullPath);
      } else if (item.isFile()) {
        if (path.extname(item.name) === ext) {
          files.push(path.relative(workspacePath, fullPath));
        }
      }
    }
  }

  await scan(workspacePath);
  files.sort().forEach((file) => console.log(file));
};

await findByExt();
