import * as t from "@babel/types";
import type { ParseState } from "../interfaces.js";
import { replaceGlobalsInFunction } from "./replaceVariables.js";

export function constructFunction(
  fn: t.FunctionDeclaration,
  result: ParseState
) {
  if (fn.async || fn.generator) {
    result.errors.push({
      message: `Function declaration cannot be async or generator`,
      node: fn,
      severity: "error",
    });
    return;
  }
  if (!fn.id) {
    result.errors.push({
      message: `Function declaration must have a name`,
      node: fn,
      severity: "error",
    });
    return;
  }
  result.functions.push({
    name: fn.id.name,
    source: replaceGlobalsInFunction(
      result.source.slice(fn.start!, fn.end!),
      result,
      fn.id.name
    ),
    typescript: true,
  });
}
