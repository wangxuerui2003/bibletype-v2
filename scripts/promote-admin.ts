import { eq } from "drizzle-orm";
import { db, pool } from "../db/client";
import { user } from "../db/schema";

const email = process.argv[2];

if (!email) {
  console.error("Usage: pnpm admin:promote <email>");
  process.exit(1);
}

const [updated] = await db
  .update(user)
  .set({
    role: "admin",
    updatedAt: new Date(),
  })
  .where(eq(user.email, email))
  .returning({
    id: user.id,
    email: user.email,
    role: user.role,
  });

await pool.end();

if (!updated) {
  console.error(`No user found for ${email}`);
  process.exit(1);
}

console.log(`Promoted ${updated.email} to ${updated.role}`);
