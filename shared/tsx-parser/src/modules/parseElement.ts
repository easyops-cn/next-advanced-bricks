import type { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import type { ParseJsValueOptions, ParseModuleState } from "./interfaces.js";
import { validateEmbeddedExpression } from "./validations.js";
import type { ChildElement } from "./internal-interfaces.js";
import { parseJSXElement } from "./parseJSXElement.js";
import { parsePropValue } from "./parseJsValue.js";
import { parseChildren } from "./parseChildren.js";

export function parseElement(
  path: NodePath<t.Node>,
  state: ParseModuleState,
  options: ParseJsValueOptions
): ChildElement | null | (ChildElement | null)[] {
  if (path.isJSXFragment()) {
    const children = path.get("children");
    return children.flatMap((child) => parseElement(child, state, options));
  }

  if (path.isJSXText()) {
    if (path.node.value.trim()) {
      return {
        type: "text",
        text: path.node.value,
      };
    }
    return null;
  }

  if (path.isJSXExpressionContainer()) {
    return parseElement(path.get("expression"), state, options);
  }

  if (path.isJSXEmptyExpression()) {
    return null;
  }

  if (path.isJSXElement()) {
    return parseJSXElement(path, state, options);
  }

  if (path.isCallExpression()) {
    const callee = path.get("callee");
    if (callee.isMemberExpression() || callee.isOptionalMemberExpression()) {
      const property = callee.get("property") as NodePath<t.Identifier>;
      if (property.isIdentifier() && property.node.name === "map") {
        const args = path.get("arguments");
        if (args.length > 0) {
          const func = args[0];
          if (func.isArrowFunctionExpression()) {
            const body = func.get("body");
            if (body.isExpression() && containsJsxNode(body.node)) {
              const object = callee.get("object") as NodePath<t.Expression>;
              if (!validateEmbeddedExpression(object.node, state)) {
                return null;
              }
              const params = func.get("params");
              if (params.length > 2) {
                state.errors.push({
                  message: `Array map function with JSX elements must have at most two parameters, but got ${params.length}`,
                  node: params[2].node,
                  severity: "error",
                });
                return null;
              }
              const invalidParam = params.find((p) => !p.isIdentifier());
              if (invalidParam) {
                state.errors.push({
                  message: `Array map function with JSX elements must have identifier parameters, but got ${invalidParam.type}`,
                  node: invalidParam.node,
                  severity: "error",
                });
                return null;
              }

              const forEachOptions: ParseJsValueOptions = {
                ...options,
                forEachBinding: undefined,
              };
              if (params.length > 0) {
                const [itemArg, indexArg] = params as NodePath<t.Identifier>[];
                forEachOptions.forEachBinding = {
                  item: itemArg.node,
                  index: indexArg?.node,
                };
              }

              return {
                type: "component",
                component: {
                  name: "ForEach",
                  properties: {
                    dataSource: parsePropValue(object, state, {
                      ...options,
                      modifier: "=",
                    }),
                  },
                  children: parseChildren(
                    func.get("body"),
                    state,
                    forEachOptions
                  ),
                },
              };
            }
          }
        }
      }
    }
  } else if (path.isConditionalExpression()) {
    const test = path.get("test");
    const consequent = path.get("consequent");
    const alternate = path.get("alternate");
    if (containsJsxNode(consequent.node) || containsJsxNode(alternate.node)) {
      if (!validateEmbeddedExpression(test.node, state)) {
        return null;
      }
      return {
        type: "component",
        component: {
          name: "If",
          properties: {
            dataSource: parsePropValue(test, state, {
              ...options,
              modifier: "=",
            }),
          },
          children: [
            ...parseChildren(consequent, state, options),
            ...parseChildren(alternate, state, options).map((component) => ({
              ...component,
              slot: "else",
            })),
          ],
        },
      };
    }
  } else if (path.isLogicalExpression()) {
    const left = path.get("left");
    const right = path.get("right");
    const operator = path.node.operator;
    if (
      (operator === "&&" || operator === "||") &&
      containsJsxNode(right.node)
    ) {
      if (!validateEmbeddedExpression(left.node, state)) {
        return null;
      }
      const children = parseChildren(right, state, options);
      return {
        type: "component",
        component: {
          name: "If",
          properties: {
            dataSource: parsePropValue(left, state, {
              ...options,
              modifier: "=",
            }),
          },
          children:
            operator === "&&"
              ? children
              : children.map((component) => ({
                  ...component,
                  slot: "else",
                })),
        },
      };
    }
  }

  if (path.isExpression()) {
    if (validateEmbeddedExpression(path.node, state)) {
      return {
        type: "expression",
        expression: path,
      };
    }
    return null;
  }

  state.errors.push({
    message: `Unsupported node type in JSX children: ${path.type}`,
    node: path.node,
    severity: "error",
  });
  return null;
}

function containsJsxNode(expr: t.Expression): boolean {
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
