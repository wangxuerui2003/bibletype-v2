import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./db/schema/**/*.ts",
  out: "./db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgres://bibletype:bibletype@localhost:5432/bibletype",
  },
});
