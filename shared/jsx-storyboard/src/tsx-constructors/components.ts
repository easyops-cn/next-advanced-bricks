import * as t from "@babel/types";
import type {
  Component,
  ConstructJsValueOptions,
  ConstructResult,
  ParseJsxOptions,
} from "../interfaces.js";
import { constructChildren } from "./children.js";

export function constructComponents(
  nodes: t.Node[],
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
