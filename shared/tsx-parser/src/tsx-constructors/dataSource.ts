import * as t from "@babel/types";
import { parseTsxCallApi } from "./api.js";
import type {
  DataSource,
  DataSourceConfig,
  ParseOptions,
  ParseResult,
} from "../interfaces.js";
import { removeTypeAnnotations } from "./values.js";
import { replaceVariables } from "./replaceVariables.js";

export function parseDataSourceCall(
  call: t.Expression,
  result: ParseResult,
  options: ParseOptions | undefined,
  name: string,
  transformArgs?: t.CallExpression["arguments"],
  method?: "then" | "catch",
  config?: DataSourceConfig
) {
  const payload = parseTsxCallApi(call, result, options);
  if (!payload) {
    return null;
  }
  result.contracts.add(payload.api);
  const dataSource: DataSource = {
    name,
    scope: result.templateCollection ? "template" : "view",
    config,
    ...payload,
  };

  if (transformArgs) {
    if (transformArgs.length > (method === "catch" ? 1 : 2)) {
      result.errors.push({
        message: `"callApi().${method}()" expects no more than 2 arguments, but got ${transformArgs.length}`,
        node: transformArgs[1],
        severity: "error",
      });
      return false;
    }
    if (transformArgs.length > 0) {
      const transform = parsePromiseCallback(transformArgs[0], result);
      if (transform) {
        dataSource[method === "catch" ? "rejectTransform" : "transform"] =
          transform;
      }
    }
    if (method !== "catch" && transformArgs.length > 1) {
      const transform = parsePromiseCallback(transformArgs[1], result);
      if (transform) {
        dataSource.rejectTransform = transform;
      }
    }
  }

  (result.templateCollection ?? result).dataSources.push(dataSource);
}

function parsePromiseCallback(
  callback: t.ArgumentPlaceholder | t.SpreadElement | t.Expression,
  result: ParseResult
): string | null {
  if (!t.isArrowFunctionExpression(callback)) {
    result.errors.push({
      message: `"callApi().then()" callback expects an arrow function, but got ${callback.type}`,
      node: callback,
      severity: "error",
    });
    return null;
  }
  if (!t.isExpression(callback.body)) {
    result.errors.push({
      message: `"callApi().then()" callback function body expects an expression, but got ${callback.body.type}`,
      node: callback.body,
      severity: "error",
    });
    return null;
  }
  if (callback.params.length > 1) {
    result.errors.push({
      message: `"callApi().then()" callback function expects exactly 0 or 1 parameter, but got ${callback.params.length}`,
      node: callback.params[1] ?? callback,
      severity: "error",
    });
    return null;
  }
  const exprSource = removeTypeAnnotations(result.source, callback.body);
  const expr = `<% ${exprSource} %>`;
  if (callback.params.length === 0) {
    return expr;
  }
  const arg = callback.params[0];
  if (!t.isIdentifier(arg)) {
    result.errors.push({
      message: `"callApi().then()" callback function parameter expects an identifier, but got ${arg.type}`,
      node: arg,
      severity: "error",
    });
    return null;
  }
  return replaceVariables(expr, new Map([[arg.name, "DATA"]]));
}
