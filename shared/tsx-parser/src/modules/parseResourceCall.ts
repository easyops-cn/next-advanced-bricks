import type { NodePath } from "@babel/traverse";
import type * as t from "@babel/types";
import type {
  DataSource,
  DataSourceConfig,
  ParseJsValueOptions,
  ParsedApp,
  ParsedModule,
} from "./interfaces.js";
import { parseCallApi } from "./parseCallApi.js";
import { replaceBindings } from "./replaceBindings.js";

export function parseResourceCall(
  path: NodePath<t.Expression>,
  state: ParsedModule,
  app: ParsedApp,
  options: ParseJsValueOptions,
  name: string,
  config?: DataSourceConfig,
  transformArgs?: NodePath<
    t.Expression | t.SpreadElement | t.ArgumentPlaceholder
  >[],
  method?: "then" | "catch"
): DataSource | null {
  const payload = parseCallApi(path, state, app, options);
  if (!payload) {
    return null;
  }
  state.contracts.add(payload.api);
  const dataSource: DataSource = {
    name,
    config,
    ...payload,
  };

  if (transformArgs && method) {
    if (method === "catch") {
      if (transformArgs.length !== 1) {
        state.errors.push({
          message: `".catch()" expects exactly 1 argument, but got ${transformArgs.length}`,
          node: transformArgs.length > 0 ? transformArgs[1].node : path.node,
          severity: "error",
        });
        return null;
      }
    } else {
      if (transformArgs.length === 0 || transformArgs.length > 2) {
        state.errors.push({
          message: `".then()" expects 1 or 2 arguments, but got ${transformArgs.length}`,
          node: transformArgs.length > 2 ? transformArgs[2].node : path.node,
          severity: "error",
        });
        return null;
      }
    }

    const transform = parsePromiseCallback(
      transformArgs[0],
      state,
      app,
      options,
      method
    );
    if (transform) {
      dataSource[method === "catch" ? "rejectTransform" : "transform"] =
        transform;
    }
    if (method !== "catch" && transformArgs.length > 1) {
      const rejectTransform = parsePromiseCallback(
        transformArgs[1],
        state,
        app,
        options,
        method
      );
      if (rejectTransform) {
        dataSource.rejectTransform = rejectTransform;
      }
    }
  }

  return dataSource;
}

function parsePromiseCallback(
  callback: NodePath<t.ArgumentPlaceholder | t.SpreadElement | t.Expression>,
  state: ParsedModule,
  app: ParsedApp,
  options: ParseJsValueOptions,
  method: "then" | "catch"
): string | null {
  if (!callback.isArrowFunctionExpression()) {
    state.errors.push({
      message: `".${method}()" callback expects an arrow function, but got ${callback.type}`,
      node: callback.node,
      severity: "error",
    });
    return null;
  }
  const body = callback.get("body");
  if (!body.isExpression()) {
    state.errors.push({
      message: `".${method}()" callback function body expects an expression, but got ${body.type}`,
      node: body.node,
      severity: "error",
    });
    return null;
  }
  const params = callback.get("params");
  if (params.length > 1) {
    state.errors.push({
      message: `".${method}()" callback function expects exactly 0 or 1 parameter, but got ${params.length}`,
      node: params[1]?.node ?? callback,
      severity: "error",
    });
    return null;
  }
  const optionsWithData: ParseJsValueOptions = {
    ...options,
    dataBinding: undefined,
  };
  const arg = params[0];
  if (params.length > 0) {
    if (!arg.isIdentifier()) {
      state.errors.push({
        message: `".${method}()" callback function parameter expects an identifier, but got ${arg.type}`,
        node: arg.node,
        severity: "error",
      });
      return null;
    }
    optionsWithData.dataBinding = { id: arg.node };
  }
  return replaceBindings(body, state, app, optionsWithData);
}
