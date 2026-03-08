import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const merge = async () => {
  const workspacePath = path.resolve(__dirname, "files", "workspace");
  const partsPath = path.resolve(workspacePath, "parts");
  const outputPath = path.resolve(workspacePath, "merged.txt");

  try {
    await fs.access(partsPath);
  } catch {
    throw new Error("FS operation failed");
  }

  let filesToMerge = [];
  const filesArgIndex = process.argv.indexOf("--files");

  if (filesArgIndex !== -1 && process.argv[filesArgIndex + 1]) {
    filesToMerge = process.argv[filesArgIndex + 1].split(",");
  } else {
    try {
      const allFiles = await fs.readdir(partsPath);
      filesToMerge = allFiles
        .filter((file) => path.extname(file) === ".txt")
        .sort();

      if (filesToMerge.length === 0) {
        throw new Error("FS operation failed");
      }
    } catch {
      throw new Error("FS operation failed");
    }
  }

  let mergedContent = "";
  for (const fileName of filesToMerge) {
    const filePath = path.join(partsPath, fileName);
    try {
      const content = await fs.readFile(filePath, "utf8");
      mergedContent += content;
    } catch {
      throw new Error("FS operation failed");
    }
  }

  await fs.writeFile(outputPath, mergedContent);
};

await merge();
