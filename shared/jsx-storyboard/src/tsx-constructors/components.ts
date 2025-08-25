import * as t from "@babel/types";
import type {
  Component,
  ConstructJsValueOptions,
  ConstructResult,
  ParseJsxOptions,
} from "../interfaces.js";
import { constructChildren } from "./children.js";

export function constructComponents(
  nodes: Array<
    | t.JSXElement
    | t.JSXText
    | t.JSXExpressionContainer
    | t.JSXFragment
    | t.JSXSpreadChild
  >,
  result: ConstructResult,
  options?: ParseJsxOptions,
  valueOptions?: ConstructJsValueOptions
): Component[] {
  const { textContent, children } = constructChildren(
    nodes,
    result,
    options,
    valueOptions
  );

  return (
    children ?? [
      {
        name: "Plaintext",
        properties: {
          textContent,
        },
      },
    ]
  );
}
