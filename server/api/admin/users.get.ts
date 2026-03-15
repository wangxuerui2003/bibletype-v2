import { desc } from "drizzle-orm";
import { db } from "../../../db/client";
import { user } from "../../../db/schema";
import { requireAdminSession } from "../../utils/session";

export default defineEventHandler(async (event) => {
  await requireAdminSession(event);

  const users = await db.query.user.findMany({
    orderBy: desc(user.createdAt),
    limit: 100,
  });

  return {
    users,
  };
});
