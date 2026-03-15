import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../../db/client";
import { user, userProfiles } from "../../../db/schema";
import { requireServerSession } from "../../utils/session";

const schema = z.object({
  name: z.string().min(2).max(60),
  image: z
    .string()
    .refine((value) => value === "" || value.startsWith("/") || /^https?:\/\//.test(value), {
      message: "Image must be a site path or URL",
    })
    .optional(),
  bio: z.string().max(500).default(""),
  autoContinueAfterVerse: z.boolean().default(false),
});

export default defineEventHandler(async (event) => {
  const session = await requireServerSession(event);
  const body = schema.parse(await readBody(event));

  const [updated] = await db
    .update(user)
    .set({
      name: body.name,
      image: body.image || null,
      updatedAt: new Date(),
    })
    .where(eq(user.id, session.user.id))
    .returning({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      image: user.image,
    });

  await db
    .insert(userProfiles)
    .values({
      userId: session.user.id,
      bio: body.bio,
      autoContinueAfterVerse: body.autoContinueAfterVerse,
    })
    .onConflictDoUpdate({
      target: userProfiles.userId,
      set: {
        bio: body.bio,
        autoContinueAfterVerse: body.autoContinueAfterVerse,
        updatedAt: new Date(),
      },
    });

  const profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, session.user.id),
  });

  return { user: updated, profile };
});
