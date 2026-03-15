import { relations, sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  real,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const bibleBooks = pgTable(
  "bible_books",
  {
    id: varchar("id", { length: 48 }).primaryKey(),
    testament: varchar("testament", { length: 2 }).notNull(),
    slug: varchar("slug", { length: 128 }).notNull().unique(),
    name: varchar("name", { length: 128 }).notNull(),
    orderedId: integer("ordered_id").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [uniqueIndex("bible_books_ordered_id_idx").on(table.orderedId)],
);

export const bibleVerses = pgTable(
  "bible_verses",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    bookId: varchar("book_id", { length: 48 })
      .notNull()
      .references(() => bibleBooks.id, { onDelete: "cascade" }),
    chapter: integer("chapter").notNull(),
    verse: integer("verse").notNull(),
    osis: varchar("osis", { length: 32 }).notNull().unique(),
    reference: varchar("reference", { length: 128 }).notNull().unique(),
    sequence: integer("sequence").notNull(),
    textRaw: text("text_raw").notNull(),
    textNormalized: text("text_normalized").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("bible_verses_book_chapter_verse_idx").on(table.bookId, table.chapter, table.verse),
    uniqueIndex("bible_verses_sequence_idx").on(table.sequence),
  ],
);

export const userProgress = pgTable(
  "user_progress",
  {
    userId: text("user_id")
      .primaryKey()
      .references(() => user.id, { onDelete: "cascade" }),
    currentVerseId: varchar("current_verse_id", { length: 64 }).references(() => bibleVerses.id, {
      onDelete: "set null",
    }),
    completedVerses: integer("completed_verses").default(0).notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [index("user_progress_current_verse_idx").on(table.currentVerseId)],
);

export const typingAttempts = pgTable(
  "typing_attempts",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    verseId: varchar("verse_id", { length: 64 })
      .notNull()
      .references(() => bibleVerses.id, { onDelete: "cascade" }),
    elapsedMs: integer("elapsed_ms").notNull(),
    accuracy: real("accuracy").notNull(),
    wpm: real("wpm").notNull(),
    typedChars: integer("typed_chars").notNull(),
    correctChars: integer("correct_chars").notNull(),
    completedAt: timestamp("completed_at").defaultNow().notNull(),
  },
  (table) => [
    index("typing_attempts_user_idx").on(table.userId),
    index("typing_attempts_verse_idx").on(table.verseId),
  ],
);

export const feedback = pgTable(
  "feedback",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    type: varchar("type", { length: 32 }).notNull(),
    status: varchar("status", { length: 32 }).default("open").notNull(),
    content: text("content").notNull(),
    createdBy: text("created_by")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [index("feedback_status_idx").on(table.status)],
);

export const userProfiles = pgTable(
  "user_profiles",
  {
    userId: text("user_id")
      .primaryKey()
      .references(() => user.id, { onDelete: "cascade" }),
    bio: text("bio").default("").notNull(),
    autoContinueAfterVerse: boolean("auto_continue_after_verse").default(false).notNull(),
    avatarPath: varchar("avatar_path", { length: 255 }),
    avatarMimeType: varchar("avatar_mime_type", { length: 128 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [index("user_profiles_avatar_path_idx").on(table.avatarPath)],
);

export const biblicalPlaces = pgTable("biblical_places", {
  id: varchar("id", { length: 64 }).primaryKey(),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  name: varchar("name", { length: 128 }).notNull(),
  aliases: jsonb("aliases").$type<string[]>().default(sql`'[]'::jsonb`).notNull(),
  placeType: varchar("place_type", { length: 64 }).default("place").notNull(),
  confidence: real("confidence").default(1).notNull(),
  source: varchar("source", { length: 64 }).default("seed").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const placeGeometries = pgTable(
  "place_geometries",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    placeId: varchar("place_id", { length: 64 })
      .notNull()
      .references(() => biblicalPlaces.id, { onDelete: "cascade" }),
    lat: real("lat"),
    lng: real("lng"),
    geojson: jsonb("geojson").$type<Record<string, unknown> | null>().default(null),
    label: varchar("label", { length: 128 }),
  },
  (table) => [index("place_geometries_place_idx").on(table.placeId)],
);

export const versePlaces = pgTable(
  "verse_places",
  {
    verseId: varchar("verse_id", { length: 64 })
      .notNull()
      .references(() => bibleVerses.id, { onDelete: "cascade" }),
    placeId: varchar("place_id", { length: 64 })
      .notNull()
      .references(() => biblicalPlaces.id, { onDelete: "cascade" }),
    source: varchar("source", { length: 64 }).default("seed").notNull(),
    confidence: real("confidence").default(1).notNull(),
    adminConfirmed: boolean("admin_confirmed").default(false).notNull(),
  },
  (table) => [primaryKey({ columns: [table.verseId, table.placeId] })],
);

export const raceLobbies = pgTable(
  "race_lobbies",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    code: varchar("code", { length: 12 }).notNull().unique(),
    hostUserId: text("host_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    mode: varchar("mode", { length: 16 }).notNull(),
    targetPlayers: integer("target_players").notNull(),
    status: varchar("status", { length: 32 }).default("waiting").notNull(),
    verseId: varchar("verse_id", { length: 64 }).references(() => bibleVerses.id, {
      onDelete: "set null",
    }),
    countdownStartedAt: timestamp("countdown_started_at"),
    startedAt: timestamp("started_at"),
    finishedAt: timestamp("finished_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("race_lobbies_status_idx").on(table.status)],
);

export const raceParticipants = pgTable(
  "race_participants",
  {
    lobbyId: varchar("lobby_id", { length: 64 })
      .notNull()
      .references(() => raceLobbies.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    slotIndex: integer("slot_index").notNull(),
    ready: boolean("ready").default(false).notNull(),
    connected: boolean("connected").default(true).notNull(),
    completedChars: integer("completed_chars").default(0).notNull(),
    finishedAt: timestamp("finished_at"),
  },
  (table) => [primaryKey({ columns: [table.lobbyId, table.userId] })],
);

export const raceResults = pgTable(
  "race_results",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    lobbyId: varchar("lobby_id", { length: 64 })
      .notNull()
      .references(() => raceLobbies.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    placement: integer("placement").notNull(),
    elapsedMs: integer("elapsed_ms").notNull(),
    accuracy: real("accuracy").notNull(),
    wpm: real("wpm").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("race_results_lobby_idx").on(table.lobbyId)],
);

export const adminAuditLogs = pgTable(
  "admin_audit_logs",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    actorUserId: text("actor_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    action: varchar("action", { length: 128 }).notNull(),
    targetType: varchar("target_type", { length: 64 }).notNull(),
    targetId: varchar("target_id", { length: 64 }).notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default(sql`'{}'::jsonb`).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("admin_audit_logs_actor_idx").on(table.actorUserId)],
);

export const importJobs = pgTable(
  "import_jobs",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    type: varchar("type", { length: 64 }).notNull(),
    status: varchar("status", { length: 32 }).default("pending").notNull(),
    summary: jsonb("summary").$type<Record<string, unknown>>().default(sql`'{}'::jsonb`).notNull(),
    source: varchar("source", { length: 128 }),
    logs: text("logs"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    completedAt: timestamp("completed_at"),
  },
  (table) => [index("import_jobs_type_idx").on(table.type)],
);

export const bibleBooksRelations = relations(bibleBooks, ({ many }) => ({
  verses: many(bibleVerses),
}));

export const bibleVersesRelations = relations(bibleVerses, ({ one, many }) => ({
  book: one(bibleBooks, {
    fields: [bibleVerses.bookId],
    references: [bibleBooks.id],
  }),
  places: many(versePlaces),
}));

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(user, {
    fields: [userProfiles.userId],
    references: [user.id],
  }),
}));

export const versePlacesRelations = relations(versePlaces, ({ one }) => ({
  verse: one(bibleVerses, {
    fields: [versePlaces.verseId],
    references: [bibleVerses.id],
  }),
  place: one(biblicalPlaces, {
    fields: [versePlaces.placeId],
    references: [biblicalPlaces.id],
  }),
}));
