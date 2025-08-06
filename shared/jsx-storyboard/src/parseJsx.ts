import { parse, type ParseResult } from "@babel/parser";
import * as t from "@babel/types";
import { DEFINE_DATA_SOURCE, DEFINE_VARIABLE } from "./schemas.js";
import type {
  Component,
  ConstructResult,
  DataSource,
  ParseError,
  ParseJsxOptions,
  Variable,
} from "./interfaces.js";
import { constructJsValue } from "./constructors/values.js";
import { constructView } from "./constructors/view.js";
import { isExpressionString } from "./utils.js";

export function parseJsx(source: string, options?: ParseJsxOptions) {
  const dataSources: DataSource[] = [];
  const variables: Variable[] = [];
  const components: Component[] = [];
  const errors: ParseError[] = [];
  let title: string | undefined;
  const componentsMap = new Map<string, Component>();
  const result: ConstructResult = {
    source,
    title,
    dataSources,
    variables,
    components,
    componentsMap,
    errors,
  };

  let ast: ParseResult<t.File> | undefined;
  try {
    ast = parse(source, {
      plugins: ["jsx"],
      sourceType: "module",
      errorRecovery: true,
    });
  } catch (error) {
    errors.push({
      message: `Failed to parse JSX: ${error}`,
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

  for (const stmt of ast?.program.body ?? []) {
    if (t.isExpressionStatement(stmt)) {
      const expr = stmt.expression;
      if (t.isCallExpression(expr)) {
        if (t.isIdentifier(expr.callee)) {
          if (expr.callee.name === DEFINE_VARIABLE) {
            const missingArgs = expr.arguments.length < 1;
            if (missingArgs || expr.arguments.length > 2) {
              errors.push({
                message: `"${DEFINE_VARIABLE}()" expects one or two arguments, but got ${expr.arguments.length}`,
                node: expr,
                severity: missingArgs ? "error" : "notice",
              });
              if (missingArgs) {
                continue;
              }
            }
            const varName = expr.arguments[0];
            if (!t.isStringLiteral(varName)) {
              errors.push({
                message: `"${DEFINE_VARIABLE}()" expects a string literal as the first argument, but got ${varName.type}`,
                node: varName,
                severity: "error",
              });
              continue;
            }
            const name = varName.value;

            if (expr.arguments.length === 2) {
              const value = constructJsValue(expr.arguments[1], result, {
                allowExpression: true,
              });
              variables.push({ name, value });
            } else {
              variables.push({ name });
            }
          } else if (expr.callee.name === DEFINE_DATA_SOURCE) {
            const missingArgs = expr.arguments.length < 2;
            if (missingArgs || expr.arguments.length > 2) {
              errors.push({
                message: `"${DEFINE_DATA_SOURCE}()" expects two arguments, but got ${expr.arguments.length}`,
                node: expr,
                severity: missingArgs ? "error" : "notice",
              });
              if (missingArgs) {
                continue;
              }
            }
            const dataSourceName = expr.arguments[0];
            if (!t.isStringLiteral(dataSourceName)) {
              errors.push({
                message: `"${DEFINE_DATA_SOURCE}()" expects a string literal as the first argument, but got ${dataSourceName.type}`,
                node: dataSourceName,
                severity: "error",
              });
              continue;
            }
            const dataSourceConfig = expr.arguments[1];
            if (!t.isObjectExpression(dataSourceConfig)) {
              errors.push({
                message: `"${DEFINE_DATA_SOURCE}()" expects an object literal as the second argument, but got ${dataSourceConfig.type}`,
                node: dataSourceConfig,
                severity: "error",
              });
              continue;
            }

            const dataSource = {
              name: dataSourceName.value,
            } as DataSource;
            for (const prop of dataSourceConfig.properties) {
              if (!t.isObjectProperty(prop)) {
                errors.push({
                  message: `Unsupported property type in data source config: ${prop.type}`,
                  node: prop,
                  severity: "error",
                });
                continue;
              }
              if (prop.computed || prop.shorthand) {
                errors.push({
                  message:
                    "Computed properties and shorthand properties are not supported in data source config",
                  node: prop,
                  severity: "error",
                });
                continue;
              }
              let key: string;
              if (t.isIdentifier(prop.key)) {
                key = prop.key.name;
              } else if (t.isStringLiteral(prop.key)) {
                key = prop.key.value;
              } else {
                errors.push({
                  message: `Unsupported object key type in data source config: ${prop.key.type}`,
                  node: prop.key,
                  severity: "error",
                });
                continue;
              }

              switch (key) {
                case "api":
                  if (!t.isStringLiteral(prop.value)) {
                    errors.push({
                      message: `Data source "api" expects a string literal, but got ${prop.value.type}`,
                      node: prop.value,
                      severity: "error",
                    });
                    continue;
                  }
                  dataSource.api = prop.value.value;
                  break;
                case "objectId":
                  if (!t.isStringLiteral(prop.value)) {
                    errors.push({
                      message: `Data source "objectId" expects a string literal, but got ${prop.value.type}`,
                      node: prop.value,
                      severity: "error",
                    });
                    continue;
                  }
                  dataSource.objectId = prop.value.value;
                  break;
                case "params":
                  if (!isNilNode(prop.value)) {
                    if (!t.isObjectExpression(prop.value)) {
                      errors.push({
                        message: `Data source "params" prefers an object literal, but got ${prop.value.type}`,
                        node: prop.value,
                        severity: "notice",
                      });
                    }
                    const params = constructJsValue(prop.value, result, {
                      allowExpression: true,
                    });
                    if (
                      isExpressionString(params) ||
                      (typeof params === "object" && params !== null)
                    ) {
                      dataSource.params = params as
                        | string
                        | Record<string, unknown>;
                    } else {
                      errors.push({
                        message: `Data source "params" expects an object or expression, but got ${typeof params}`,
                        node: prop.value,
                        severity: "error",
                      });
                    }
                    if (options?.reward) {
                      dataSource.ambiguousParams = constructJsValue(
                        prop.value,
                        {
                          ...result,
                          // Ignore errors in ambiguous params
                          errors: [],
                        },
                        {
                          allowExpression: true,
                          disallowArrowFunction: true,
                          ambiguous: true,
                        }
                      );
                    }
                  }
                  break;
                case "transform":
                  if (!isNilNode(prop.value)) {
                    if (!t.isArrowFunctionExpression(prop.value)) {
                      errors.push({
                        message: `Data source "transform" expects an arrow function, but got ${prop.value.type}`,
                        node: prop.value,
                        severity: "error",
                      });
                      continue;
                    }
                    if (!t.isExpression(prop.value.body)) {
                      errors.push({
                        message: `"transform" function body expects an expression, but got ${prop.value.body.type}`,
                        node: prop.value.body,
                        severity: "error",
                      });
                      continue;
                    }
                    if (prop.value.params.length !== 1) {
                      errors.push({
                        message: `"transform" function expects exactly one parameter, but got ${prop.value.params.length}`,
                        node: prop.value.params[1] ?? prop.value,
                        severity: "error",
                      });
                      continue;
                    }
                    const arg = prop.value.params[0];
                    if (!t.isIdentifier(arg)) {
                      errors.push({
                        message: `"transform" function parameter expects an identifier, but got ${arg.type}`,
                        node: arg,
                        severity: "error",
                      });
                      continue;
                    }
                    if (arg.name !== "DATA") {
                      errors.push({
                        message: `"transform" function parameter expects named "DATA", but got "${arg.name}"`,
                        node: arg,
                        severity: "error",
                      });
                      continue;
                    }
                    dataSource.transform = `<% ${source.substring(prop.value.body.start!, prop.value.body.end!)} %>`;
                  }
                  break;
              }
            }
            if (dataSource.api) {
              dataSources.push(dataSource);
            } else {
              errors.push({
                message: `"${DEFINE_DATA_SOURCE}()" requires "api" property in the second argument`,
                node: dataSourceConfig,
                severity: "error",
              });
            }
          }
        }
      }
    } else if (t.isExportDefaultDeclaration(stmt)) {
      const declaration = stmt.declaration;
      if (!t.isJSXElement(declaration)) {
        errors.push({
          message: `Exported default declaration must be a JSX element, but got ${declaration.type}`,
          node: declaration,
          severity: "error",
        });
        continue;
      }

      constructView(declaration, result, options);
    } else {
      errors.push({
        message: `Unsupported statement type: ${stmt.type}`,
        node: stmt,
        severity: "error",
      });
      continue;
    }
  }

  return result;
}

function isNilNode(node: t.Node) {
  return (
    t.isNullLiteral(node) || (t.isIdentifier(node) && node.name === "undefined")
  );
}
