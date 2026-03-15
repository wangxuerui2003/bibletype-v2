import { requireServerSession } from "../../utils/session";

export default defineEventHandler(async (event) => {
  const session = await requireServerSession(event);

  return {
    user: session.user,
  };
});
