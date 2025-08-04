import type { ContextConf } from "@next-core/types";
import { isObject } from "@next-core/utils/general";
import type { DataSource } from "@next-shared/jsx-storyboard";

export function convertDataSources(dataSources: DataSource[]): ContextConf[] {
  return dataSources.map((dataSource) => ({
    name: dataSource.name,
    resolve: {
      useProvider: `${dataSource.api}:*`,
      params: dataSource.params as Record<string, unknown> | undefined,
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
        : dataSource.transform
          ? { transform: { value: dataSource.transform } }
          : null),
    },
    track: true,
  }));
}
