import { Worker } from "worker_threads";
import fs from "fs/promises";
import path from "path";
import os from "os";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const kWayMerge = (arrays) => {
  const result = [];
  const pointers = new Array(arrays.length).fill(0);

  while (true) {
    let minVal = Infinity;
    let minIdx = -1;

    for (let i = 0; i < arrays.length; i++) {
      if (pointers[i] < arrays[i].length) {
        if (arrays[i][pointers[i]] < minVal) {
          minVal = arrays[i][pointers[i]];
          minIdx = i;
        }
      }
    }

    if (minIdx === -1) break;

    result.push(minVal);
    pointers[minIdx]++;
  }

  return result;
};

const main = async () => {
  const dataPath = path.resolve(__dirname, "data.json");
  const workerPath = path.resolve(__dirname, "worker.js");

  let data;
  try {
    const content = await fs.readFile(dataPath, "utf8");
    data = JSON.parse(content);
  } catch (err) {
    console.error("Failed to read data.json", err);
    return;
  }

  const numCores = os.cpus().length;
  const chunkSize = Math.ceil(data.length / numCores);
  const workers = [];

  for (let i = 0; i < numCores; i++) {
    const chunk = data.slice(i * chunkSize, (i + 1) * chunkSize);
    if (chunk.length === 0) continue;

    const workerPromise = new Promise((resolve, reject) => {
      const worker = new Worker(workerPath);
      worker.postMessage(chunk);
      worker.on("message", (sortedChunk) => resolve(sortedChunk));
      worker.on("error", reject);
      worker.on("exit", (code) => {
        if (code !== 0)
          reject(new Error(`Worker stopped with exit code ${code}`));
      });
    });
    workers.push(workerPromise);
  }

  const sortedChunks = await Promise.all(workers);
  const finalSortedArray = kWayMerge(sortedChunks);

  console.log(finalSortedArray);
};

await main();
