import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const restore = async () => {
  const snapshotPath = path.resolve(__dirname, "files", "snapshot.json");
  const restoredPath = path.resolve(__dirname, "files", "workspace_restored");

  try {
    await fs.access(snapshotPath);
  } catch {
    throw new Error("FS operation failed");
  }

  try {
    await fs.access(restoredPath);
    throw new Error("FS operation failed");
  } catch (err) {
    if (err.message === "FS operation failed") throw err;
  }

  const data = JSON.parse(await fs.readFile(snapshotPath, "utf8"));

  await fs.mkdir(restoredPath);

  for (const entry of data.entries) {
    const targetPath = path.join(restoredPath, entry.path);
    if (entry.type === "directory") {
      await fs.mkdir(targetPath, { recursive: true });
    } else if (entry.type === "file") {
      await fs.mkdir(path.dirname(targetPath), { recursive: true });
      await fs.writeFile(targetPath, Buffer.from(entry.content, "base64"));
    }
  }
};

await restore();
