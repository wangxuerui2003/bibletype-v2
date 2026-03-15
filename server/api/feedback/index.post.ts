import { z } from "zod";
import { db } from "../../../db/client";
import { feedback } from "../../../db/schema";
import { createId } from "../../../lib/ids";
import { requireServerSession } from "../../utils/session";

const schema = z.object({
  type: z.enum(["feedback", "bug", "suggestion"]),
  content: z.string().min(5).max(1200),
});

export default defineEventHandler(async (event) => {
  const session = await requireServerSession(event);
  const body = schema.parse(await readBody(event));

  const [created] = await db
    .insert(feedback)
    .values({
      id: createId("fb"),
      type: body.type,
      content: body.content,
      createdBy: session.user.id,
    })
    .returning();

  return {
    item: created,
  };
});
