import { db, pool } from "../db/client";
import { biblicalPlaces, bibleVerses, versePlaces } from "../db/schema";

const places = await db.query.biblicalPlaces.findMany();
const verses = await db.query.bibleVerses.findMany();

for (const verse of verses) {
  for (const place of places) {
    const aliases = (place.aliases as string[]).length ? (place.aliases as string[]) : [place.name.toLowerCase()];
    const matched = aliases.some((alias) => verse.textNormalized.toLowerCase().includes(alias.toLowerCase()));

    if (matched) {
      await db
        .insert(versePlaces)
        .values({
          verseId: verse.id,
          placeId: place.id,
          source: "seed-index",
          confidence: 0.72,
        })
        .onConflictDoNothing();
    }
  }
}

await pool.end();
