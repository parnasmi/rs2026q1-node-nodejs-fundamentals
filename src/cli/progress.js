const progress = () => {
  const getArg = (argName, defaultValue) => {
    const index = process.argv.indexOf(argName);
    return index !== -1 && process.argv[index + 1] !== undefined
      ? process.argv[index + 1]
      : defaultValue;
  };

  const duration = parseInt(getArg("--duration", "5000"), 10);
  const interval = parseInt(getArg("--interval", "100"), 10);
  const length = parseInt(getArg("--length", "30"), 10);
  const hexColor = getArg("--color", null);

  let colorCode = "";
  if (hexColor && /^#[0-9A-Fa-f]{6}$/.test(hexColor)) {
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    colorCode = `\x1b[38;2;${r};${g};${b}m`;
  }

  const startTime = Date.now();

  const update = () => {
    const elapsed = Date.now() - startTime;
    const ratio = Math.min(elapsed / duration, 1);
    const percent = Math.floor(ratio * 100);
    const filledCount = Math.floor(ratio * length);
    const emptyCount = length - filledCount;

    const filled = "█".repeat(filledCount);
    const empty = " ".repeat(emptyCount);
    const bar = `${colorCode}${filled}\x1b[0m${empty}`;

    process.stdout.write(`\r[${bar}] ${percent}%`);

    if (ratio < 1) {
      setTimeout(update, interval);
    } else {
      process.stdout.write("\nDone!\n");
    }
  };

  update();
};

progress();
