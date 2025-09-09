import * as t from "@babel/types";
import { preevaluate, PreevaluateResult } from "@next-core/cook";

interface Replacement {
  id: t.Identifier;
  shorthand?: boolean;
}

export function mergeReplacePatterns(
  pattern1: Map<string, string> | undefined,
  pattern2: Map<string, string> | undefined
): Map<string, string> | undefined {
  if (pattern1 && pattern2) {
    return new Map([...pattern1, ...pattern2]);
  }
  return pattern1 || pattern2;
}

export function replaceCTX(expr: string, contexts: string[]): string {
  const patterns = new Map(contexts.map((k) => [k, `CTX.${k}`]));
  return replaceVariables(expr, patterns);
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
          beforeVisitGlobal(node, parent) {
            if (patterns.has(node.name)) {
              const p = parent![parent!.length - 1]?.node;
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
      console.error(
        "Parse evaluation string failed when scanning expression:",
        error
      );
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
