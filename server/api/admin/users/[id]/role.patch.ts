import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../../../../db/client";
import { user } from "../../../../../db/schema";
import { logAdminAction } from "../../../../services/admin";
import { requireAdminSession } from "../../../../utils/session";

const schema = z.object({
  role: z.enum(["user", "admin"]),
});

export default defineEventHandler(async (event) => {
  const adminSession = await requireAdminSession(event);
  const body = schema.parse(await readBody(event));
  const userId = getRouterParam(event, "id") as string;

  const [updated] = await db
    .update(user)
    .set({
      role: body.role,
      updatedAt: new Date(),
    })
    .where(eq(user.id, userId))
    .returning();

  if (!updated) {
    throw createError({
      statusCode: 404,
      statusMessage: "User not found",
    });
  }

  await logAdminAction({
    actorUserId: adminSession.user.id,
    action: "user.role.update",
    targetType: "user",
    targetId: userId,
    metadata: { role: body.role },
  });

  return {
    user: updated,
  };
});
