import { z } from "zod";
import { updateRaceProgress } from "../../../services/race-state";
import { requireServerSession } from "../../../utils/session";

const schema = z.object({
  completedChars: z.number().int().min(0),
});

export default defineEventHandler(async (event) => {
  const session = await requireServerSession(event);
  const body = schema.parse(await readBody(event));
  const snapshot = updateRaceProgress(
    getRouterParam(event, "id") as string,
    session.user.id,
    body.completedChars,
  );

  if (!snapshot) {
    throw createError({
      statusCode: 404,
      statusMessage: "Race lobby not found",
    });
  }

  return snapshot;
});
