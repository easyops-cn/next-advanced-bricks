export function mergeTexts(
  ...items: (
    | { type: "text"; text: string }
    | { type: "expression"; value: unknown }
  )[]
): string {
  function mergeValuesAsText(value: unknown): string {
    if (Array.isArray(value)) {
      return value.map(mergeValuesAsText).join("");
    }
    const type = typeof value;
    if (type === "string" || type === "number") {
      return String(value);
    }
    if (type === "object" && value !== null) {
      throw new Error("Can not render object as text");
    }
    return "";
  }

  const texts: string[] = [];
  for (const item of items) {
    if (item.type === "text") {
      texts.push(item.text.trim());
    } else {
      texts.push(mergeValuesAsText(item.value));
    }
  }
  return texts.join("");
}
