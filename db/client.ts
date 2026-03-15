import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { loadLocalEnv } from "../lib/load-local-env";
import * as schema from "./schema";

loadLocalEnv();

const connectionString =
  process.env.DATABASE_URL ?? "postgres://bibletype:bibletype@localhost:5432/bibletype";

export const pool = new Pool({
  connectionString,
});

export const db = drizzle(pool, { schema });
