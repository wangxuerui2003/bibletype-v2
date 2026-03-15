import { z } from "zod";
import { requireServerSession } from "../../utils/session";
import { getCurrentVersePayload } from "../../services/bible";
import { enqueueQuickMatch } from "../../services/race-state";

const schema = z.object({
  targetPlayers: z.number().int().min(2).max(4),
});

export default defineEventHandler(async (event) => {
  const session = await requireServerSession(event);
  const body = schema.parse(await readBody(event));
  const payload = await getCurrentVersePayload(session.user.id);

  return enqueueQuickMatch({
    userId: session.user.id,
    name: session.user.name,
    targetPlayers: body.targetPlayers,
    verseReference: payload.verse.reference,
    raceText: payload.verse.textNormalized,
    totalChars: payload.verse.textNormalized.length,
  });
});
