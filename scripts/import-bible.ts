import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { db, pool } from "../db/client";
import { bibleBooks, bibleVerses } from "../db/schema";
import { normalizeBibleText } from "../lib/text";
import { buildReference, createBookId, createVerseId } from "../server/services/bible";

const ROOT = process.env.BIBLE_IMPORT_ROOT ?? "/Users/wxuerui/coding/bibletype-old/bible-scraper/Bible";

type BookFile = {
  book: string;
  testament: "OT" | "NT";
  book_order: number;
  chapters: Array<{
    chapter: number;
    verses: Array<{
      verse: number;
      text: string;
    }>;
  }>;
};

async function importFolder(testament: "OT" | "NT") {
  const folder = join(ROOT, testament);
  const files = (await readdir(folder)).filter((file) => file.endsWith(".json")).sort();
  let sequence = testament === "OT" ? 0 : 100000;

  for (const file of files) {
    const contents = JSON.parse(await readFile(join(folder, file), "utf8")) as BookFile;
    const bookName = contents.book.includes("--")
      ? (contents.book.split("--")[1] ?? contents.book)
      : contents.book;
    const bookId = createBookId(contents.book_order);

    await db
      .insert(bibleBooks)
      .values({
        id: bookId,
        testament: contents.testament,
        slug: bookName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        name: bookName,
        orderedId: contents.book_order,
      })
      .onConflictDoNothing();

    for (const chapter of contents.chapters) {
      for (const verse of chapter.verses) {
        sequence += 1;
        const reference = buildReference(bookName, chapter.chapter, verse.verse);

        await db
          .insert(bibleVerses)
          .values({
            id: createVerseId(reference),
            bookId,
            chapter: chapter.chapter,
            verse: verse.verse,
            reference,
            sequence,
            textRaw: verse.text.trim(),
            textNormalized: normalizeBibleText(verse.text),
          })
          .onConflictDoNothing();
      }
    }
  }
}

await importFolder("OT");
await importFolder("NT");
await pool.end();
