import type { ContextConf } from "@next-core/types";
import { isObject } from "@next-core/utils/general";
import type { DataSource } from "@next-shared/tsx-parser";

export function convertDataSources(dataSources: DataSource[]): ContextConf[] {
  return dataSources.map(
    ({
      name,
      http,
      api,
      params,
      tool,
      transform,
      rejectTransform,
      config,
      scope,
    }) => {
      const hasEnabled =
        config && Object.prototype.hasOwnProperty.call(config, "enabled");

      return {
        name: name,
        resolve: {
          ...(http
            ? {
                useProvider: "basic.http-request",
                args: [api, params],
              }
            : tool
              ? {
                  useProvider: "ai-portal.call-tool",
                  args: [tool, params],
                }
              : {
                  useProvider: `${api}:*`,
                  params: params as Record<string, unknown> | undefined,
                  // TODO: remove the temporary workaround below
                  ...(api === "easyops.api.data_exchange.olap@Query" &&
                  isObject(params)
                    ? {
                        params: {
                          ...params,
                          translate: ["#showKey"],
                          limit: undefined,
                          limitBy: undefined,
                          order: undefined,
                          displayName: true,
                        },
                      }
                    : null),
                }),
          ...(transform ? { transform: { value: transform } } : null),
          ...(rejectTransform
            ? { onReject: { transform: { value: rejectTransform } } }
            : null),
          ...(hasEnabled
            ? {
                if: config.enabled as string | boolean,
              }
            : null),
        },
        track: true,
        ...(hasEnabled
          ? {
              value: config.fallback,
            }
          : null),
        ...(scope === "template" ? { expose: false } : null),
      };
    }
  );
}
