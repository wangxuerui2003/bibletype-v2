import { z } from "zod";
import { db } from "../../../db/client";
import { userProfiles } from "../../../db/schema";
import { requireServerSession } from "../../utils/session";

const schema = z.object({
  autoContinueAfterVerse: z.boolean(),
});

export default defineEventHandler(async (event) => {
  const session = await requireServerSession(event);
  const body = schema.parse(await readBody(event));

  const [profile] = await db
    .insert(userProfiles)
    .values({
      userId: session.user.id,
      autoContinueAfterVerse: body.autoContinueAfterVerse,
    })
    .onConflictDoUpdate({
      target: userProfiles.userId,
      set: {
        autoContinueAfterVerse: body.autoContinueAfterVerse,
        updatedAt: new Date(),
      },
    })
    .returning();

  return { profile };
});
