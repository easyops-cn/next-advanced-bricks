import * as t from "@babel/types";
import {
  precookFunction,
  preevaluate,
  type PreevaluateResult,
  type PrecookFunctionResult,
} from "@next-core/cook";
import type { ParseResult } from "../interfaces.js";

interface Replacement {
  id: t.Identifier;
  shorthand?: boolean;
}

export function replaceGlobals(expr: string, result: ParseResult): string {
  const patterns = new Map([
    ...(result.templateCollection
      ? result.templateCollection.identifiers.map(
          (k) => [k, `STATE.${k}`] as const
        )
      : result.contexts.map((k) => [k, `CTX.${k}`] as const)),
    ...result.functionNames.map((k) => [k, `FN.${k}`] as const),
    ...result.globals.entries(),
  ]);
  return replaceVariables(expr, patterns);
}

export function replaceGlobalsInFunction(
  source: string,
  result: ParseResult,
  selfName: string
): string {
  const patterns = new Map(
    result.functionNames
      .filter((name) => name !== selfName)
      .map((k) => [k, `FN.${k}`])
  );
  return replaceVariablesInFunction(source, patterns);
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

function replaceVariablesInFunction(
  source: string,
  patterns: Map<string, string> | undefined
): string {
  if (!patterns?.size) {
    return source;
  }
  const keywords = [...patterns.keys()];
  if (keywords.some((k) => source.includes(k))) {
    const replacements: Replacement[] = [];
    let result: PrecookFunctionResult | undefined;
    try {
      result = precookFunction(source, {
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
      console.error("Parse function failed:", error);
    }
    if (replacements.length > 0 && result) {
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
      return chunks.join("");
    }
  }
  return source;
}
