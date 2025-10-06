import type * as t from "@babel/types";
import { preevaluate, type PreevaluateResult } from "@next-core/cook";
import { isExpressionString } from "@next-shared/tsx-parser";

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

interface Replacement {
  id: t.Identifier;
  shorthand?: boolean;
}

export function replaceVariables(
  expr: string,
  patterns: Map<string, string> | undefined
): string {
  if (!patterns?.size) {
    return expr;
  }
  const keywords = [...patterns.keys()];
  if (keywords.some((k) => expr.includes(k))) {
    const replacements: Replacement[] = [];
    let result: PreevaluateResult | undefined;
    try {
      result = preevaluate(expr, {
        withParent: true,
        hooks: {
          beforeVisitGlobal(node, path) {
            if (patterns.has(node.name)) {
              const p = path![path!.length - 1]?.node;
              let shorthand: boolean | undefined;
              if (p && p.type === "Property" && !p.computed && p.shorthand) {
                shorthand = true;
              }
              replacements.push({ id: node, shorthand });
            }
          },
        },
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Parse expression failed:", error);
    }
    if (replacements.length > 0 && result) {
      const { prefix, source, suffix } = result;
      const chunks: string[] = [];
      let prevStart = 0;
      for (let i = 0; i < replacements.length; i++) {
        const { id, shorthand } = replacements[i];
        const { name, start, end } = id;
        chunks.push(
          source.substring(prevStart, start!),
          `${shorthand ? `${name}: ` : ""}${patterns.get(name)}`
        );
        prevStart = end!;
      }
      chunks.push(source.substring(prevStart));
      return `${prefix}${chunks.join("")}${suffix}`;
    }
  }
  return expr;
}
