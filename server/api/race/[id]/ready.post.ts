import { z } from "zod";
import { setRaceReady } from "../../../services/race-state";
import { requireServerSession } from "../../../utils/session";

const schema = z.object({
  ready: z.boolean(),
});

export default defineEventHandler(async (event) => {
  const session = await requireServerSession(event);
  const body = schema.parse(await readBody(event));
  const snapshot = setRaceReady(getRouterParam(event, "id") as string, session.user.id, body.ready);

  if (!snapshot) {
    throw createError({
      statusCode: 404,
      statusMessage: "Race lobby not found",
    });
  }

  return snapshot;
});
