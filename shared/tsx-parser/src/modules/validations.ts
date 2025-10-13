import type { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import type { ComponentChild, ParsedModule } from "./interfaces.js";
import { MODULE_SOURCE } from "./constants.js";

export function validateFunction(
  fn: t.FunctionDeclaration | t.FunctionExpression | t.ArrowFunctionExpression,
  state: ParsedModule
): boolean {
  if (fn.async || fn.generator) {
    state.errors.push({
      message: `Function cannot be async or generator`,
      node: fn,
      severity: "error",
    });
    return false;
  }

  return true;
}

export function validateGlobalApi(
  id: NodePath<t.Identifier | t.JSXIdentifier>,
  api: string
): boolean {
  const ref = id.referencesImport(MODULE_SOURCE, api);
  if (ref) {
    return true;
  }
  return id.node.name === api && !id.scope.getBinding(id.node.name);
}

export function validateEmbeddedExpression(
  expr: t.Expression,
  state: ParsedModule | null
): boolean {
  let invalidNode: t.Node | null = null;

  t.traverse(expr, {
    enter(node, parent) {
      if (
        !invalidNode &&
        (t.isFunctionExpression(node) ||
          t.isStatement(node) ||
          t.isAwaitExpression(node) ||
          t.isYieldExpression(node) ||
          t.isJSX(node) ||
          (t.isArrowFunctionExpression(node) &&
            (node.async ||
              node.generator ||
              t.isBlockStatement(node.body) ||
              t.isObjectProperty(parent[parent.length - 1]?.node))))
      ) {
        invalidNode = node;
      }
    },
  });

  if (invalidNode) {
    state?.errors.push({
      message: `Unsupported expression type: ${(invalidNode as t.Node).type}`,
      node: invalidNode,
      severity: "error",
    });
    return false;
  }

  return true;
}

export function isNilPath(path: NodePath<t.Node>) {
  return (
    path.isNullLiteral() ||
    (path.isIdentifier() &&
      path.node.name === "undefined" &&
      path.scope.getBinding("undefined") === undefined)
  );
}

const EXPRESSION_PREFIX_REG = /^<%=?\s/;
const EXPRESSION_SUFFIX_REG = /\s%>$/;

export function isExpressionString(value: unknown): value is string {
  if (typeof value !== "string") {
    return false;
  }
  const trimmed = value.trim();
  return (
    EXPRESSION_PREFIX_REG.test(trimmed) && EXPRESSION_SUFFIX_REG.test(trimmed)
  );
}

export function isAnyOfficialComponent(child: ComponentChild) {
  return (
    !child.reference ||
    (child.reference.type === "imported" &&
      child.reference.importSource === MODULE_SOURCE)
  );
}

export function isOfficialComponent(child: ComponentChild, name: string) {
  return (
    isAnyOfficialComponent(child) &&
    (child.reference ? child.reference.name === name : child.name === name)
  );
}
