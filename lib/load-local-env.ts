import { existsSync } from "node:fs";
import { resolve } from "node:path";

let loaded = false;

export function loadLocalEnv() {
  if (loaded) {
    return;
  }

  loaded = true;

  const envPath = resolve(process.cwd(), ".env");
  const processWithLoader = process as typeof process & {
    loadEnvFile?: (path?: string) => void;
  };

  if (!existsSync(envPath) || typeof processWithLoader.loadEnvFile !== "function") {
    return;
  }

  processWithLoader.loadEnvFile(envPath);
}
