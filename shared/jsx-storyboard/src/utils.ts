import * as t from "@babel/types";

const EXPRESSION_PREFIX_REG = /^\s*<%=?\s+/;
const EXPRESSION_SUFFIX_REG = /\s+%>\s*$/;

export function isExpressionString(value: unknown): value is string {
  return (
    typeof value === "string" &&
    EXPRESSION_PREFIX_REG.test(value) &&
    EXPRESSION_SUFFIX_REG.test(value)
  );
}

export interface ValidateExpressionOptions {
  disallowArrowFunction?: boolean;
}

export function validateExpression(
  expr: t.Expression,
  options: ValidateExpressionOptions
): t.Node | null {
  let invalidNode: t.Node | null = null;
  t.traverse(expr, {
    enter(node) {
      if (
        !invalidNode &&
        (t.isFunctionExpression(node) ||
          t.isStatement(node) ||
          t.isJSX(node) ||
          (options.disallowArrowFunction && t.isArrowFunctionExpression(node)))
      ) {
        invalidNode = node;
      }
    },
  });
  return invalidNode;
}
