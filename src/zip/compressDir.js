import path from "path";
import fs from "fs/promises";
import { createWriteStream } from "fs";
import { pipeline } from "stream/promises";
import { createBrotliCompress } from "zlib";
import { fileURLToPath } from "url";
import { Readable } from "stream";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compressDir = async () => {
  const filesDir = path.resolve(__dirname, "files");
  const workspacePath = path.resolve(filesDir, "workspace");
  const toCompressPath = path.resolve(workspacePath, "toCompress");
  const compressedDir = path.resolve(workspacePath, "compressed");
  const archivePath = path.resolve(compressedDir, "archive.br");

  try {
    await fs.access(toCompressPath);
  } catch {
    throw new Error("FS operation failed");
  }

  const entries = [];

  async function scan(currentPath) {
    const items = await fs.readdir(currentPath, { withFileTypes: true });
    for (const item of items) {
      const absolutePath = path.join(currentPath, item.name);
      const relativePath = path.relative(toCompressPath, absolutePath);

      if (item.isDirectory()) {
        entries.push({ path: relativePath, type: "directory" });
        await scan(absolutePath);
      } else if (item.isFile()) {
        const content = await fs.readFile(absolutePath);
        entries.push({
          path: relativePath,
          type: "file",
          content: content.toString("base64"),
        });
      }
    }
  }

  await scan(toCompressPath);

  await fs.mkdir(compressedDir, { recursive: true });

  const archiveData = JSON.stringify(entries);
  const sourceStream = Readable.from(archiveData);
  const brotli = createBrotliCompress();
  const destinationStream = createWriteStream(archivePath);

  await pipeline(sourceStream, brotli, destinationStream);
};

await compressDir();
