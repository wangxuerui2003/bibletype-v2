import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Pool } from "pg";

loadEnvFile();

const connectionString =
  process.env.DATABASE_URL ?? "postgres://bibletype:bibletype@localhost:5432/bibletype";

const pool = new Pool({
  connectionString,
});

export function createTestId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now()}`;
}

export async function execute(sql: string, values: unknown[] = []) {
  return pool.query(sql, values);
}

export async function closePool() {
  await pool.end();
}

function loadEnvFile() {
  const envPath = resolve(process.cwd(), ".env");

  if (!existsSync(envPath)) {
    return;
  }

  const contents = readFileSync(envPath, "utf8");

  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}
