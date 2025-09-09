import * as t from "@babel/types";
import type {
  Component,
  ConstructJsValueOptions,
  ConstructResult,
  ParseTsxOptions,
} from "@next-shared/tsx-types";
import { constructChildren } from "./children.js";

export function constructComponents(
  nodes: t.Node[],
  result: ConstructResult,
  options?: ParseTsxOptions,
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
