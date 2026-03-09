import path from "path";
import fs from "fs/promises";
import { createReadStream } from "fs";
import { pipeline } from "stream/promises";
import { createBrotliDecompress } from "zlib";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const decompressDir = async () => {
  const filesDir = path.resolve(__dirname, "files");
  const workspacePath = path.resolve(filesDir, "workspace");
  const compressedDir = path.resolve(workspacePath, "compressed");
  const archivePath = path.resolve(compressedDir, "archive.br");
  const decompressedPath = path.resolve(workspacePath, "decompressed");

  try {
    await fs.access(compressedDir);
    await fs.access(archivePath);
  } catch {
    throw new Error("FS operation failed");
  }

  let decompressChunks = [];
  const brotli = createBrotliDecompress();
  const sourceStream = createReadStream(archivePath);

  await pipeline(sourceStream, brotli, async function* (source) {
    for await (const chunk of source) {
      decompressChunks.push(chunk);
    }
  });

  const archiveData = Buffer.concat(decompressChunks).toString();
  const entries = JSON.parse(archiveData);

  await fs.mkdir(decompressedPath, { recursive: true });

  for (const entry of entries) {
    const targetPath = path.join(decompressedPath, entry.path);
    if (entry.type === "directory") {
      await fs.mkdir(targetPath, { recursive: true });
    } else if (entry.type === "file") {
      await fs.mkdir(path.dirname(targetPath), { recursive: true });
      await fs.writeFile(targetPath, Buffer.from(entry.content, "base64"));
    }
  }
};

await decompressDir();
