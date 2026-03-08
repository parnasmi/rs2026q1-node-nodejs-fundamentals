import path from "path";
import fs from "fs/promises";
import { createReadStream } from "fs";
import { createHash } from "crypto";
import { fileURLToPath } from "url";

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

  const checksums = JSON.parse(await fs.readFile(checksumsPath, "utf8"));

  const calculateHash = (filePath) => {
    return new Promise((resolve, reject) => {
      const hash = createHash("sha256");
      const stream = createReadStream(filePath);
      stream.on("data", (data) => hash.update(data));
      stream.on("end", () => resolve(hash.digest("hex")));
      stream.on("error", (err) => reject(err));
    });
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
