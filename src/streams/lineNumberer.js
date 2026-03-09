import { Transform, pipeline } from "stream";

const lineNumberer = () => {
  let lineCount = 0;
  let remaining = "";

  const transformStream = new Transform({
    transform(chunk, encoding, callback) {
      const data = remaining + chunk.toString();
      const lines = data.split(/\r?\n/);
      remaining = lines.pop();

      for (const line of lines) {
        lineCount++;
        this.push(`${lineCount} | ${line}\n`);
      }
      callback();
    },
    flush(callback) {
      if (remaining) {
        lineCount++;
        this.push(`${lineCount} | ${remaining}\n`);
      }
      callback();
    },
  });

  pipeline(process.stdin, transformStream, process.stdout, (err) => {
    if (err) {
      console.error("Pipeline failed", err);
    }
  });
};

lineNumberer();
