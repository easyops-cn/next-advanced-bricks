import type { ContextConf } from "@next-core/types";
import { isObject } from "@next-core/utils/general";
import type { DataSource } from "@next-shared/tsx-parser";
import type { ConvertOptions } from "./interfaces.js";

export function convertDataSources(
  dataSources: DataSource[],
  options: ConvertOptions
): ContextConf[] {
  return dataSources.map(
    ({
      name,
      http,
      api,
      params,
      entity,
      transform,
      rejectTransform,
      config,
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
            : typeof entity === "string"
              ? {
                  useProvider: `ai-portal.${api.toLowerCase().replace(".", "-sdk-")}`,
                  args: [options.workspace, entity, params],
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
      };
    }
  );
}
