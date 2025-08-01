import type { BrickConf, ContextConf } from "@next-core/types";
import { parseJsx, type Component } from "@next-shared/jsx-storyboard";
import convertList from "./convertList";

export async function convertJsx(source: string) {
  const result = await parseJsx(source);

  const convert = async (component: Component) => {

    let brick: BrickConf | null = null;
    switch (component.name) {
      case "eo-list":
        brick = await convertList(component);
    }

    if (!brick) {
      return null;
    }
  }

  const context: ContextConf[] = [
    {
      name: "__builtin_fn_mergeTexts",
      value: mergeTexts,
    }
  ];
}

function mergeTexts(items: ({ type: "text", text: string; } | { type: "expression", value: unknown })[]): string {
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
