import { parse, type ParseResult as BabelParseResult } from "@babel/parser";
import * as t from "@babel/types";
import type { StoryboardFunction } from "@next-core/types";
import type {
  Component,
  ParseResult,
  DataSource,
  ParseError,
  ParseOptions,
  Variable,
} from "./interfaces.js";
import {
  constructJsValue,
  removeTypeAnnotations,
} from "./tsx-constructors/values.js";
import { constructTsxView } from "./tsx-constructors/view.js";
import { parseTsxCallApi } from "./tsx-constructors/api.js";
import {
  replaceGlobalsInFunction,
  replaceVariables,
} from "./tsx-constructors/replaceVariables.js";

export function parseTsx(source: string, options?: ParseOptions): ParseResult {
  const dataSources: DataSource[] = [];
  const variables: Variable[] = [];
  const components: Component[] = [];
  const errors: ParseError[] = [];
  let title: string | undefined;
  const componentsMap = new Map<string, Component>();
  const contexts: string[] = options?.withContexts ?? [];
  const functions: StoryboardFunction[] = [];
  const functionNames: string[] = [];
  const contracts = new Set<string>();
  const result: ParseResult = {
    source,
    title,
    dataSources,
    variables,
    components,
    componentsMap,
    errors,
    contexts,
    functionNames,
    functions,
    contracts,
  };

  let ast: BabelParseResult<t.File> | undefined;
  try {
    ast = parse(source, {
      plugins: ["jsx", "typescript"],
      sourceType: "module",
      errorRecovery: true,
    });
  } catch (error) {
    errors.push({
      message: `Failed to parse TSX: ${error}`,
      node: null,
      severity: "fatal",
    });

    return result;
  }

  if (ast.errors?.length) {
    for (const error of ast.errors) {
      errors.push({
        message: `${error.code}: ${error.reasonCode}`,
        node: null,
        severity: "error",
      });
    }
  }

  function parsePromiseCallback(
    callback: t.ArgumentPlaceholder | t.SpreadElement | t.Expression
  ): string | null {
    if (!t.isArrowFunctionExpression(callback)) {
      errors.push({
        message: `"callApi().then()" callback expects an arrow function, but got ${callback.type}`,
        node: callback,
        severity: "error",
      });
      return null;
    }
    if (!t.isExpression(callback.body)) {
      errors.push({
        message: `"callApi().then()" callback function body expects an expression, but got ${callback.body.type}`,
        node: callback.body,
        severity: "error",
      });
      return null;
    }
    if (callback.params.length > 1) {
      errors.push({
        message: `"callApi().then()" callback function expects exactly 0 or 1 parameter, but got ${callback.params.length}`,
        node: callback.params[1] ?? callback,
        severity: "error",
      });
      return null;
    }
    const exprSource = removeTypeAnnotations(source, callback.body);
    const expr = `<% ${exprSource} %>`;
    if (callback.params.length === 0) {
      return expr;
    }
    const arg = callback.params[0];
    if (!t.isIdentifier(arg)) {
      errors.push({
        message: `"callApi().then()" callback function parameter expects an identifier, but got ${arg.type}`,
        node: arg,
        severity: "error",
      });
      return null;
    }
    return replaceVariables(expr, new Map([[arg.name, "DATA"]]));
  }

  function parseDataSourceCall(
    call: t.Expression,
    name: string,
    transformArgs?: t.CallExpression["arguments"],
    method?: "then" | "catch"
  ) {
    const payload = parseTsxCallApi(call, result, options);
    if (!payload) {
      return null;
    }
    contracts.add(payload.api);
    const dataSource: DataSource = {
      name,
      ...payload,
    };

    if (transformArgs) {
      if (transformArgs.length > (method === "catch" ? 1 : 2)) {
        errors.push({
          message: `"callApi().${method}()" expects no more than 2 arguments, but got ${transformArgs.length}`,
          node: transformArgs[1],
          severity: "error",
        });
        return false;
      }
      if (transformArgs.length > 0) {
        const transform = parsePromiseCallback(transformArgs[0]);
        if (transform) {
          dataSource[method === "catch" ? "rejectTransform" : "transform"] =
            transform;
        }
      }
      if (method !== "catch" && transformArgs.length > 1) {
        const transform = parsePromiseCallback(transformArgs[1]);
        if (transform) {
          dataSource.rejectTransform = transform;
        }
      }
    }

    dataSources.push(dataSource);
  }

  const body = ast.program.body;

  t.traverse(ast.program, {
    enter(node) {
      if (t.isTSAnyKeyword(node)) {
        errors.push({
          message: `Unexpected 'any' type`,
          node,
          severity: "warning",
        });
      } else if (t.isTSAsExpression(node)) {
        errors.push({
          message: `Unexpected 'as' usage`,
          node,
          severity: "warning",
        });
      }
    },
  });

  for (const stmt of body) {
    if (t.isVariableDeclaration(stmt)) {
      for (const dec of stmt.declarations) {
        if (t.isIdentifier(dec.id)) {
          contexts.push(dec.id.name);
        }
      }
    } else if (t.isFunctionDeclaration(stmt)) {
      if (stmt.id) {
        functionNames.push(stmt.id.name);
      }
    }
  }

  let exported = false;
  for (const stmt of body) {
    if (t.isVariableDeclaration(stmt)) {
      if (exported) {
        errors.push({
          message: `Unexpected variable declaration after export`,
          node: stmt,
          severity: "error",
        });
      }
      if (stmt.kind !== "let" && stmt.kind !== "const") {
        errors.push({
          message: `Unsupported variable declaration kind: ${stmt.kind}`,
          node: stmt,
          severity: "error",
        });
        continue;
      }
      for (const dec of stmt.declarations) {
        if (!t.isIdentifier(dec.id)) {
          errors.push({
            message: `Expect an identifier as the variable name, received ${dec.id.type}`,
            node: dec.id,
            severity: "error",
          });
          continue;
        }

        const name = dec.id.name;
        if (dec.init == null) {
          if (!dec.id.typeAnnotation) {
            errors.push({
              message: `Variable "${name}" with no initial value must have a type annotation`,
              node: dec.id,
              severity: "error",
            });
          }
          variables.push({ name });
        } else if (t.isAwaitExpression(dec.init)) {
          const call = dec.init.argument;
          if (!t.isCallExpression(call)) {
            errors.push({
              message: `Await expression must be a call expression, received ${call.type}`,
              node: call,
              severity: "error",
            });
            continue;
          }
          const { callee } = call;
          if (!(t.isIdentifier(callee) || t.isMemberExpression(callee))) {
            errors.push({
              message: `Await expression must call an identifier or member expression, received ${callee.type}`,
              node: callee,
              severity: "error",
            });
            continue;
          }
          if (t.isMemberExpression(callee)) {
            if (
              t.isIdentifier(callee.object) &&
              callee.object.name === "Entity"
            ) {
              if (
                !t.isIdentifier(callee.property) ||
                callee.computed ||
                (callee.property.name !== "list" &&
                  callee.property.name !== "get")
              ) {
                errors.push({
                  message: `Unexpected awaited expression`,
                  node: callee.property,
                  severity: "error",
                });
                continue;
              }
              parseDataSourceCall(call, name);
            } else {
              if (
                !t.isIdentifier(callee.property) ||
                callee.computed ||
                (callee.property.name !== "then" &&
                  callee.property.name !== "catch")
              ) {
                errors.push({
                  message: `Unexpected awaited expression`,
                  node: callee.property,
                  severity: "error",
                });
                continue;
              }
              parseDataSourceCall(
                callee.object,
                name,
                call.arguments,
                callee.property.name
              );
            }
          } else {
            parseDataSourceCall(call, name);
          }
        } else {
          const value = constructJsValue(dec.init, result, {
            allowExpression: true,
          });
          variables.push({ name, value });
        }
      }
    } else if (t.isFunctionDeclaration(stmt)) {
      if (exported) {
        errors.push({
          message: `Unexpected function declaration after export`,
          node: stmt,
          severity: "error",
        });
      }
      if (stmt.async || stmt.generator) {
        errors.push({
          message: `Function declaration cannot be async or generator`,
          node: stmt,
          severity: "error",
        });
        continue;
      }
      if (!stmt.id) {
        errors.push({
          message: `Function declaration must have a name`,
          node: stmt,
          severity: "error",
        });
        continue;
      }
      functions.push({
        name: stmt.id.name,
        source: replaceGlobalsInFunction(
          source.slice(stmt.start!, stmt.end!),
          result,
          stmt.id.name
        ),
        typescript: true,
      });
    } else if (t.isExportDefaultDeclaration(stmt)) {
      exported = true;
      const declaration = stmt.declaration;
      if (!t.isJSXElement(declaration)) {
        errors.push({
          message: `Exported default declaration must be a JSX element, but got ${declaration.type}`,
          node: declaration,
          severity: "error",
        });
        continue;
      }

      constructTsxView(declaration, result, options);
    } else if (
      !(t.isTSInterfaceDeclaration(stmt) || t.isTSTypeAliasDeclaration(stmt))
    ) {
      errors.push({
        message: `Unsupported top level statement type: ${stmt.type}`,
        node: stmt,
        severity: "error",
      });
      continue;
    }
  }

  return result;
}
