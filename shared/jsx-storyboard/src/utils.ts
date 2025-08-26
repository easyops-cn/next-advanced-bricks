import * as t from "@babel/types";

const EXPRESSION_PREFIX_REG = /^\s*<%=?\s/;
const EXPRESSION_SUFFIX_REG = /\s%>\s*$/;

export function isExpressionString(value: unknown): value is string {
  return (
    typeof value === "string" &&
    EXPRESSION_PREFIX_REG.test(value) &&
    EXPRESSION_SUFFIX_REG.test(value)
  );
}

export function validateExpression(expr: t.Expression): t.Node | null {
  let invalidNode: t.Node | null = null;
  t.traverse(expr, {
    enter(node) {
      if (
        !invalidNode &&
        (t.isFunctionExpression(node) ||
          t.isStatement(node) ||
          t.isJSX(node) ||
          (t.isArrowFunctionExpression(node) && t.isBlockStatement(node.body)))
      ) {
        invalidNode = node;
      }
    },
  });
  return invalidNode;
}

export function isNilNode(node: t.Node) {
  return (
    t.isNullLiteral(node) || (t.isIdentifier(node) && node.name === "undefined")
  );
}

export function containsJsxNode(expr: t.Expression): boolean {
  let found = false;
  t.traverse(expr, {
    enter(node) {
      if (!found && (t.isJSXElement(node) || t.isJSXFragment(node))) {
        found = true;
      }
    },
  });
  return found;
}

export function convertJsxEventAttr(attr: string): string {
  return attr
    .slice(2)
    .replace(/([a-z])([A-Z])/g, "$1.$2")
    .toLowerCase();
}
