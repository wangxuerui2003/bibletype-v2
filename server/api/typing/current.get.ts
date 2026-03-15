import { requireServerSession } from "../../utils/session";
import { getCurrentVersePayload } from "../../services/bible";

export default defineEventHandler(async (event) => {
  const session = await requireServerSession(event);

  return getCurrentVersePayload(session.user.id);
});
