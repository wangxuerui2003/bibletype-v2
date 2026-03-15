import { listRaceLobbies } from "../../services/race-state";
import { requireAdminSession } from "../../utils/session";

export default defineEventHandler(async (event) => {
  await requireAdminSession(event);

  return {
    items: listRaceLobbies(),
  };
});
