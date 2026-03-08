import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const snapshot = async () => {
  const workspacePath = path.resolve(__dirname, "files", "workspace");
  const snapshotPath = path.resolve(__dirname, "files", "snapshot.json");

  try {
    await fs.access(workspacePath);
  } catch {
    throw new Error("FS operation failed");
  }

  const entries = [];

  async function scan(currentPath) {
    const items = await fs.readdir(currentPath, { withFileTypes: true });
    items.sort((a, b) => a.name.localeCompare(b.name));

    for (const item of items) {
      const absolutePath = path.join(currentPath, item.name);
      const relativePath = path.relative(workspacePath, absolutePath);

      if (item.isDirectory()) {
        entries.push({
          path: relativePath,
          type: "directory",
        });
        await scan(absolutePath);
      } else if (item.isFile()) {
        const stats = await fs.stat(absolutePath);
        const content = await fs.readFile(absolutePath);
        entries.push({
          path: relativePath,
          type: "file",
          size: stats.size,
          content: content.toString("base64"),
        });
      }
    }
  }

  await scan(workspacePath);

  const result = {
    rootPath: workspacePath,
    entries: entries,
  };

  await fs.writeFile(snapshotPath, JSON.stringify(result, null, 2));
};

await snapshot();
