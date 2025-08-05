import * as t from "@babel/types";
import type {
  ChildElement,
  ChildExpression,
  ChildMerged,
  ChildText,
  Component,
  ConstructResult,
  Events,
  ParseJsxOptions,
} from "../interfaces.js";
import { constructJsValue, constructPropValue } from "./values.js";
import { validateExpression } from "../utils.js";
import { constructEvents } from "./events.js";

export function constructElement(
  node:
    | t.JSXElement
    | t.JSXText
    | t.JSXExpressionContainer
    | t.JSXFragment
    | t.JSXSpreadChild,
  result: ConstructResult,
  options?: ParseJsxOptions
): ChildElement | null {
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

      if (attrName === "events") {
        if (!t.isJSXExpressionContainer(attr.value)) {
          result.errors.push({
            message: `"events" attribute in component expects a JSXExpressionContainer, but got ${attr.value?.type}`,
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
        events = constructEvents(attr.value.expression, result);
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
              allowExpression: true,
              disallowArrowFunction: true,
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
                disallowArrowFunction: true,
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

    let rawChildren: (ChildElement | ChildMerged)[] = node.children.map(
      (child) => constructElement(child, result, options)
    );
    let onlyTextChildren = rawChildren.every((child) => child?.type === "text");

    if (!onlyTextChildren) {
      let previousChild: ChildElement | ChildMerged | null = null;
      const tempChildren: (ChildElement | ChildMerged)[] = [];

      for (const child of rawChildren) {
        if (child === null) {
          // Do nothing
        } else if (child.type === "text" || child.type === "expression") {
          if (
            previousChild?.type === "text" ||
            previousChild?.type === "expression"
          ) {
            previousChild = {
              type: "merged",
              children: [previousChild, child],
            };
            tempChildren.splice(tempChildren.length - 1, 1, previousChild);
            continue;
          } else if (previousChild?.type === "merged") {
            previousChild.children.push(child);
            continue;
          }
        }
        previousChild = child;
        tempChildren.push(child);
      }

      rawChildren = tempChildren;
      onlyTextChildren = rawChildren.every(
        (child) =>
          child?.type === "text" ||
          (child?.type === "merged" &&
            child.children.every((c) => c.type === "text"))
      );
    }

    let children: Component[] | undefined;
    if (onlyTextChildren) {
      const text = rawChildren
        .flatMap((child) =>
          child!.type === "text"
            ? child!.text
            : (child as ChildMerged).children.map((c) => (c as ChildText).text)
        )
        .join("")
        .trim();
      if (text) {
        properties.textContent = text;
      }
    } else {
      const onlyLooseTextChildren = rawChildren.every(
        (child) => !!child && child.type !== "component"
      );
      if (onlyLooseTextChildren) {
        const text = mergeTexts(
          rawChildren.flatMap((child) =>
            child!.type === "merged"
              ? (child as ChildMerged).children
              : (child as ChildText)
          ),
          result.source
        );
        properties.textContent = text;
      } else {
        children = rawChildren
          .filter((child) => !!child)
          .map((child) =>
            child.type === "component"
              ? child.component
              : {
                  name: "eo-text",
                  properties: {
                    textContent:
                      child.type === "text"
                        ? child.text
                        : child.type === "expression"
                          ? `<%= ${child.expression} %>`
                          : mergeTexts(child.children, result.source),
                  },
                }
          );
      }
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
    const invalidNode = validateExpression(node.expression, {
      disallowArrowFunction: true,
    });
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

function mergeTexts(elements: (ChildText | ChildExpression)[], source: string) {
  return `<%= CTX.__builtin_fn_mergeTexts(${elements
    .map((elem) =>
      elem.type === "text"
        ? JSON.stringify(elem)
        : `{type:"expression",value:(${source.substring(elem.expression.start!, elem.expression.end!)})}`
    )
    .join(", ")}) %>`;
}
