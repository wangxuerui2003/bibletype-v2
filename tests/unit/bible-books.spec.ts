import { describe, expect, it } from "vitest";
import { osisToReference, referenceToOsis } from "../../lib/bible-books";

describe("bible book OSIS mapping", () => {
  it("maps reference to osis", () => {
    expect(referenceToOsis("Genesis", 1, 1)).toBe("Gen.1.1");
    expect(referenceToOsis("Psalm", 23, 1)).toBe("Ps.23.1");
  });

  it("maps osis to reference", () => {
    expect(osisToReference("Matt.5.9")).toEqual({
      book: "Matthew",
      chapter: 5,
      verse: 9,
      reference: "Matthew 5:9",
    });
  });
});
