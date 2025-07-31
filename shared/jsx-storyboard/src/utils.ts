import * as t from "@babel/types";

export function validateExpression(expr: t.Expression): t.Node | null {
  let invalidNode: t.Node | null = null;
  t.traverse(expr, {
    enter(node) {
      if (
        !invalidNode &&
        (t.isFunctionExpression(node) || t.isStatement(node) || t.isJSX(node))
      ) {
        invalidNode = node;
      }
    },
  });
  return invalidNode;
}
