import { desc } from "drizzle-orm";
import { db } from "../../../db/client";
import { feedback } from "../../../db/schema";
import { requireAdminSession } from "../../utils/session";

export default defineEventHandler(async (event) => {
  await requireAdminSession(event);

  return {
    items: await db.query.feedback.findMany({
      orderBy: desc(feedback.createdAt),
      limit: 100,
    }),
  };
});
