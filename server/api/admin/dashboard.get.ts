import { sql } from "drizzle-orm";
import { db } from "../../../db/client";
import { feedback, raceLobbies, typingAttempts, user } from "../../../db/schema";
import { requireAdminSession } from "../../utils/session";

export default defineEventHandler(async (event) => {
  await requireAdminSession(event);

  const [userCount] = await db.select({ count: sql<number>`count(*)` }).from(user);
  const [feedbackCount] = await db.select({ count: sql<number>`count(*)` }).from(feedback);
  const [attemptCount] = await db.select({ count: sql<number>`count(*)` }).from(typingAttempts);
  const [raceCount] = await db.select({ count: sql<number>`count(*)` }).from(raceLobbies);

  return {
    stats: {
      users: Number(userCount?.count ?? 0),
      feedback: Number(feedbackCount?.count ?? 0),
      attempts: Number(attemptCount?.count ?? 0),
      races: Number(raceCount?.count ?? 0),
    },
  };
});
