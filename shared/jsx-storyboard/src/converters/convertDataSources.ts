import type { ContextConf } from "@next-core/types";
import { isObject } from "@next-core/utils/general";
import type { DataSource } from "../interfaces.js";

export function convertDataSources(dataSources: DataSource[]): ContextConf[] {
  return dataSources.map((dataSource) => ({
    name: dataSource.name,
    resolve: {
      ...(dataSource.http
        ? {
            useProvider: "basic.http-request",
            args: [dataSource.api, dataSource.params],
          }
        : {
            useProvider: `${dataSource.api}:*`,
            params: dataSource.params as Record<string, unknown> | undefined,
            // TODO: remove the temporary workaround below
            ...(dataSource.api === "easyops.api.data_exchange.olap@Query" &&
            isObject(dataSource.params)
              ? {
                  params: {
                    ...dataSource.params,
                    translate: ["#showKey"],
                    limit: undefined,
                    limitBy: undefined,
                    order: undefined,
                    displayName: true,
                  },
                }
              : null),
          }),
      ...(dataSource.transform
        ? { transform: { value: dataSource.transform } }
        : null),
      ...(dataSource.rejectTransform
        ? { onReject: { transform: { value: dataSource.rejectTransform } } }
        : null),
    },
    track: true,
  }));
}
