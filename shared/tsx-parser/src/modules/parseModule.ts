import type { ParseResult as BabelParseResult } from "@babel/parser";
import BabelTraverse from "@babel/traverse";
import type { NodePath } from "@babel/traverse";
import type * as t from "@babel/types";
import { parseComponent } from "./parseComponent.js";
import type {
  ModulePart,
  ParsedApp,
  ParseJsValueOptions,
  ParseModuleOptions,
  ParsedModule,
} from "./interfaces.js";
import { parseFunction } from "./parseFunction.js";
import { validateGlobalApi } from "./validations.js";
import { parseChildren } from "./parseChildren.js";
import { parseFile } from "./parseFile.js";
import { resolveImportSource } from "./resolveImportSource.js";
import { getViewTitle } from "./getViewTitle.js";

const traverse =
  process.env.NODE_ENV === "test"
    ? BabelTraverse
    : (BabelTraverse as unknown as { default: typeof BabelTraverse }).default;

enum FunctionScope {
  TopLevelStatement = "top level statement",
  NamedExportDeclaration = "named export declaration",
  DefaultExportDeclaration = "default export declaration",
}

export function parseModule(
  mod: ParsedModule,
  app: ParsedApp,
  ast: BabelParseResult<t.File>,
  options?: ParseModuleOptions
): void {
  const functionBindings = new Set<t.Identifier>();
  const componentBindings = new Set<t.Identifier>();
  const contextBindings = new Set<t.Identifier>();
  const globalOptions: ParseJsValueOptions = {
    functionBindings,
    componentBindings,
    contextBindings,
    stateBindings: options?.withContexts,
  };

  traverse(ast, {
    Program(path) {
      const body = path.get("body");
      const functionNodes: Array<{
        func: NodePath<t.FunctionDeclaration>;
        exported?: boolean;
      }> = [];
      const variableDeclarations: Array<{
        decl: NodePath<t.VariableDeclaration>;
        exported?: boolean;
      }> = [];
      let defaultExportNode: NodePath<t.FunctionDeclaration> | null = null;
      let renderNode: NodePath<t.Node> | null = null;
      const imports: string[] = [];

      const collectFunctions = (
        stmt: NodePath<t.Node | null | undefined>,
        scope: FunctionScope
      ) => {
        if (stmt.isFunctionDeclaration()) {
          const id = stmt.node.id;
          if (id) {
            if (isComponent(id)) {
              componentBindings.add(id);
            } else {
              functionBindings.add(id);
            }
          }
          if (scope === FunctionScope.DefaultExportDeclaration) {
            if (app.appType === "app" && mod.moduleType === "entry") {
              mod.errors.push({
                message: `The entry module in an app cannot have a default export declaration.`,
                node: stmt.node,
                severity: "error",
              });
            } else {
              defaultExportNode = stmt;
            }
            return;
          }
          if (!id) {
            mod.errors.push({
              message: `Function declaration must have a name`,
              node: stmt.node,
              severity: "error",
            });
            return;
          }
          functionNodes.push({
            func: stmt,
            exported: scope === FunctionScope.NamedExportDeclaration,
          });
        } else if (stmt.isVariableDeclaration()) {
          if (scope === FunctionScope.DefaultExportDeclaration) {
            mod.errors.push({
              message: `Default export declaration must be a function declaration.`,
              node: stmt.node,
              severity: "error",
            });
            return;
          }
          variableDeclarations.push({
            decl: stmt,
            exported: scope === FunctionScope.NamedExportDeclaration,
          });
        } else if (stmt.isExportDefaultDeclaration()) {
          const decl = stmt.get("declaration");
          collectFunctions(decl, FunctionScope.DefaultExportDeclaration);
        } else if (stmt.isExportNamedDeclaration()) {
          const decl = stmt.get("declaration");
          collectFunctions(decl, FunctionScope.NamedExportDeclaration);
        } else if (stmt.isImportDeclaration()) {
          const importSource = stmt.node.source.value;
          if (importSource.startsWith(".") || importSource.startsWith("/")) {
            imports.push(importSource);
          }
        } else if (
          !stmt.isTSInterfaceDeclaration &&
          !stmt.isTSTypeAliasDeclaration()
        ) {
          mod.errors.push({
            message: `Unsupported ${scope} type: ${stmt.type}`,
            node: stmt.node,
            severity: "error",
          });
        }
      };

      for (const stmt of body) {
        if (
          app.appType === "app" &&
          mod === app.entry &&
          stmt.isExpressionStatement()
        ) {
          const expr = stmt.get("expression");
          if (expr.isCallExpression()) {
            const callee = expr.get("callee");
            if (callee.isIdentifier() && validateGlobalApi(callee, "render")) {
              const args = expr.get("arguments");
              if (args.length !== 1) {
                mod.errors.push({
                  message: `render() expects exactly one argument, received: ${args.length}`,
                  node: expr.node,
                  severity: "error",
                });
                continue;
              }
              renderNode = args[0];
              continue;
            }
          }
        }

        collectFunctions(stmt, FunctionScope.TopLevelStatement);
      }

      for (const { decl, exported } of variableDeclarations) {
        if (decl.node.kind !== "const") {
          mod.errors.push({
            message: `Global variables must be declared with const.`,
            node: decl.node,
            severity: "error",
          });
          continue;
        }
        for (const declarator of decl.get("declarations")) {
          const init = declarator.get("init");
          if (!init.isCallExpression()) {
            mod.errors.push({
              message: `Global variables must be initialized with a call expression, but got: ${init.type}`,
              node: init.node,
              severity: "error",
            });
            continue;
          }
          const callee = init.get("callee");
          if (!callee.isIdentifier()) {
            mod.errors.push({
              message: `Unsupported variable initializer type: ${callee.type}`,
              node: callee.node,
              severity: "error",
            });
            continue;
          }
          if (!validateGlobalApi(callee, "createContext")) {
            mod.errors.push({
              message: `Global variables must be initialized with createContext, but got: ${callee.node.name}`,
              node: callee.node,
              severity: "error",
            });
            continue;
          }

          const id = declarator.get("id");
          if (!id.isIdentifier()) {
            mod.errors.push({
              message: `Unsupported context identifier type: ${id.type}`,
              node: id.node,
              severity: "error",
            });
            continue;
          }
          const part: ModulePart = {
            type: "context",
            context: id.node.name,
          };
          contextBindings.add(id.node);
          if (exported) {
            mod.namedExports.set(id.node.name, part);
          } else {
            mod.internals.push(part);
          }
        }
      }

      for (const importSource of imports) {
        parseFile(
          resolveImportSource(importSource, mod.filePath, app.files),
          app,
          undefined,
          options
        );
      }

      for (const { func: item, exported } of functionNodes) {
        const id = item.node.id!;
        if (isComponent(id)) {
          const type =
            app.appType === "app" && mod.moduleType === "entry"
              ? "page"
              : "template";
          const component = parseComponent(item, mod, app, type, globalOptions);
          if (component) {
            const part: ModulePart = {
              type,
              component,
            };
            if (exported) {
              mod.namedExports.set(id.name, part);
            } else {
              mod.internals.push(part);
            }
          }
        } else {
          const func = parseFunction(item, mod, globalOptions);
          if (func) {
            const part: ModulePart = {
              type: "function",
              function: func,
            };
            if (exported) {
              mod.namedExports.set(id.name, part);
            } else {
              mod.internals.push(part);
            }
          }
        }
      }

      if (defaultExportNode) {
        const type =
          mod.moduleType === "entry"
            ? app.appType === "template"
              ? "template"
              : "view"
            : mod.moduleType === "page"
              ? "page"
              : "template";
        const component = parseComponent(
          defaultExportNode,
          mod,
          app,
          type,
          globalOptions
        );
        if (component) {
          mod.defaultExport = {
            type,
            component,
            ...(type === "view" ? { title: getViewTitle(component) } : {}),
          };
        }
      }

      if (renderNode) {
        const children = parseChildren(renderNode, mod, app, globalOptions);
        mod.render = { type: "render", children };
      }

      path.stop();
    },
  });
}

/**
 * Checks if a given identifier is a component.
 *
 * Convention: components have names starting with uppercase letter
 * e.g. MyComponent, HelloWorld
 * functions have names starting with lowercase letter
 * e.g. myFunction, helloWorld
 */
function isComponent(id: t.Identifier) {
  return id.name[0] >= "A" && id.name[0] <= "Z";
}
