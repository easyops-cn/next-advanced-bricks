import * as t from "@babel/types";
import type {
  DataSource,
  DataSourceConfig,
  ParseOptions,
  ParseResult,
  Variable,
} from "../interfaces.js";
import { constructJsValue } from "../tsx-constructors/values.js";
import { constructTsxView } from "../tsx-constructors/view.js";
import { constructComponents } from "../tsx-constructors/components.js";
import { parseDataSourceCall } from "../tsx-constructors/dataSource.js";

export function constructFunctionComponent(
  fn: t.FunctionDeclaration,
  result: ParseResult,
  scope: "view" | "template",
  options?: ParseOptions
) {
  if (fn.async || fn.generator) {
    result.errors.push({
      message: `Function declaration cannot be async or generator`,
      node: fn,
      severity: "error",
    });
    return;
  }

  if (scope === "template") {
    if (fn.params.length > 1) {
      result.errors.push({
        message: `Component function expects at most 1 parameter, but got ${fn.params.length}`,
        node: fn.params[1],
        severity: "error",
      });
      return;
    }
  } else if (fn.params.length > 0) {
    result.errors.push({
      message: `View function expects no parameter, but got ${fn.params.length}`,
      node: fn.params[0],
      severity: "error",
    });
    return;
  }

  let identifiers: string[];
  let setters: Map<string, string>;
  let variables: Variable[];
  let dataSources: DataSource[];

  if (scope === "template") {
    identifiers = [];
    setters = new Map();
    variables = [];
    dataSources = [];
    const events: string[] = [];

    result.templateCollection = { identifiers, setters, dataSources, events };

    const param = fn.params[0];
    if (param) {
      if (!t.isObjectPattern(param)) {
        result.errors.push({
          message: `Component function parameter expects an object pattern, but got ${param.type}`,
          node: param,
          severity: "error",
        });
        delete result.templateCollection;
        return;
      }

      for (const prop of param.properties) {
        if (t.isRestElement(prop)) {
          result.errors.push({
            message: `Component function parameter does not support rest element`,
            node: prop,
            severity: "error",
          });
          continue;
        }
        if (prop.computed || !prop.shorthand) {
          result.errors.push({
            message:
              "Unexpected computed or non-shorthand property in component function parameter",
            node: prop,
            severity: "error",
          });
          continue;
        }
        if (!t.isIdentifier(prop.key)) {
          result.errors.push({
            message: `Component function parameter property expects an identifier as key, but got ${prop.key.type}`,
            node: prop.key,
            severity: "error",
          });
          continue;
        }

        const varName = prop.key.name;
        const isEventHandler = /^on[A-Z]/.test(varName);

        if (isEventHandler) {
          if (!t.isIdentifier(prop.value)) {
            result.errors.push({
              message: `Event handler property "${varName}" expects an identifier as value, but got ${prop.value.type}`,
              node: prop.value,
              severity: "error",
            });
          }
          events.push(varName);
        } else {
          identifiers.push(varName);

          if (t.isAssignmentPattern(prop.value)) {
            const value = constructJsValue(prop.value.right, result, {
              allowExpression: true,
            });
            variables.push({ name: varName, value });
          } else {
            variables.push({ name: varName });
          }
        }
      }
    }
  } else {
    identifiers = result.contexts;
    setters = result.contextSetters;
    variables = result.variables;
    dataSources = result.dataSources;
  }

  for (const stmt of fn.body.body) {
    if (t.isVariableDeclaration(stmt)) {
      for (const dec of stmt.declarations) {
        if (t.isCallExpression(dec.init) && t.isIdentifier(dec.init.callee)) {
          switch (dec.init.callee.name) {
            case "useState":
              if (t.isArrayPattern(dec.id)) {
                const [firstArg, secondArg] = dec.id.elements;
                if (t.isIdentifier(firstArg)) {
                  const varName = firstArg.name;
                  identifiers.push(varName);
                  if (t.isIdentifier(secondArg)) {
                    setters.set(secondArg.name, varName);
                  }
                }
              }
              break;
            case "useResource":
              if (t.isArrayPattern(dec.id)) {
                const [firstArg] = dec.id.elements;
                if (t.isIdentifier(firstArg)) {
                  const varName = firstArg.name;
                  identifiers.push(varName);
                }
              }
              break;
          }
        } else if (t.isIdentifier(dec.id)) {
          identifiers.push(dec.id.name);
        }
      }
    }
  }

  for (const stmt of fn.body.body) {
    if (t.isVariableDeclaration(stmt)) {
      if (stmt.kind !== "const") {
        result.errors.push({
          message: `Unsupported variable declaration kind: ${stmt.kind}`,
          node: stmt,
          severity: "error",
        });
        continue;
      }

      for (const dec of stmt.declarations) {
        if (dec.init) {
          if (t.isCallExpression(dec.init) && t.isIdentifier(dec.init.callee)) {
            switch (dec.init.callee.name) {
              case "useState": {
                if (!t.isArrayPattern(dec.id)) {
                  result.errors.push({
                    message: `"useState()" return value must be destructured into an array pattern, received ${dec.id.type}`,
                    node: dec.id,
                    severity: "error",
                  });
                  continue;
                }
                const [firstArg, secondArg] = dec.id.elements;
                if (!t.isIdentifier(firstArg)) {
                  result.errors.push({
                    message: `"useState()" expects an identifier as the variable name, received ${firstArg?.type}`,
                    node: firstArg,
                    severity: "error",
                  });
                  continue;
                }
                if (secondArg && !t.isIdentifier(secondArg)) {
                  result.errors.push({
                    message: `"useState()" expects an identifier as the setter name, received ${secondArg.type}`,
                    node: secondArg,
                    severity: "error",
                  });
                  continue;
                }
                const varName = firstArg.name;
                const args = dec.init.arguments;
                if (args.length === 0) {
                  variables.push({ name: varName });
                } else {
                  if (args.length > 1) {
                    result.errors.push({
                      message: `"useState()" expects at most 1 argument, but got ${args.length}`,
                      node: dec.init,
                      severity: "error",
                    });
                  }
                  const value = constructJsValue(args[0], result, {
                    allowExpression: true,
                  });
                  variables.push({ name: varName, value });
                }
                continue;
              }
              case "useResource": {
                if (!t.isArrayPattern(dec.id)) {
                  result.errors.push({
                    message: `"useResource()" return value must be destructured into an array pattern, received ${dec.id.type}`,
                    node: dec.id,
                    severity: "error",
                  });
                  continue;
                }
                const [firstArg] = dec.id.elements;
                if (!t.isIdentifier(firstArg)) {
                  result.errors.push({
                    message: `"useResource()" expects an identifier as the variable name, received ${firstArg?.type}`,
                    node: firstArg,
                    severity: "error",
                  });
                  continue;
                }
                const varName = firstArg.name;
                const args = dec.init.arguments;
                if (args.length === 0 || args.length > 2) {
                  result.errors.push({
                    message: `"useResource()" expects 1 or 2 arguments, but got ${args.length}`,
                    node: dec.init,
                    severity: "error",
                  });
                }
                const resource = args[0];
                if (!t.isArrowFunctionExpression(resource)) {
                  result.errors.push({
                    message: `"useResource()" expects an arrow function as the argument, but got ${resource.type}`,
                    node: resource,
                    severity: "error",
                  });
                  continue;
                }
                if (resource.async || resource.generator) {
                  result.errors.push({
                    message: `"useResource()" argument function cannot be async or generator`,
                    node: resource,
                    severity: "error",
                  });
                  continue;
                }
                const call = resource.body;
                if (t.isBlockStatement(call)) {
                  result.errors.push({
                    message: `Block statement is not supported in "useResource()" argument function`,
                    node: call,
                    severity: "error",
                  });
                  continue;
                }

                if (!t.isCallExpression(call)) {
                  result.errors.push({
                    message: `"useResource()" argument function must return a call expression, but got ${call.type}`,
                    node: call,
                    severity: "error",
                  });
                  continue;
                }

                const { callee } = call;

                if (!(t.isIdentifier(callee) || t.isMemberExpression(callee))) {
                  result.errors.push({
                    message: `"useResource()" argument function must return a call to an identifier or member expression, but got ${callee.type}`,
                    node: callee,
                    severity: "error",
                  });
                  continue;
                }

                const resourceConfig = args[1];
                let config: DataSourceConfig | undefined;
                if (resourceConfig) {
                  if (!t.isObjectExpression(resourceConfig)) {
                    result.errors.push({
                      message: `"useResource()" second argument must be an object expression, but got ${resourceConfig.type}`,
                      node: resourceConfig,
                      severity: "error",
                    });
                    continue;
                  }
                  for (const prop of resourceConfig.properties) {
                    if (!t.isObjectProperty(prop)) {
                      result.errors.push({
                        message: `Unsupported property type in "useResource()" second argument: ${prop.type}`,
                        node: prop,
                        severity: "error",
                      });
                      continue;
                    }
                    const key = prop.key;
                    if (!t.isIdentifier(key)) {
                      result.errors.push({
                        message: `"useResource()" second argument property key must be an identifier, but got ${key.type}`,
                        node: key,
                        severity: "error",
                      });
                      continue;
                    }
                    if (prop.computed) {
                      result.errors.push({
                        message: `"useResource()" second argument property key cannot be computed`,
                        node: key,
                        severity: "error",
                      });
                      continue;
                    }
                    if (key.name !== "enabled" && key.name !== "fallback") {
                      result.errors.push({
                        message: `"useResource()" second argument property key must be "enabled" or "fallback", but got "${key.name}"`,
                        node: key,
                        severity: "error",
                      });
                      continue;
                    }
                    config ??= {};
                    config[key.name] = constructJsValue(prop.value, result, {
                      allowExpression: true,
                    });
                  }
                }

                if (t.isMemberExpression(callee)) {
                  if (
                    !t.isIdentifier(callee.property) ||
                    callee.computed ||
                    (callee.property.name !== "then" &&
                      callee.property.name !== "catch")
                  ) {
                    result.errors.push({
                      message: `Unexpected awaited expression`,
                      node: callee.property,
                      severity: "error",
                    });
                    continue;
                  }
                  parseDataSourceCall(
                    callee.object,
                    result,
                    options,
                    varName,
                    call.arguments,
                    callee.property.name,
                    config
                  );
                } else {
                  parseDataSourceCall(
                    call,
                    result,
                    options,
                    varName,
                    undefined,
                    undefined,
                    config
                  );
                }
                continue;
              }
            }
          }
        }

        if (!t.isIdentifier(dec.id)) {
          result.errors.push({
            message: `Expect an identifier as the variable name, received ${dec.id.type}`,
            node: dec.id,
            severity: "error",
          });
          continue;
        }

        const varName = dec.id.name;
        if (dec.init == null) {
          if (!dec.id.typeAnnotation) {
            result.errors.push({
              message: `Variable "${varName}" with no initial value must have a type annotation`,
              node: dec.id,
              severity: "error",
            });
          }
          variables.push({ name: varName });
        } else {
          const value = constructJsValue(dec.init, result, {
            allowExpression: true,
          });
          variables.push({ name: varName, value });
        }
      }
    } else if (t.isReturnStatement(stmt)) {
      if (!t.isJSXElement(stmt.argument)) {
        result.errors.push({
          message: `Exported default declaration must be a JSX element, but got ${stmt.argument?.type}`,
          node: stmt.argument,
          severity: "error",
        });
        return;
      }
      if (scope === "template") {
        const components = constructComponents(
          [stmt.argument],
          result,
          options
        );
        result.templates.push({
          name: fn.id!.name,
          variables,
          dataSources,
          components,
        });
        delete result.templateCollection;
        return;
      } else {
        constructTsxView(stmt.argument, result, options);
        return;
      }
    } else if (
      !(t.isTSInterfaceDeclaration(stmt) || t.isTSTypeAliasDeclaration(stmt))
    ) {
      result.errors.push({
        message: `Unsupported top level statement type: ${stmt.type}`,
        node: stmt,
        severity: "error",
      });
    }
  }

  result.errors.push({
    message: `Component function declaration must have a return statement returning a JSX element`,
    node: fn,
    severity: "error",
  });
}
