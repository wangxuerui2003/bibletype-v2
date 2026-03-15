import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

const OPENBIBLE_REPO = "https://github.com/openbibleinfo/Bible-Geocoding-Data.git";

export function resolveBibleImportRoot() {
  const envRoot = process.env.BIBLE_IMPORT_ROOT;
  if (envRoot && existsSync(envRoot)) {
    return envRoot;
  }

  const localRoot = join(process.cwd(), "data", "Bible");
  if (existsSync(localRoot)) {
    return localRoot;
  }

  throw new Error(
    "Bible import data not found. Set BIBLE_IMPORT_ROOT or ensure ./data/Bible exists.",
  );
}

export async function ensureOpenBibleDataRoot() {
  const envRoot = process.env.OPENBIBLE_DATA_ROOT;
  if (envRoot && existsSync(envRoot)) {
    return envRoot;
  }

  const targetRoot = join(process.cwd(), ".data", "Bible-Geocoding-Data");

  if (existsSync(targetRoot)) {
    return targetRoot;
  }

  await mkdir(join(process.cwd(), ".data"), { recursive: true });
  execFileSync("git", ["clone", "--depth", "1", OPENBIBLE_REPO, targetRoot], {
    stdio: "inherit",
  });

  return targetRoot;
}
