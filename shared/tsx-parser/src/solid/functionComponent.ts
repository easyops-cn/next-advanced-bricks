import * as t from "@babel/types";
import type {
  DataSource,
  ParseOptions,
  ParseResult,
  Variable,
} from "../interfaces.js";
import { constructJsValue } from "../tsx-constructors/values.js";
import { constructTsxView } from "../tsx-constructors/view.js";
import { constructComponents } from "../tsx-constructors/components.js";

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

    result.templateCollection = { identifiers, setters };

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
                if (t.isIdentifier(dec.id.elements[0])) {
                  const varName = dec.id.elements[0].name;
                  identifiers.push(varName);
                  if (t.isIdentifier(dec.id.elements[1])) {
                    setters.set(dec.id.elements[1].name, varName);
                  }
                }
              }
              break;
            case "use":
              if (t.isIdentifier(dec.id)) {
                identifiers.push(dec.id.name);
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
              case "useState":
                if (
                  t.isArrayPattern(dec.id) &&
                  t.isIdentifier(dec.id.elements[0])
                ) {
                  const varName = dec.id.elements[0].name;
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
                }
                continue;
              case "use":
                continue;
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
    }
  }

  result.errors.push({
    message: `Component function declaration must have a return statement returning a JSX element`,
    node: fn,
    severity: "error",
  });
}
