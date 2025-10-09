import type { NodePath } from "@babel/traverse";
import type * as t from "@babel/types";
import type {
  ComponentChild,
  ParseJsValueOptions,
  ParseModuleState,
} from "./interfaces.js";
import { parseLowLevelChildren } from "./parseLowLevelChildren.js";

export function parseChildren(
  path: NodePath<t.Node>,
  state: ParseModuleState,
  options: ParseJsValueOptions
): ComponentChild[] {
  const { textContent, children } = parseLowLevelChildren(
    [path],
    state,
    options
  );

  return (
    children ?? [
      {
        name: "Plaintext",
        properties: { textContent },
      },
    ]
  );
}
