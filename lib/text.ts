export function normalizeBibleText(text: string) {
  let normalized = text.normalize("NFKD");

  const replacements: Record<string, string> = {
    "[\u2018\u2019\u02BC]": "'",
    "[\u201C\u201D]": '"',
    "[\u2013\u2014]": "-",
    "[\u00A0\u202F]": " ",
    "\u2026": "...",
    "[\u00AB\u00BB]": '"',
    "[\u05BE\u05C3\u05C6]": "-",
    "[\u037E\u0387]": ";",
  };

  for (const [pattern, replacement] of Object.entries(replacements)) {
    normalized = normalized.replace(new RegExp(pattern, "g"), replacement);
  }

  normalized = normalized.replace(/[\u0300-\u036F]/g, "");

  return normalized.trim().replace(/\s+/g, " ");
}

export function splitVerseWords(text: string) {
  return normalizeBibleText(text).split(/\s+/).filter(Boolean);
}
