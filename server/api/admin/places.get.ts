import { asc } from "drizzle-orm";
import { db } from "../../../db/client";
import { biblicalPlaces } from "../../../db/schema";
import { requireAdminSession } from "../../utils/session";

export default defineEventHandler(async (event) => {
  await requireAdminSession(event);

  return {
    items: await db.query.biblicalPlaces.findMany({
      orderBy: asc(biblicalPlaces.name),
      limit: 100,
    }),
  };
});
