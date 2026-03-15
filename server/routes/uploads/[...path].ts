import { createReadStream, existsSync } from "node:fs";
import { join, normalize } from "node:path";

export default defineEventHandler((event) => {
  const path = getRouterParam(event, "path");

  if (!path) {
    throw createError({
      statusCode: 404,
      statusMessage: "Upload not found",
    });
  }

  const relativePath = normalize(Array.isArray(path) ? path.join("/") : path).replace(/^(\.\.[/\\])+/, "");
  const filePath = join(process.cwd(), "storage", "uploads", relativePath);

  if (!existsSync(filePath)) {
    throw createError({
      statusCode: 404,
      statusMessage: "Upload not found",
    });
  }

  return sendStream(event, createReadStream(filePath));
});
