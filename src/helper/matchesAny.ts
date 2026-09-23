function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalize(value: string): string {
  return value.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function matchesAny(text: string, keywords: string[] = []): boolean {
  const normalizedText = normalize(text);
  return keywords.some((kw) =>
    new RegExp(`\\b${escapeRegex(normalize(kw))}\\b`, "i").test(
      normalizedText,
    ),
  );
}

export default matchesAny;
