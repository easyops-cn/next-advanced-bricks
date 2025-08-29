import * as t from "@babel/types";
import type {
  ConstructJsValueOptions,
  ConstructResult,
} from "../interfaces.js";
import { validateExpression } from "../utils.js";
import { replaceCTX, replaceVariables } from "./replaceVariables.js";
import { constructComponents } from "./components.js";

const ambiguousSymbol = Symbol("ambiguous");

export function constructJsValue(
  node: t.Node,
  state: ConstructResult,
  options: ConstructJsValueOptions
): unknown {
  if (t.isObjectExpression(node)) {
    return constructJsObject(node, state, options);
  }

  if (t.isArrayExpression(node)) {
    return constructJsArray(node, state, options);
  }

  if (
    t.isStringLiteral(node) ||
    t.isNumericLiteral(node) ||
    t.isBooleanLiteral(node)
  ) {
    return node.value;
  }

  if (t.isNullLiteral(node)) {
    return null;
  }

  if (t.isIdentifier(node) && node.name === "undefined") {
    return undefined;
  }

  if (options.allowUseBrick && t.isArrowFunctionExpression(node)) {
    const expr = node.body;
    if (t.isBlockStatement(expr)) {
      state.errors.push({
        message: "Block statements are not supported in render callback",
        node: expr,
        severity: "error",
      });
      return null;
    }
    const paramNames: string[] = [];
    for (const param of node.params) {
      if (t.isIdentifier(param)) {
        paramNames.push(param.name);
      } else {
        state.errors.push({
          message: `Unsupported parameter type: ${param.type}`,
          node: param,
          severity: "error",
        });
        return null;
      }
    }
    return {
      params: paramNames,
      children: constructComponents([expr], state, undefined, options),
    };
  }

  if (t.isExpression(node) && options.allowExpression) {
    const invalidNode = validateExpression(node);
    if (invalidNode) {
      state.errors.push({
        message: `Unsupported node type: ${invalidNode.type}`,
        node: invalidNode,
        severity: "error",
      });
      return null;
    } else {
      if (options.ambiguous) {
        return ambiguousSymbol;
      }
      const value = `<%${options.modifier ?? ""} ${state.source.substring(node.start!, node.end!)} %>`;
      return replaceVariables(
        replaceCTX(value, state.contexts),
        options?.replacePatterns
      );
    }
  }

  state.errors.push({
    message: `Unsupported node type: ${node.type}`,
    node,
    severity: "error",
  });
  return null;
}

export function constructPropValue(
  expr: t.Expression,
  state: ConstructResult,
  options: ConstructJsValueOptions
) {
  let shouldCompute = false;
  t.traverse(expr, {
    enter(node, parent) {
      let p: t.Node | undefined;
      if (
        !shouldCompute &&
        !(
          t.isStringLiteral(node) ||
          t.isNumericLiteral(node) ||
          t.isBooleanLiteral(node) ||
          t.isNullLiteral(node) ||
          t.isObjectExpression(node) ||
          t.isArrayExpression(node) ||
          t.isObjectProperty(node) ||
          (t.isIdentifier(node) &&
            ((p = parent[parent.length - 1]?.node), true) &&
            (p && t.isObjectProperty(p)
              ? !p.computed && !p.shorthand
              : node.name === "undefined"))
        )
      ) {
        shouldCompute = true;
      }
    },
  });

  if (shouldCompute) {
    const invalidNode = validateExpression(expr);
    if (!invalidNode) {
      const value = `<%${options.modifier ?? ""} ${state.source.substring(expr.start!, expr.end!)} %>`;
      return replaceVariables(
        replaceCTX(value, state.contexts),
        options?.replacePatterns
      );
    }
  }

  return constructJsValue(expr, state, options);
}

function constructJsObject(
  node: t.ObjectExpression,
  state: ConstructResult,
  options: ConstructJsValueOptions
): string | Record<string, unknown> {
  if (node.properties.some((prop) => t.isSpreadElement(prop))) {
    if (options.allowExpression) {
      const invalidNode = validateExpression(node);
      if (invalidNode) {
        state.errors.push({
          message: `Unsupported node type: ${invalidNode.type}`,
          node: invalidNode,
          severity: "error",
        });
      } else {
        if (options.ambiguous) {
          return ambiguousSymbol as unknown as string;
        }
        const value = `<%${options.modifier ?? ""} ${state.source.substring(node.start!, node.end!)} %>`;
        return replaceVariables(
          replaceCTX(value, state.contexts),
          options?.replacePatterns
        );
      }
    }
  }

  const obj: Record<string, unknown> = {};
  for (const prop of node.properties) {
    if (t.isObjectProperty(prop)) {
      if (prop.computed || prop.shorthand) {
        state.errors.push({
          message:
            "Computed properties and shorthand properties are not supported",
          node: prop.key,
          severity: "error",
        });
        continue;
      }
      let key: string;
      if (t.isIdentifier(prop.key)) {
        key = prop.key.name;
      } else if (t.isStringLiteral(prop.key)) {
        key = prop.key.value;
      } else {
        state.errors.push({
          message: `Unsupported object key type: ${prop.key.type}`,
          node: prop.key,
          severity: "error",
        });
        continue;
      }

      obj[key] = constructJsValue(prop.value, state, options);
    } else {
      state.errors.push({
        message: `Unsupported property type: ${prop.type}`,
        node: prop,
        severity: "error",
      });
      continue;
    }
  }
  return obj;
}

function constructJsArray(
  node: t.ArrayExpression,
  state: ConstructResult,
  options: ConstructJsValueOptions
): string | unknown[] {
  if (node.elements.some((elem) => t.isSpreadElement(elem))) {
    if (options.allowExpression) {
      const invalidNode = validateExpression(node);
      if (invalidNode) {
        state.errors.push({
          message: `Unsupported node type: ${invalidNode.type}`,
          node: invalidNode,
          severity: "error",
        });
      } else {
        if (options.ambiguous) {
          return ambiguousSymbol as unknown as string;
        }
        const value = `<%${options.modifier ?? ""} ${state.source.substring(node.start!, node.end!)} %>`;
        return replaceVariables(
          replaceCTX(value, state.contexts),
          options?.replacePatterns
        );
      }
    }
  }

  const arr: unknown[] = [];

  for (const elem of node.elements) {
    if (elem === null) {
      state.errors.push({
        message: "Array elements cannot be empty",
        node,
        severity: "error",
      });
      continue;
    }
    if (t.isSpreadElement(elem)) {
      state.errors.push({
        message: "Spread elements are not supported in arrays",
        node: elem,
        severity: "error",
      });
      continue;
    }
    arr.push(constructJsValue(elem, state, options));
  }

  return arr;
}
