import type { ViewWithInfo } from "../converters/interfaces";
import type { ConstructedView } from "../../interfaces";

export function isJsxView(
  result: ConstructedView | ViewWithInfo
): result is ConstructedView {
  return !!(result as ConstructedView).source;
}
