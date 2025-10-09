import type { ParseResult as BabelParseResult } from "@babel/parser";
import BabelTraverse from "@babel/traverse";
import type { NodePath } from "@babel/traverse";
import type * as t from "@babel/types";
import type {
  BindingInfo,
  BindingMap,
  ParsedComponent,
  ParsedModule,
  ParseJsValueOptions,
  ParseModuleOptions,
  ParseModuleState,
} from "./interfaces.js";
import { parseChildren } from "./parseChildren.js";
import { parseJsValue } from "./parseJsValue.js";

const traverse =
  process.env.NODE_ENV === "test"
    ? BabelTraverse
    : (BabelTraverse as unknown as { default: typeof BabelTraverse }).default;

export function parseLegacyModule(
  source: string,
  ast: BabelParseResult<t.File>,
  options?: ParseModuleOptions
): ParsedModule {
  const state: ParseModuleState = {
    source,
    errors: [],
    usedHelpers: new Set(),
    contracts: new Set(),
  };

  if (ast.errors?.length) {
    for (const error of ast.errors) {
      state.errors.push({
        message: `${error.code}: ${error.reasonCode}`,
        node: null,
        severity: "error",
      });
    }
  }

  const bindingMap: BindingMap = new Map();
  const component: ParsedComponent = {
    type: "view",
    bindingMap,
  };
  const globalOptions: ParseJsValueOptions = {
    component,
    contextBindings: options?.withContexts,
  };
  const parsed: ParsedModule = {
    source,
    filename: options?.filename,
    defaultExport: component,
    internalComponents: [],
    internalFunctions: [],
    errors: state.errors,
    contracts: state.contracts,
    usedHelpers: state.usedHelpers,
  };

  traverse(ast, {
    Program(path) {
      const body = path.get("body");
      let exported = false;
      for (const stmt of body) {
        if (stmt.isVariableDeclaration()) {
          if (exported) {
            state.errors.push({
              message: `Unexpected variable declaration after export`,
              node: stmt.node,
              severity: "error",
            });
            continue;
          }
          if (stmt.node.kind !== "const") {
            state.errors.push({
              message: `Only "const" variable declaration is allowed, received: ${stmt.node.kind}`,
              node: stmt.node,
              severity: "error",
            });
            continue;
          }
          for (const decl of stmt.get("declarations")) {
            const declId = decl.get("id");
            if (!declId.isIdentifier()) {
              state.errors.push({
                message: `Unsupported variable declaration pattern, expected: Identifier, received: ${declId.type}`,
                node: declId.node,
                severity: "error",
              });
              continue;
            }

            const binding: BindingInfo = { id: declId.node, kind: "constant" };
            const init = decl.get("init");
            if (init.node) {
              binding.initialValue = parseJsValue(
                init as NodePath<t.Node>,
                state,
                globalOptions
              );
            }
            bindingMap.set(declId.node, binding);
          }
        } else if (stmt.isExportDefaultDeclaration()) {
          exported = true;
          const decl = stmt.get("declaration");
          if (!decl.isJSXElement()) {
            state.errors.push({
              message: `Default export must be a JSX element, received: ${decl.type}`,
              node: stmt.node,
              severity: "error",
            });
          } else {
            component.children = parseChildren(decl, state, globalOptions);
          }
          break;
        }
      }

      path.stop();
    },
  });

  return parsed;
}
