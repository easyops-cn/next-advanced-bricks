import { parse, type ParseResult } from "@babel/parser";
import * as t from "@babel/types";
import type {
  Component,
  ConstructResult,
  DataSource,
  ParseError,
  ParseJsxOptions,
  Variable,
} from "./interfaces.js";
import { constructJsValue } from "./tsx-constructors/values.js";
import { constructTsxView } from "./tsx-constructors/view.js";
import { parseTsxCallApi } from "./tsx-constructors/api.js";
import { replaceVariables } from "./tsx-constructors/replaceVariables.js";

export function parseTsx(source: string, options?: ParseJsxOptions) {
  const dataSources: DataSource[] = [];
  const variables: Variable[] = [];
  const components: Component[] = [];
  const errors: ParseError[] = [];
  let title: string | undefined;
  const componentsMap = new Map<string, Component>();
  const contexts: string[] = [];
  const contracts = new Set<string>();
  const result: ConstructResult = {
    source,
    title,
    dataSources,
    variables,
    components,
    componentsMap,
    errors,
    contexts,
    contracts,
  };

  let ast: ParseResult<t.File> | undefined;
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
  }

  if (ast?.errors?.length) {
    for (const error of ast.errors) {
      errors.push({
        message: `${error.code}: ${error.reasonCode}`,
        node: null,
        severity: "error",
      });
    }
  }

  function parseDataSourceCall(
    call: t.Expression,
    name: string,
    transformArgs?: t.CallExpression["arguments"]
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
      if (transformArgs.length !== 1) {
        errors.push({
          message: `"callApi().then()" expects exactly 1 argument, but got ${transformArgs.length}`,
          node: call,
          severity: "error",
        });
        return false;
      }
      const transform = transformArgs[0];
      if (!t.isArrowFunctionExpression(transform)) {
        errors.push({
          message: `"callApi().then()" expects an arrow function, but got ${transform.type}`,
          node: transform,
          severity: "error",
        });
        return false;
      }
      if (!t.isExpression(transform.body)) {
        errors.push({
          message: `"callApi().then()" function body expects an expression, but got ${transform.body.type}`,
          node: transform.body,
          severity: "error",
        });
        return false;
      }
      if (transform.params.length !== 1) {
        errors.push({
          message: `"callApi().then()" function expects exactly one parameter, but got ${transform.params.length}`,
          node: transform.params[1] ?? transform,
          severity: "error",
        });
        return false;
      }
      const arg = transform.params[0];
      if (!t.isIdentifier(arg)) {
        errors.push({
          message: `"callApi().then()" function parameter expects an identifier, but got ${arg.type}`,
          node: arg,
          severity: "error",
        });
        return false;
      }
      const expr = `<% ${source.substring(transform.body.start!, transform.body.end!)} %>`;
      dataSource.transform = replaceVariables(
        expr,
        new Map([[arg.name, "DATA"]])
      );
    }

    dataSources.push(dataSource);
  }

  const body = ast?.program.body ?? [];

  if (ast) {
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
  }

  for (const stmt of body) {
    if (t.isVariableDeclaration(stmt)) {
      for (const dec of stmt.declarations) {
        if (t.isIdentifier(dec.id)) {
          contexts.push(dec.id.name);
        }
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
      if (stmt.declarations.length !== 1) {
        errors.push({
          message: `Expect exactly 1 declaration in a variable declaration statement, received ${stmt.declarations.length}`,
          node: stmt,
          severity: "error",
        });
        continue;
      }
      const dec = stmt.declarations[0];
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
            !t.isIdentifier(callee.property) ||
            callee.computed ||
            callee.property.name !== "then"
          ) {
            errors.push({
              message: `Unexpected awaited expression`,
              node: callee.property,
              severity: "error",
            });
          }
          parseDataSourceCall(callee.object, name, call.arguments);
        } else {
          parseDataSourceCall(call, name);
        }
      } else {
        const value = constructJsValue(dec.init, result, {
          allowExpression: true,
        });
        variables.push({ name, value });
      }
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
    } else {
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
