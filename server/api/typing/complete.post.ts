import { z } from "zod";
import { db } from "../../../db/client";
import { typingAttempts } from "../../../db/schema";
import { createId } from "../../../lib/ids";
import { requireServerSession } from "../../utils/session";
import { advanceToNextVerse, getCurrentVersePayload } from "../../services/bible";

const schema = z.object({
  verseId: z.string().min(1),
  elapsedMs: z.number().int().positive(),
  accuracy: z.number().min(0).max(100),
  wpm: z.number().min(0),
  typedChars: z.number().int().min(0),
  correctChars: z.number().int().min(0),
});

export default defineEventHandler(async (event) => {
  const session = await requireServerSession(event);
  const body = schema.parse(await readBody(event));

  await db.insert(typingAttempts).values({
    id: createId("attempt"),
    userId: session.user.id,
    verseId: body.verseId,
    elapsedMs: body.elapsedMs,
    accuracy: body.accuracy,
    wpm: body.wpm,
    typedChars: body.typedChars,
    correctChars: body.correctChars,
  });

  await advanceToNextVerse(session.user.id, body.verseId);

  return getCurrentVersePayload(session.user.id);
});
