import type { ParseResult as BabelParseResult } from "@babel/parser";
import traverse, { type NodePath } from "@babel/traverse";
import type * as t from "@babel/types";
import { parseComponent } from "./parseComponent.js";
import type {
  ParsedModule,
  ParseJsValueOptions,
  ParseModuleOptions,
  ParseModuleState,
} from "./interfaces.js";
import { parseFunction } from "./parseFunction.js";

export function parseModule(
  source: string,
  ast: BabelParseResult<t.File>,
  options?: ParseModuleOptions
) {
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

  const parsed: ParsedModule = {
    source,
    filename: options?.filename,
    defaultExport: null,
    internalComponents: [],
    internalFunctions: [],
    errors: state.errors,
    contracts: state.contracts,
    usedHelpers: state.usedHelpers,
  };
  const functionBindings = new Set<t.Identifier>();
  const globalOptions: ParseJsValueOptions = {
    functionBindings,
    contextBindings: options?.withContexts,
  };

  traverse(ast, {
    Program(path) {
      const body = path.get("body");
      const functions: NodePath<t.FunctionDeclaration>[] = [];
      const internalComponents: NodePath<t.FunctionDeclaration>[] = [];
      let defaultExport: NodePath<t.FunctionDeclaration> | null = null;

      const collectFunctions = (
        stmt: NodePath<t.Statement | t.Declaration | null | undefined>,
        level: string
      ) => {
        if (stmt.isExportNamedDeclaration()) {
          const decl = stmt.get("declaration");
          collectFunctions(decl, "exported");
        } else if (stmt.isFunctionDeclaration()) {
          const id = stmt.node.id;
          if (!id) {
            state.errors.push({
              message: `Function declaration must have a name`,
              node: stmt.node,
              severity: "error",
            });
            return;
          }
          if (isTemplate(id)) {
            internalComponents.push(stmt);
          } else {
            functionBindings.add(id);
            functions.push(stmt);
          }
        } else if (stmt.isExportDefaultDeclaration()) {
          const decl = stmt.get("declaration");
          if (decl.isFunctionDeclaration()) {
            defaultExport = decl;
          } else {
            state.errors.push({
              message: `Expected function declaration as default export, but got ${decl.type}`,
              node: decl.node,
              severity: "error",
            });
          }
        } else if (
          !stmt.isTSInterfaceDeclaration &&
          !stmt.isTSTypeAliasDeclaration()
        ) {
          state.errors.push({
            message: `Unsupported ${level} statement type: ${stmt.type}`,
            node: stmt.node,
            severity: "error",
          });
        }
      };

      for (const stmt of body) {
        collectFunctions(stmt, "top level");
      }

      for (const fn of functions) {
        const func = parseFunction(fn, state, globalOptions);
        if (func) {
          parsed.internalFunctions.push(func);
        }
      }
      for (const ic of internalComponents) {
        const component = parseComponent(ic, state, "template", globalOptions);
        if (component) {
          parsed.internalComponents.push({ ...component, id: ic.node.id! });
        }
      }
      if (defaultExport) {
        const component = parseComponent(
          defaultExport,
          state,
          "view",
          globalOptions
        );
        if (component) {
          parsed.defaultExport = component;
        }
      }

      path.stop();
    },
  });

  return parsed;
}

function isTemplate(id: t.Identifier) {
  return id.name[0] >= "A" && id.name[0] <= "Z";
}
