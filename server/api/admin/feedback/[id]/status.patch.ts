import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../../../../db/client";
import { feedback } from "../../../../../db/schema";
import { logAdminAction } from "../../../../services/admin";
import { requireAdminSession } from "../../../../utils/session";

const schema = z.object({
  status: z.enum(["open", "reviewing", "done", "dismissed"]),
});

export default defineEventHandler(async (event) => {
  const adminSession = await requireAdminSession(event);
  const body = schema.parse(await readBody(event));
  const feedbackId = getRouterParam(event, "id") as string;

  const [updated] = await db
    .update(feedback)
    .set({
      status: body.status,
      updatedAt: new Date(),
    })
    .where(eq(feedback.id, feedbackId))
    .returning();

  if (!updated) {
    throw createError({
      statusCode: 404,
      statusMessage: "Feedback item not found",
    });
  }

  await logAdminAction({
    actorUserId: adminSession.user.id,
    action: "feedback.status.update",
    targetType: "feedback",
    targetId: feedbackId,
    metadata: { status: body.status },
  });

  return {
    item: updated,
  };
});
