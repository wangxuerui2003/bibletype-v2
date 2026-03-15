import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../../db/client";
import { user } from "../../../db/schema";
import { requireServerSession } from "../../utils/session";

const schema = z.object({
  name: z.string().min(2).max(60),
  image: z.string().url().optional().or(z.literal("")),
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

  return { user: updated };
});
