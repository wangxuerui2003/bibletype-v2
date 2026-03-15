import { db, pool } from "../db/client";
import { biblicalPlaces, placeGeometries } from "../db/schema";

const places = [
  { id: "place_jerusalem", slug: "jerusalem", name: "Jerusalem", type: "city", lat: 31.7683, lng: 35.2137 },
  { id: "place_bethlehem", slug: "bethlehem", name: "Bethlehem", type: "city", lat: 31.7054, lng: 35.2024 },
  { id: "place_nazareth", slug: "nazareth", name: "Nazareth", type: "city", lat: 32.6996, lng: 35.3035 },
  { id: "place_jericho", slug: "jericho", name: "Jericho", type: "city", lat: 31.8667, lng: 35.45 },
  { id: "place_galilee", slug: "galilee", name: "Galilee", type: "region", lat: 32.9, lng: 35.5 },
  { id: "place_jordan", slug: "jordan-river", name: "Jordan River", type: "river", lat: 31.8, lng: 35.55 },
  { id: "place_egypt", slug: "egypt", name: "Egypt", type: "region", lat: 26.8206, lng: 30.8025 },
  { id: "place_rome", slug: "rome", name: "Rome", type: "city", lat: 41.9028, lng: 12.4964 },
  { id: "place_damascus", slug: "damascus", name: "Damascus", type: "city", lat: 33.5138, lng: 36.2765 },
];

for (const place of places) {
  await db
    .insert(biblicalPlaces)
    .values({
      id: place.id,
      slug: place.slug,
      name: place.name,
      aliases: [place.name.toLowerCase()],
      placeType: place.type,
      source: "seed",
    })
    .onConflictDoNothing();

  await db
    .insert(placeGeometries)
    .values({
      id: `${place.id}_geometry`,
      placeId: place.id,
      lat: place.lat,
      lng: place.lng,
      label: place.name,
    })
    .onConflictDoNothing();
}

await pool.end();
