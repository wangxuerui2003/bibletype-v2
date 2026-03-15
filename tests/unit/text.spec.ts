import { describe, expect, it } from "vitest";
import { normalizeBibleText, splitVerseWords } from "../../lib/text";

describe("normalizeBibleText", () => {
  it("normalizes smart quotes and spacing", () => {
    expect(normalizeBibleText(" “Let there be light,”  ")).toBe('"Let there be light,"');
  });

  it("splits normalized words", () => {
    expect(splitVerseWords("In   the beginning")).toEqual(["In", "the", "beginning"]);
  });
});
