import * as t from "@babel/types";
import type { ConstructResult, ParseJsxOptions } from "../interfaces.js";
import { constructComponents } from "./components.js";

export function constructTsxView(
  node: t.JSXElement,
  result: ConstructResult,
  options?: ParseJsxOptions
) {
  const element = node.openingElement;
  if (!t.isJSXIdentifier(element.name)) {
    result.errors.push({
      message: `Expected JSXIdentifier, but got ${element.name.type}`,
      node: element.name,
      severity: "error",
    });
    return;
  }
  const tagName = element.name.name;
  if (tagName !== "View") {
    result.errors.push({
      message: `Expected <View>, but got <${tagName}>`,
      node: element.name,
      severity: "error",
    });
    return;
  }

  for (const attr of element.attributes) {
    if (t.isJSXSpreadAttribute(attr)) {
      result.errors.push({
        message: "Spread attributes are not supported in <eo-view>",
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
    const name = attr.name.name;
    switch (name) {
      case "title":
        if (t.isStringLiteral(attr.value)) {
          result.title = attr.value.value;
        } else {
          result.errors.push({
            message: `"title" attribute in <eo-view> expects a string literal, but got ${attr.value?.type}`,
            node: attr.value ?? attr,
            severity: "error",
          });
        }
        break;
      default:
        result.errors.push({
          message: `Unsupported attribute "${name}" in <eo-view>`,
          node: attr.name,
          severity: "notice",
        });
    }
  }

  if (!result.title) {
    result.errors.push({
      message: `"title" attribute is required in <eo-view>`,
      node: element.name,
      severity: "warning",
    });
  }

  const components = constructComponents(node.children, result, options);
  result.components.push(...components);
}
