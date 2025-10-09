import type { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import type {
  ParseJsValueOptions,
  ParseModuleState,
  RenderUseBrick,
} from "./interfaces.js";
import { validateEmbeddedExpression } from "./validations.js";
import { parseEmbedded } from "./parseEmbedded.js";
import { parseChildren } from "./parseChildren.js";

const ambiguousSymbol = Symbol("ambiguous");

export function parseJsValue(
  path: NodePath<t.Node>,
  state: ParseModuleState,
  options: ParseJsValueOptions
): unknown {
  if (path.isTSAsExpression()) {
    return parseJsValue(path.get("expression"), state, options);
  }

  if (path.isObjectExpression()) {
    return parseJsObject(path, state, options);
  }

  if (path.isArrayExpression()) {
    return parseJsArray(path, state, options);
  }

  if (
    path.isStringLiteral() ||
    path.isNumericLiteral() ||
    path.isBooleanLiteral()
  ) {
    return path.node.value;
  }

  if (path.isNullLiteral()) {
    return null;
  }

  if (
    path.isIdentifier() &&
    path.node.name === "undefined" &&
    path.scope.getBinding("undefined") === undefined
  ) {
    return undefined;
  }

  if (options.allowUseBrick && path.isArrowFunctionExpression()) {
    const expr = path.get("body");
    if (expr.isBlockStatement()) {
      state.errors.push({
        message: "Block statements are not supported in render callback",
        node: expr.node,
        severity: "error",
      });
      return null;
    }
    const paramNames: string[] = [];
    for (const param of path.get("params")) {
      if (param.isIdentifier()) {
        paramNames.push(param.node.name);
      } else {
        state.errors.push({
          message: `Unsupported parameter type: ${param.type}`,
          node: param.node,
          severity: "error",
        });
        return null;
      }
    }
    return {
      params: paramNames,
      children: parseChildren(expr, state, options),
    } as RenderUseBrick;
  }

  if (path.isExpression()) {
    if (!validateEmbeddedExpression(path.node, state)) {
      return null;
    }

    if (options.ambiguous) {
      return ambiguousSymbol;
    }

    return parseEmbedded(path, state, options);
  }

  state.errors.push({
    message: `Unsupported value type: ${path.node.type}`,
    node: path.node,
    severity: "error",
  });
  return null;
}

export function parsePropValue(
  path: NodePath<t.Expression>,
  state: ParseModuleState,
  options: ParseJsValueOptions
) {
  let shouldCompute = false;
  t.traverse(path.node, {
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

  if (shouldCompute && validateEmbeddedExpression(path.node, null)) {
    return parseEmbedded(path, state, options);
  }

  return parseJsValue(path, state, options);
}

function parseJsObject(
  path: NodePath<t.ObjectExpression>,
  state: ParseModuleState,
  options: ParseJsValueOptions
) {
  const props = path.get("properties");
  if (
    props.some(
      (p) =>
        p.isSpreadElement() ||
        (p.isObjectProperty() && (p.node.computed || p.node.shorthand))
    ) &&
    validateEmbeddedExpression(path.node, state)
  ) {
    if (options.ambiguous) {
      return ambiguousSymbol;
    }
    return parseEmbedded(path, state, options);
  }

  const result: Record<string, unknown> = {};

  for (const prop of props) {
    if (!prop.isObjectProperty()) {
      state.errors.push({
        message: `Unsupported property type: ${prop.type}`,
        node: prop.node,
        severity: "error",
      });
      continue;
    }

    if (prop.node.computed || prop.node.shorthand) {
      state.errors.push({
        message: "Unsupported computed or shorthand object property",
        node: prop.node.key,
        severity: "error",
      });
      continue;
    }

    const keyPath = prop.get("key");
    let key: string;
    if (keyPath.isIdentifier()) {
      key = keyPath.node.name;
    } else if (keyPath.isStringLiteral()) {
      key = keyPath.node.value;
    } else {
      state.errors.push({
        message: `Unsupported object key type: ${keyPath.node.type}`,
        node: keyPath.node,
        severity: "error",
      });
      continue;
    }

    result[key] = parseJsValue(prop.get("value"), state, options);
  }

  return result;
}

function parseJsArray(
  path: NodePath<t.ArrayExpression>,
  state: ParseModuleState,
  options: ParseJsValueOptions
) {
  const elements = path.get("elements");
  if (
    elements.some((e) => !e || e.isSpreadElement()) &&
    validateEmbeddedExpression(path.node, state)
  ) {
    if (options.ambiguous) {
      return ambiguousSymbol;
    }
    return parseEmbedded(path, state, options);
  }

  const result: unknown[] = [];

  for (const elem of elements) {
    if (!elem.node) {
      state.errors.push({
        message: "Array elements cannot be empty",
        node: path.node,
        severity: "error",
      });
      continue;
    }
    if (elem.isSpreadElement()) {
      state.errors.push({
        message: "Spread elements are not supported in array",
        node: elem.node,
        severity: "error",
      });
      continue;
    }
    result.push(parseJsValue(elem as NodePath<t.Expression>, state, options));
  }

  return result;
}
