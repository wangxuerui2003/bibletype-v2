import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { db, pool } from "../db/client";
import { biblicalPlaces, bibleVerses, versePlaces } from "../db/schema";
import { ensureOpenBibleDataRoot } from "../lib/data-sources";

type AncientPlace = {
  id: string;
  translation_name_counts?: Record<string, number>;
};

const root = await ensureOpenBibleDataRoot();
const contents = await readFile(join(root, "data", "ancient.jsonl"), "utf8");
const places = contents
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean)
  .map((line) => JSON.parse(line) as AncientPlace);

const verses = await db.query.bibleVerses.findMany({
  columns: {
    id: true,
    textNormalized: true,
  },
});

const dbPlaces = new Map(
  (
    await db.query.biblicalPlaces.findMany({
      columns: {
        id: true,
      },
    })
  ).map((place) => [place.id, place]),
);

for (const verse of verses) {
  const normalizedText = verse.textNormalized.toLowerCase();

  for (const place of places) {
    if (!dbPlaces.has(place.id)) {
      continue;
    }

    const aliases = Object.keys(place.translation_name_counts ?? {});
    const matched = aliases.some((alias) => normalizedText.includes(alias.toLowerCase()));

    if (matched) {
      await db
        .insert(versePlaces)
        .values({
          verseId: verse.id,
          placeId: place.id,
          source: "fallback-text-match",
          confidence: 0.25,
        })
        .onConflictDoNothing();
    }
  }
}

await pool.end();
