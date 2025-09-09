import { isExpressionString, replaceVariables } from "@next-shared/tsx-parser";

export function deepReplaceVariables<T>(
  value: T,
  patterns: Map<string, string> | undefined
): T {
  if (!patterns?.size) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) =>
      deepReplaceVariables(item, patterns)
    ) as unknown as T;
  }

  if (typeof value === "object" && value !== null) {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [
        k,
        deepReplaceVariables(v, patterns),
      ])
    ) as T;
  }

  if (typeof value === "string" && isExpressionString(value)) {
    return replaceVariables(value, patterns) as unknown as T;
  }

  return value;
}
