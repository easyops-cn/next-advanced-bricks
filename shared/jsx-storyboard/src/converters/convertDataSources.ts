import type { ContextConf } from "@next-core/types";
import { isObject } from "@next-core/utils/general";
import type { ConvertViewOptions, DataSource } from "../interfaces.js";

export function convertDataSources(
  dataSources: DataSource[],
  options: ConvertViewOptions
): ContextConf[] {
  return dataSources.map(
    ({ name, http, api, params, entity, transform, rejectTransform }) => ({
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
      },
      track: true,
    })
  );
}
