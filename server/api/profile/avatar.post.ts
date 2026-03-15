import { eq } from "drizzle-orm";
import { db } from "../../../db/client";
import { user, userProfiles } from "../../../db/schema";
import { saveAvatar } from "../../../lib/avatar";
import { requireServerSession } from "../../utils/session";

export default defineEventHandler(async (event) => {
  const session = await requireServerSession(event);
  const files = await readMultipartFormData(event);
  const avatar = files?.find((file) => file.name === "avatar");

  if (!avatar?.data || !avatar.filename || !avatar.type) {
    throw createError({
      statusCode: 400,
      statusMessage: "Avatar file is required",
    });
  }

  const stored = await saveAvatar({
    filename: avatar.filename,
    mimeType: avatar.type,
    bytes: avatar.data,
  });

  await db
    .update(user)
    .set({
      image: stored.publicUrl,
      updatedAt: new Date(),
    })
    .where(eq(user.id, session.user.id));

  await db
    .insert(userProfiles)
    .values({
      userId: session.user.id,
      avatarPath: stored.relativePath,
      avatarMimeType: avatar.type,
    })
    .onConflictDoUpdate({
      target: userProfiles.userId,
      set: {
        avatarPath: stored.relativePath,
        avatarMimeType: avatar.type,
        updatedAt: new Date(),
      },
    });

  return {
    image: stored.publicUrl,
  };
});
