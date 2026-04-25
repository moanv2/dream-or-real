// Scans frontend/public/freaky_img/ and writes lib/easter-eggs.generated.json
// with a list of public URL paths. Runs as a `predev` / `prebuild` step so
// every dev start and production build has a fresh manifest.

import { readdir, mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SUPPORTED = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp", ".avif"]);

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, "..");
const sourceDir = path.join(projectRoot, "public", "freaky_img");
const outputDir = path.join(projectRoot, "lib");
const outputFile = path.join(outputDir, "easter-eggs.generated.json");

async function main() {
  if (!existsSync(sourceDir)) {
    console.warn(`[easter-eggs] ${sourceDir} does not exist; writing empty manifest.`);
    await mkdir(outputDir, { recursive: true });
    await writeFile(outputFile, JSON.stringify({ images: [] }, null, 2));
    return;
  }

  const entries = await readdir(sourceDir, { withFileTypes: true });
  const images = entries
    .filter((entry) => entry.isFile() && SUPPORTED.has(path.extname(entry.name).toLowerCase()))
    .map((entry) => `/freaky_img/${entry.name}`)
    .sort();

  await mkdir(outputDir, { recursive: true });
  await writeFile(outputFile, JSON.stringify({ images }, null, 2));
  console.log(`[easter-eggs] manifest written: ${images.length} image(s)`);
}

main().catch((err) => {
  console.error("[easter-eggs] failed:", err);
  process.exit(1);
});
