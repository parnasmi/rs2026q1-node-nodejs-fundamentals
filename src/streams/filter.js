import { Transform, pipeline } from "stream";

const filter = () => {
  const patternIndex = process.argv.indexOf("--pattern");
  const pattern = patternIndex !== -1 ? process.argv[patternIndex + 1] : "";

  if (!pattern) return;

  let remaining = "";

  const transformStream = new Transform({
    transform(chunk, encoding, callback) {
      const data = remaining + chunk.toString();
      const lines = data.split(/\r?\n/);
      remaining = lines.pop();

      for (const line of lines) {
        if (line.includes(pattern)) {
          this.push(line + "\n");
        }
      }
      callback();
    },
    flush(callback) {
      if (remaining && remaining.includes(pattern)) {
        this.push(remaining + "\n");
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

filter();
