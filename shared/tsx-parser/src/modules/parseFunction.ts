import type { NodePath } from "@babel/traverse";
import type * as t from "@babel/types";
import type { StoryboardFunction } from "@next-core/types";
import type {
  ParseJsValueOptions,
  ParsedApp,
  ParsedModule,
} from "./interfaces.js";
import { replaceBindings } from "./replaceBindings.js";

export function parseFunction(
  fn: NodePath<t.FunctionDeclaration>,
  state: ParsedModule,
  app: ParsedApp,
  options: ParseJsValueOptions
): StoryboardFunction | null {
  const transformedSource = replaceBindings(fn, state, app, options, true);

  if (!transformedSource) {
    return null;
  }

  return {
    name: fn.node.id!.name,
    source: transformedSource,
    typescript: true,
  };
}
