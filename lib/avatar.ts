import { mkdir, writeFile } from "node:fs/promises";
import { join, extname } from "node:path";
import { createId } from "./ids";

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export function assertAvatarType(type: string) {
  if (!ALLOWED_MIME_TYPES.has(type)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Unsupported avatar format",
    });
  }
}

export async function saveAvatar({
  filename,
  mimeType,
  bytes,
}: {
  filename: string;
  mimeType: string;
  bytes: Uint8Array;
}) {
  assertAvatarType(mimeType);

  const extension = extname(filename || "avatar.png") || ".png";
  const relativePath = join("avatars", `${createId("avatar")}${extension}`);
  const absoluteDir = join(process.cwd(), "storage", "uploads", "avatars");
  const absolutePath = join(process.cwd(), "storage", "uploads", relativePath);

  await mkdir(absoluteDir, { recursive: true });
  await writeFile(absolutePath, bytes);

  return {
    relativePath,
    publicUrl: `/uploads/${relativePath}`,
  };
}
