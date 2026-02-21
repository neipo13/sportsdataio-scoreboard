import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { resolve, dirname, basename } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const SPECS_DIR = resolve(ROOT, "specs");
const DOCS_FILE = resolve(ROOT, "open-api-docs.txt");

async function main() {
  const urls = readFileSync(DOCS_FILE, "utf-8")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  if (!existsSync(SPECS_DIR)) {
    mkdirSync(SPECS_DIR, { recursive: true });
  }

  console.log(`Downloading ${urls.length} OpenAPI specs...\n`);

  const results = await Promise.allSettled(
    urls.map(async (url) => {
      // Derive sport name from URL: "NFL-openapi-3.1.json" → "nfl"
      const filename = basename(url);
      const sport = filename.split("-")[0].toLowerCase();
      const outPath = resolve(SPECS_DIR, `${sport}.json`);

      console.log(`  Fetching ${sport} from ${url}`);
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} for ${url}`);
      }
      const json = await res.text();
      writeFileSync(outPath, json, "utf-8");
      console.log(`  ✓ ${sport}.json saved`);
      return sport;
    })
  );

  const succeeded = results.filter((r) => r.status === "fulfilled");
  const failed = results.filter((r) => r.status === "rejected");

  console.log(`\nDone: ${succeeded.length} succeeded, ${failed.length} failed`);
  if (failed.length > 0) {
    for (const f of failed) {
      if (f.status === "rejected") console.error(`  ✗ ${f.reason}`);
    }
    process.exit(1);
  }
}

main();
