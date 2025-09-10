import * as t from "@babel/types";
import type { ConstructJsValueOptions } from "./interfaces.js";
import type { Component, ParseResult, ParseOptions } from "../interfaces.js";
import { constructChildren } from "./children.js";

export function constructComponents(
  nodes: t.Node[],
  result: ParseResult,
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
