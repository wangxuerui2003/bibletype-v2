import { eq } from "drizzle-orm";
import { db } from "../../../db/client";
import { user, userProfiles } from "../../../db/schema";
import { requireServerSession } from "../../utils/session";

export default defineEventHandler(async (event) => {
  const session = await requireServerSession(event);
  const userRecord = await db.query.user.findFirst({
    where: eq(user.id, session.user.id),
  });
  const profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, session.user.id),
  });

  return {
    user: userRecord ?? session.user,
    profile,
  };
});
