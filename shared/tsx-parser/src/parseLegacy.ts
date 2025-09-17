import type { ParseResult as BabelParseResult } from "@babel/parser";
import * as t from "@babel/types";
import type { ParseResult, ParseOptions } from "./interfaces.js";
import { constructJsValue } from "./tsx-constructors/values.js";
import { constructTsxView } from "./tsx-constructors/view.js";
import { constructFunction } from "./tsx-constructors/function.js";
import { parseDataSourceCall } from "./tsx-constructors/dataSource.js";

export function parseLegacy(
  ast: BabelParseResult<t.File>,
  result: ParseResult,
  options?: ParseOptions
): void {
  const { errors, contexts, functionNames, variables } = result;

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

  for (const stmt of ast.program.body) {
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
  for (const stmt of ast.program.body) {
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
              parseDataSourceCall(call, result, options, name);
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
                result,
                options,
                name,
                call.arguments,
                callee.property.name
              );
            }
          } else {
            parseDataSourceCall(call, result, options, name);
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
      constructFunction(stmt, result);
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
    }
  }
}
