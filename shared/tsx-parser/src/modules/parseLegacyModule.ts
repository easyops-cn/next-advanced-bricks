import type { ParseResult as BabelParseResult } from "@babel/parser";
import BabelTraverse from "@babel/traverse";
import type { NodePath } from "@babel/traverse";
import type * as t from "@babel/types";
import type {
  BindingInfo,
  BindingMap,
  ParsedApp,
  ParsedComponent,
  ParseJsValueOptions,
  ParseModuleOptions,
  ParsedModule,
  ModulePartOfComponent,
} from "./interfaces.js";
import { parseChildren } from "./parseChildren.js";
import { parseJsValue } from "./parseJsValue.js";
import { getViewTitle } from "./getViewTitle.js";
import type { ParseError } from "../interfaces.js";

const traverse =
  process.env.NODE_ENV === "test"
    ? BabelTraverse
    : (BabelTraverse as unknown as { default: typeof BabelTraverse }).default;

export function parseLegacyModule(
  filePath: string,
  app: ParsedApp,
  ast: BabelParseResult<t.File>,
  options?: ParseModuleOptions
): void {
  const errors: ParseError[] = [];
  if (ast.errors?.length) {
    for (const error of ast.errors) {
      errors.push({
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
  const file = app.files.find((f) => f.filePath === filePath)!;
  const mod: ParsedModule = {
    source: file.content,
    filePath,
    moduleType: "entry",
    defaultExport: {
      type: "view",
      component,
    },
    internals: [],
    namedExports: new Map(),
    errors: errors,
    contracts: new Set(),
    usedHelpers: new Set(),
  };

  traverse(ast, {
    Program(path) {
      const body = path.get("body");
      let exported = false;
      for (const stmt of body) {
        if (stmt.isVariableDeclaration()) {
          if (exported) {
            errors.push({
              message: `Unexpected variable declaration after export`,
              node: stmt.node,
              severity: "error",
            });
            continue;
          }
          if (stmt.node.kind !== "const") {
            errors.push({
              message: `Only "const" variable declaration is allowed, received: ${stmt.node.kind}`,
              node: stmt.node,
              severity: "error",
            });
            continue;
          }
          for (const decl of stmt.get("declarations")) {
            const declId = decl.get("id");
            if (!declId.isIdentifier()) {
              errors.push({
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
                mod,
                app,
                globalOptions
              );
            }
            bindingMap.set(declId.node, binding);
          }
        } else if (stmt.isExportDefaultDeclaration()) {
          exported = true;
          const decl = stmt.get("declaration");
          if (!decl.isJSXElement()) {
            errors.push({
              message: `Default export must be a JSX element, received: ${decl.type}`,
              node: stmt.node,
              severity: "error",
            });
          } else {
            component.children = parseChildren(decl, mod, app, globalOptions);
          }
          break;
        }
      }

      path.stop();
    },
  });

  (mod.defaultExport as ModulePartOfComponent).title = getViewTitle(component);

  app.modules.set(filePath, mod);
  app.entry = mod;
}
