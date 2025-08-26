import * as t from "@babel/types";
import type {
  ChildElement,
  Component,
  ConstructJsValueOptions,
  ConstructResult,
  Events,
  ParseJsxOptions,
} from "../interfaces.js";
import { constructJsValue, constructPropValue } from "./values.js";
import { convertJsxEventAttr, validateExpression } from "../utils.js";
import { constructTsxEvent } from "./events.js";
import { constructChildren } from "./children.js";
import { constructComponents } from "./components.js";

export function constructTsxElement(
  node: t.Node,
  result: ConstructResult,
  options?: ParseJsxOptions,
  valueOptions?: ConstructJsValueOptions
): ChildElement | null | (ChildElement | null)[] {
  if (t.isJSXElement(node)) {
    if (!t.isJSXIdentifier(node.openingElement.name)) {
      result.errors.push({
        message: `Expected JSXIdentifier, but got ${node.openingElement.name.type}`,
        node: node.openingElement.name,
        severity: "error",
      });
      return null;
    }

    const tagName = node.openingElement.name.name;

    if (tagName === "Fragment") {
      for (const attr of node.openingElement.attributes) {
        if (
          !(
            t.isJSXAttribute(attr) &&
            t.isJSXIdentifier(attr.name) &&
            attr.name.name === "key"
          )
        ) {
          result.errors.push({
            message: `Invalid attribute for Fragment`,
            node: attr,
            severity: "error",
          });
        }
      }
      return node.children.flatMap((child) =>
        constructTsxElement(child, result, options, valueOptions)
      );
    }

    const properties: Record<string, unknown> = {};
    const ambiguousProps: Record<string, unknown> = {};
    let events: Events | undefined;
    let componentId: string | undefined;

    for (const attr of node.openingElement.attributes) {
      if (t.isJSXSpreadAttribute(attr)) {
        result.errors.push({
          message: `Spread attributes are not supported in component`,
          node: attr,
          severity: "error",
        });
        continue;
      }
      if (!t.isJSXIdentifier(attr.name)) {
        result.errors.push({
          message: `Expected JSXIdentifier, but got ${attr.name.type}`,
          node: attr.name,
          severity: "error",
        });
        continue;
      }
      const attrName = attr.name.name;
      const isEventHandler = /^on[A-Z]/.test(attrName);
      if (isEventHandler) {
        if (!t.isJSXExpressionContainer(attr.value)) {
          result.errors.push({
            message: `Event handler "${attrName}" expects a JSXExpressionContainer, but got ${attr.value?.type}`,
            node: attr.value ?? attr,
            severity: "error",
          });
          continue;
        }
        if (t.isJSXEmptyExpression(attr.value.expression)) {
          result.errors.push({
            message: `Empty expression in events is not allowed`,
            node: attr.value,
            severity: "warning",
          });
          continue;
        }
        const handler = constructTsxEvent(
          attr.value.expression,
          result,
          options
        );
        if (handler) {
          events ??= {};
          events[convertJsxEventAttr(attrName)] = handler;
        }
      } else if (attrName === "componentId") {
        if (!t.isStringLiteral(attr.value)) {
          result.errors.push({
            message: `"componentId" attribute in component expects a string literal, but got ${attr.value?.type}`,
            node: attr.value ?? attr,
            severity: "error",
          });
          continue;
        }
        componentId = attr.value.value;
      } else {
        if (attr.value == null) {
          properties[attrName] = true;
        } else if (t.isStringLiteral(attr.value)) {
          properties[attrName] = attr.value.value;
          ambiguousProps[attrName] = attr.value.value;
        } else if (t.isJSXExpressionContainer(attr.value)) {
          if (t.isJSXEmptyExpression(attr.value.expression)) {
            result.errors.push({
              message: `Empty expression in JSX attribute "${attrName}" is not allowed`,
              node: attr.value,
              severity: "warning",
            });
            continue;
          }
          properties[attrName] = constructPropValue(
            attr.value.expression,
            result,
            {
              ...valueOptions,
              allowExpression: true,
              modifier: "=",
            }
          );

          if (options?.reward) {
            ambiguousProps[attrName] = constructJsValue(
              attr.value.expression,
              {
                ...result,
                // Ignore errors in ambiguous props
                errors: [],
              },
              {
                allowExpression: true,
                ambiguous: true,
              }
            );
          }
        } else {
          result.errors.push({
            message: `Unsupported attribute value type in component: ${attr.value.type}`,
            node: attr.value,
            severity: "error",
          });
        }
      }
    }

    const { textContent, children } = constructChildren(
      node.children,
      result,
      options,
      valueOptions
    );

    if (textContent) {
      properties.textContent = textContent;
    }

    const component: Component = {
      name: tagName,
      componentId,
      properties,
      events,
      children,
    };

    if (options?.reward) {
      component.ambiguousProps = ambiguousProps;
    }

    if (componentId) {
      if (result.componentsMap.has(componentId)) {
        result.errors.push({
          message: `Duplicated componentId "${componentId}" found`,
          node,
          severity: "error",
        });
      } else {
        result.componentsMap.set(componentId, component);
      }
    }

    return {
      type: "component",
      component,
    };
  }

  if (t.isJSXFragment(node)) {
    return node.children.flatMap((child) =>
      constructTsxElement(child, result, options, valueOptions)
    );
  }

  if (t.isJSXText(node)) {
    if (node.value.trim()) {
      return {
        type: "text",
        text: node.value,
      };
    }
    return null;
  }
  if (t.isJSXExpressionContainer(node)) {
    if (t.isJSXEmptyExpression(node.expression)) {
      result.errors.push({
        message: "Empty expression in JSX is not allowed",
        node,
        severity: "warning",
      });
      return null;
    }

    // Convert `{list.map((item) => (<X>...</X>))}`
    // to `brick: :forEach`
    if (t.isCallExpression(node.expression)) {
      const callee = node.expression.callee;
      if (t.isMemberExpression(callee)) {
        if (
          t.isIdentifier(callee.property) &&
          !callee.computed &&
          callee.property.name === "map"
        ) {
          const args = node.expression.arguments;
          if (args.length > 0) {
            if (args.length > 1) {
              result.errors.push({
                message: "Only one argument is allowed for map function",
                node: args[1],
                severity: "error",
              });
            }
            const [func] = args;
            if (t.isArrowFunctionExpression(func)) {
              if (t.isBlockStatement(func.body)) {
                result.errors.push({
                  message: "Block statement is not allowed in map function",
                  node: func.body,
                  severity: "error",
                });
                return null;
              }
              if (t.isJSXElement(func.body) || t.isJSXFragment(func.body)) {
                const invalidNode = validateExpression(callee.object);
                if (invalidNode) {
                  result.errors.push({
                    message: `Unsupported node type as the object of a map function with JSX element: ${invalidNode.type}`,
                    node: invalidNode,
                    severity: "error",
                  });
                  return null;
                }

                if (func.params.length > 2) {
                  result.errors.push({
                    message: `Only up to 2 parameters are allowed in map function with JSX element`,
                    node: func,
                    severity: "error",
                  });
                  return null;
                }
                const invalidParam = func.params.find(
                  (param) => !t.isIdentifier(param)
                );
                if (invalidParam) {
                  result.errors.push({
                    message: `Only identifier parameters are allowed in map function with JSX element`,
                    node: invalidParam,
                    severity: "error",
                  });
                  return null;
                }

                const replacePatterns = new Map<string, string>(
                  valueOptions?.replacePatterns ?? []
                );
                if (func.params.length > 0) {
                  const [itemArg, indexArg] = func.params;
                  replacePatterns.set((itemArg as t.Identifier).name, "ITEM");
                  if (indexArg) {
                    replacePatterns.set(
                      (indexArg as t.Identifier).name,
                      "INDEX"
                    );
                  }
                }

                return {
                  type: "component",
                  component: {
                    name: "ForEach",
                    properties: {
                      dataSource: constructPropValue(callee.object, result, {
                        ...valueOptions,
                        modifier: "=",
                        allowExpression: true,
                      }),
                    },
                    children: constructComponents(
                      [func.body],
                      result,
                      options,
                      {
                        ...valueOptions,
                        replacePatterns,
                      }
                    ),
                  },
                };
              }
            }
          }
        }
      }
    } else if (t.isConditionalExpression(node.expression)) {
      const { test, consequent, alternate } = node.expression;
      const invalidNodeInTest = validateExpression(test);
      if (invalidNodeInTest) {
        result.errors.push({
          message: `Unsupported node type in conditional expression test: ${invalidNodeInTest.type}`,
          node: invalidNodeInTest,
          severity: "error",
        });
        return null;
      }
      if (
        t.isJSXElement(consequent) ||
        t.isJSXFragment(consequent) ||
        t.isJSXElement(alternate) ||
        t.isJSXFragment(alternate)
      ) {
        return {
          type: "component",
          component: {
            name: "If",
            properties: {
              dataSource: constructPropValue(test, result, {
                ...valueOptions,
                modifier: "=",
                allowExpression: true,
              }),
            },
            children: [
              ...constructComponents(
                [consequent],
                result,
                options,
                valueOptions
              ),
              ...constructComponents(
                [alternate],
                result,
                options,
                valueOptions
              ).map((component) => ({
                ...component,
                slot: "else",
              })),
            ],
          },
        };
      }
    }

    const invalidNode = validateExpression(node.expression);
    if (invalidNode) {
      result.errors.push({
        message: `Unsupported node type in expression: ${invalidNode.type}`,
        node: invalidNode,
        severity: "error",
      });
      return null;
    }
    return {
      type: "expression",
      expression: node.expression,
    };
  }

  result.errors.push({
    message: `Unsupported node type in component: ${node.type}`,
    node,
    severity: "error",
  });
  return null;
}
