import * as t from "@babel/types";
import type { ConstructJsValueOptions } from "./interfaces.js";
import type { Component, ParseState, ParseOptions } from "../interfaces.js";
import { constructChildren } from "./children.js";

export function constructComponents(
  nodes: t.Node[],
  result: ParseState,
  options?: ParseOptions,
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
