import { db } from "../../db/client";
import { adminAuditLogs } from "../../db/schema";
import { createId } from "../../lib/ids";

export async function logAdminAction({
  actorUserId,
  action,
  targetType,
  targetId,
  metadata = {},
}: {
  actorUserId: string;
  action: string;
  targetType: string;
  targetId: string;
  metadata?: Record<string, unknown>;
}) {
  await db.insert(adminAuditLogs).values({
    id: createId("audit"),
    actorUserId,
    action,
    targetType,
    targetId,
    metadata,
  });
}
