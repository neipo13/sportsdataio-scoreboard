import { readdirSync, mkdirSync, existsSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import openapiTS, { astToString, COMMENT_HEADER } from "openapi-typescript";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const SPECS_DIR = resolve(ROOT, "specs");
const OUT_DIR = resolve(ROOT, "src", "sdk", "generated");

async function main() {
  if (!existsSync(SPECS_DIR)) {
    console.error("specs/ directory not found. Run `npm run sdk:download` first.");
    process.exit(1);
  }

  const specFiles = readdirSync(SPECS_DIR).filter((f) => f.endsWith(".json"));
  if (specFiles.length === 0) {
    console.error("No .json files found in specs/. Run `npm run sdk:download` first.");
    process.exit(1);
  }

  mkdirSync(OUT_DIR, { recursive: true });

  console.log(`Generating types for ${specFiles.length} specs...\n`);

  for (const file of specFiles) {
    const sport = file.replace(".json", "");
    const specPath = resolve(SPECS_DIR, file);
    const outPath = resolve(OUT_DIR, `${sport}.d.ts`);

    console.log(`  Generating ${sport}.d.ts...`);
    try {
      const ast = await openapiTS(new URL(`file://${specPath.replace(/\\/g, "/")}`));
      const source = COMMENT_HEADER + astToString(ast);
      writeFileSync(outPath, source, "utf-8");
      console.log(`  ✓ ${sport}.d.ts`);
    } catch (err) {
      console.error(`  ✗ ${sport}: ${err}`);
    }
  }

  console.log("\nDone.");
}

main();
