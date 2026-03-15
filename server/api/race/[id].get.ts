import { getRaceLobby } from "../../services/race-state";
import { requireServerSession } from "../../utils/session";

export default defineEventHandler(async (event) => {
  await requireServerSession(event);

  const lobby = getRaceLobby(getRouterParam(event, "id") as string);

  if (!lobby) {
    throw createError({
      statusCode: 404,
      statusMessage: "Race lobby not found",
    });
  }

  return lobby;
});
