import { desc } from "drizzle-orm";
import { db } from "../../../db/client";
import { feedback } from "../../../db/schema";

export default defineEventHandler(async () => {
  const items = await db.query.feedback.findMany({
    orderBy: desc(feedback.createdAt),
    limit: 50,
  });

  return {
    items,
  };
});
