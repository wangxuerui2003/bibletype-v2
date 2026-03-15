export const OSIS_TO_BOOK: Record<string, string> = {
  Gen: "Genesis",
  Exod: "Exodus",
  Lev: "Leviticus",
  Num: "Numbers",
  Deut: "Deuteronomy",
  Josh: "Joshua",
  Judg: "Judges",
  Ruth: "Ruth",
  "1Sam": "1 Samuel",
  "2Sam": "2 Samuel",
  "1Kgs": "1 Kings",
  "2Kgs": "2 Kings",
  "1Chr": "1 Chronicles",
  "2Chr": "2 Chronicles",
  Ezra: "Ezra",
  Neh: "Nehemiah",
  Esth: "Esther",
  Job: "Job",
  Ps: "Psalms",
  Prov: "Proverbs",
  Eccl: "Ecclesiastes",
  Song: "Song of Solomon",
  Isa: "Isaiah",
  Jer: "Jeremiah",
  Lam: "Lamentations",
  Ezek: "Ezekiel",
  Dan: "Daniel",
  Hos: "Hosea",
  Joel: "Joel",
  Amos: "Amos",
  Obad: "Obadiah",
  Jonah: "Jonah",
  Mic: "Micah",
  Nah: "Nahum",
  Hab: "Habakkuk",
  Zeph: "Zephaniah",
  Hag: "Haggai",
  Zech: "Zechariah",
  Mal: "Malachi",
  Matt: "Matthew",
  Mark: "Mark",
  Luke: "Luke",
  John: "John",
  Acts: "Acts",
  Rom: "Romans",
  "1Cor": "1 Corinthians",
  "2Cor": "2 Corinthians",
  Gal: "Galatians",
  Eph: "Ephesians",
  Phil: "Philippians",
  Col: "Colossians",
  "1Thess": "1 Thessalonians",
  "2Thess": "2 Thessalonians",
  "1Tim": "1 Timothy",
  "2Tim": "2 Timothy",
  Titus: "Titus",
  Phlm: "Philemon",
  Heb: "Hebrews",
  Jas: "James",
  "1Pet": "1 Peter",
  "2Pet": "2 Peter",
  "1John": "1 John",
  "2John": "2 John",
  "3John": "3 John",
  Jude: "Jude",
  Rev: "Revelation",
};

export const BOOK_TO_OSIS = Object.fromEntries(
  Object.entries(OSIS_TO_BOOK).map(([osis, book]) => [book, osis]),
) as Record<string, string>;

BOOK_TO_OSIS.Psalm = "Ps";
BOOK_TO_OSIS["Song of Songs"] = "Song";

export function referenceToOsis(book: string, chapter: number, verse: number) {
  const osisBook = BOOK_TO_OSIS[book];

  if (!osisBook) {
    throw new Error(`Missing OSIS mapping for ${book}`);
  }

  return `${osisBook}.${chapter}.${verse}`;
}

export function osisToReference(osis: string) {
  const match = /^([1-3]?[A-Za-z]+)\.(\d+)\.(\d+)$/.exec(osis);

  if (!match) {
    return null;
  }

  const [, osisBook, chapter, verse] = match;
  const book = OSIS_TO_BOOK[osisBook];

  if (!book) {
    return null;
  }

  return {
    book,
    chapter: Number(chapter),
    verse: Number(verse),
    reference: `${book} ${chapter}:${verse}`,
  };
}
