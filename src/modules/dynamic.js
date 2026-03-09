import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dynamic = async () => {
  const pluginName = process.argv[2];
  if (!pluginName) {
    console.log("Plugin name not provided");
    process.exit(1);
  }

  const pluginPath = path.resolve(__dirname, "plugins", `${pluginName}.js`);

  try {
    const module = await import(pluginPath);
    const result = await module.run();
    console.log(result);
  } catch (err) {
    console.log("Plugin not found");
    process.exit(1);
  }
};

await dynamic();
