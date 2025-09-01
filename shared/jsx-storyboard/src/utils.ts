import * as t from "@babel/types";

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

export function validateExpression(expr: t.Expression): t.Node | null {
  let invalidNode: t.Node | null = null;
  t.traverse(expr, {
    enter(node, parent) {
      if (
        !invalidNode &&
        (t.isFunctionExpression(node) ||
          t.isStatement(node) ||
          t.isJSX(node) ||
          (t.isArrowFunctionExpression(node) &&
            (t.isBlockStatement(node.body) ||
              t.isObjectProperty(parent[parent.length - 1]?.node))))
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
