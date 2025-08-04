import type { ConstructResult } from "@next-shared/jsx-storyboard";
import type { ViewWithInfo } from "../converters/interfaces";

export function isJsxView(
  result: ConstructResult | ViewWithInfo
): result is ConstructResult {
  return !!(result as ConstructResult).source;
}
