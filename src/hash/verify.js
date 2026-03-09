import path from "path";
import fs from "fs/promises";
import { createReadStream } from "fs";
import { createHash } from "crypto";
import { fileURLToPath } from "url";
import { pipeline } from "stream/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const verify = async () => {
  const filesDir = path.resolve(__dirname, "files");
  const checksumsPath = path.resolve(filesDir, "checksums.json");

  try {
    await fs.access(checksumsPath);
  } catch {
    throw new Error("FS operation failed");
  }

  const checksumsContent = await fs.readFile(checksumsPath, "utf8");
  const checksums = JSON.parse(checksumsContent);

  const calculateHash = async (filePath) => {
    const hash = createHash("sha256");
    await pipeline(createReadStream(filePath), hash);
    return hash.digest("hex");
  };

  for (const [fileName, expectedHash] of Object.entries(checksums)) {
    const filePath = path.join(filesDir, fileName);
    try {
      const actualHash = await calculateHash(filePath);
      console.log(
        `${fileName} — ${actualHash === expectedHash ? "OK" : "FAIL"}`,
      );
    } catch {
      console.log(`${fileName} — FAIL`);
    }
  }
};

await verify();
