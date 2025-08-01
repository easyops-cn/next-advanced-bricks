import * as t from "@babel/types";

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
