import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { db, pool } from "../db/client";
import { biblicalPlaces, bibleVerses, placeGeometries, versePlaces } from "../db/schema";
import { ensureOpenBibleDataRoot } from "../lib/data-sources";

type AncientPlace = {
  id: string;
  friendly_id?: string;
  url_slug: string;
  types?: string[];
  translation_name_counts?: Record<string, number>;
  geojson_file?: string;
  verses?: Array<{
    osis: string;
  }>;
  identifications?: Array<{
    score?: {
      time_total?: number;
    };
    resolutions?: Array<{
      lonlat?: string;
      type?: string;
    }>;
  }>;
};

function readJsonLines<T>(contents: string) {
  return contents
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line) as T);
}

function parseLonLat(lonLat?: string) {
  if (!lonLat) {
    return { lat: null, lng: null };
  }

  const [lng, lat] = lonLat.split(",").map((value) => Number(value));

  return {
    lat: Number.isFinite(lat) ? lat : null,
    lng: Number.isFinite(lng) ? lng : null,
  };
}

const root = await ensureOpenBibleDataRoot();
const ancientPlaces = readJsonLines<AncientPlace>(
  await readFile(join(root, "data", "ancient.jsonl"), "utf8"),
);

const verseByOsis = new Map(
  (
    await db.query.bibleVerses.findMany({
      columns: {
        id: true,
        osis: true,
      },
    })
  ).map((verse) => [verse.osis, verse.id]),
);

await db.delete(versePlaces);
await db.delete(placeGeometries);
await db.delete(biblicalPlaces);

for (const place of ancientPlaces) {
  const aliases = Object.keys(place.translation_name_counts ?? {});
  const firstIdentification = place.identifications?.[0];
  const firstResolution = firstIdentification?.resolutions?.[0];
  const confidence = firstIdentification?.score?.time_total
    ? Number(firstIdentification.score.time_total) / 1000
    : 0.5;

  await db.insert(biblicalPlaces).values({
    id: place.id,
    slug: place.url_slug,
    name: place.friendly_id ?? aliases[0] ?? place.url_slug,
    aliases: aliases.length ? aliases : [place.friendly_id ?? place.url_slug],
    placeType: place.types?.[0] ?? firstResolution?.type ?? "place",
    confidence,
    source: "openbible",
  });

  const geometryFile = place.geojson_file ? join(root, "geometry", place.geojson_file) : null;
  let geojson: Record<string, unknown> | null = null;

  if (geometryFile) {
    try {
      geojson = JSON.parse(await readFile(geometryFile, "utf8")) as Record<string, unknown>;
    } catch {
      geojson = null;
    }
  }

  const { lat, lng } = parseLonLat(firstResolution?.lonlat);

  await db.insert(placeGeometries).values({
    id: `${place.id}_geometry`,
    placeId: place.id,
    lat,
    lng,
    geojson,
    label: place.friendly_id ?? aliases[0] ?? place.url_slug,
  });

  for (const verse of place.verses ?? []) {
    const verseId = verseByOsis.get(verse.osis);

    if (!verseId) {
      continue;
    }

    await db.insert(versePlaces).values({
      verseId,
      placeId: place.id,
      source: "openbible",
      confidence,
      adminConfirmed: false,
    });
  }
}

await pool.end();
