import { isExpressionString, type ParseResult } from "@next-shared/tsx-parser";

export function getViewTitle(
  result: ParseResult | null | undefined
): string | undefined {
  const view = result?.components.find((comp) => comp.name === "View");
  const viewTitle = view?.properties?.title;
  if (typeof viewTitle === "string" && !isExpressionString(viewTitle)) {
    return viewTitle;
  }
}
