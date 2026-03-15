import { and, asc, desc, eq, gt, gte, sql } from "drizzle-orm";
import { db } from "../../db/client";
import { bibleBooks, bibleVerses, biblicalPlaces, placeGeometries, userProgress, versePlaces } from "../../db/schema";
import { createId } from "../../lib/ids";

export async function ensureUserProgress(userId: string) {
  const existing = await db.query.userProgress.findFirst({
    where: eq(userProgress.userId, userId),
  });

  if (existing) {
    return existing;
  }

  const firstVerse = await db.query.bibleVerses.findFirst({
    orderBy: asc(bibleVerses.sequence),
  });

  if (!firstVerse) {
    throw createError({
      statusCode: 503,
      statusMessage: "Bible data has not been imported yet",
    });
  }

  const [created] = await db
    .insert(userProgress)
    .values({
      userId,
      currentVerseId: firstVerse.id,
      completedVerses: 0,
    })
    .returning();

  return created;
}

export async function getCurrentVersePayload(userId: string) {
  const progress = await ensureUserProgress(userId);
  const currentVerseId = progress?.currentVerseId;

  if (!currentVerseId) {
    throw createError({
      statusCode: 503,
      statusMessage: "Current progress is missing a verse pointer",
    });
  }

  const verse = await db.query.bibleVerses.findFirst({
    where: eq(bibleVerses.id, currentVerseId),
    with: {
      book: true,
    },
  });

  if (!verse) {
    throw createError({
      statusCode: 404,
      statusMessage: "Current verse not found",
    });
  }

  const places = await db
    .select({
      placeId: biblicalPlaces.id,
      name: biblicalPlaces.name,
      slug: biblicalPlaces.slug,
      placeType: biblicalPlaces.placeType,
      source: versePlaces.source,
      confidence: versePlaces.confidence,
      lat: placeGeometries.lat,
      lng: placeGeometries.lng,
      label: placeGeometries.label,
      geojson: placeGeometries.geojson,
    })
    .from(versePlaces)
    .innerJoin(biblicalPlaces, eq(versePlaces.placeId, biblicalPlaces.id))
    .leftJoin(placeGeometries, eq(placeGeometries.placeId, biblicalPlaces.id))
    .where(and(eq(versePlaces.verseId, verse.id), gte(versePlaces.confidence, 0.5)))
    .orderBy(desc(versePlaces.confidence), asc(biblicalPlaces.name));

  return {
    verse: {
      id: verse.id,
      reference: verse.reference,
      textRaw: verse.textRaw,
      textNormalized: verse.textNormalized,
      testament: verse.book.testament,
      book: verse.book.name,
      chapter: verse.chapter,
      verse: verse.verse,
    },
    progress: {
      completedVerses: progress?.completedVerses ?? 0,
    },
    places,
  };
}

export async function advanceToNextVerse(userId: string, verseId: string) {
  const completedVerse = await db.query.bibleVerses.findFirst({
    where: eq(bibleVerses.id, verseId),
  });

  if (!completedVerse) {
    throw createError({
      statusCode: 404,
      statusMessage: "Verse not found",
    });
  }

  const nextVerse = await db.query.bibleVerses.findFirst({
    where: gt(bibleVerses.sequence, completedVerse.sequence),
    orderBy: asc(bibleVerses.sequence),
  });

  const targetVerse = nextVerse ?? completedVerse;

  await db
    .update(userProgress)
    .set({
      currentVerseId: targetVerse.id,
      completedVerses: sql`${userProgress.completedVerses} + 1`,
      updatedAt: new Date(),
    })
    .where(eq(userProgress.userId, userId));

  return targetVerse;
}

export async function listVerses(limit = 50) {
  return db.query.bibleVerses.findMany({
    limit,
    orderBy: asc(bibleVerses.sequence),
    with: {
      book: true,
    },
  });
}

export function buildReference(book: string, chapter: number, verse: number) {
  return `${book} ${chapter}:${verse}`;
}

export function createBookId(orderedId: number) {
  return `book_${String(orderedId).padStart(2, "0")}`;
}

export function createVerseId(reference: string) {
  return reference.toLowerCase().replace(/[^a-z0-9]+/g, "_");
}

export async function countBibleContent() {
  const [bookCount] = await db.select({ count: sql<number>`count(*)` }).from(bibleBooks);
  const [verseCount] = await db.select({ count: sql<number>`count(*)` }).from(bibleVerses);

  return {
    books: Number(bookCount?.count ?? 0),
    verses: Number(verseCount?.count ?? 0),
  };
}
