import { createReadStream, createWriteStream } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import readline from "readline";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const split = async () => {
  const linesIndex = process.argv.indexOf("--lines");
  const maxLines =
    linesIndex !== -1 ? parseInt(process.argv[linesIndex + 1], 10) || 10 : 10;

  const sourcePath = path.resolve(__dirname, "source.txt");
  const rl = readline.createInterface({
    input: createReadStream(sourcePath),
    terminal: false,
  });

  let chunkId = 1;
  let lineCount = 0;
  let writeStream = null;

  for await (const line of rl) {
    if (!writeStream || lineCount >= maxLines) {
      if (writeStream) {
        writeStream.end();
      }
      const chunkPath = path.resolve(__dirname, `chunk_${chunkId}.txt`);
      writeStream = createWriteStream(chunkPath);
      chunkId++;
      lineCount = 0;
    }

    writeStream.write(line + "\n");
    lineCount++;
  }

  if (writeStream) {
    writeStream.end();
  }
};

await split();
