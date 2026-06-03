import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const DIST_DIR = join(import.meta.dir, "..", "dist");
const ASSETS_DIR = join(DIST_DIR, "assets");

const SECRET_PATTERNS = [
  /sk-[a-zA-Z0-9]{20,}/,
  /api[_-]?key[=:]\s*['"][a-zA-Z0-9_-]{16,}['"]/i,
  /eyJ[a-zA-Z0-9_-]{20,}\.[a-zA-Z0-9_-]{20,}\.[a-zA-Z0-9_-]{10,}/,
  /BEGIN\s+(RSA|EC|DSA|OPENSSH)?\s*PRIVATE\s+KEY/,
  /ghp_[a-zA-Z0-9]{36}/,
  /glpat-[a-zA-Z0-9_-]{20,}/,
];

async function scan(): Promise<void> {
  const files = await readdir(ASSETS_DIR).catch(() => [] as string[]);
  let found = false;

  for (const file of files) {
    if (!file.endsWith(".js") && !file.endsWith(".css")) continue;
    const content = await readFile(join(ASSETS_DIR, file), "utf-8");

    for (const pattern of SECRET_PATTERNS) {
      const match = content.match(pattern);
      if (match) {
        console.error(`SECRET FOUND in ${file}: ${match[0].slice(0, 40)}...`);
        found = true;
      }
    }
  }

  if (found) {
    console.error("Bundle contains secrets — aborting.");
    process.exit(1);
  }

  console.log("No secrets found in bundle.");
}

scan();
