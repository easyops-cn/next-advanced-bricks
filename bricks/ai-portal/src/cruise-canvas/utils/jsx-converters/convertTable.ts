import type { BrickConf } from "@next-core/types";
import type { Component, ConstructResult } from "@next-shared/jsx-storyboard";
import type { TableProps } from "@next-shared/jsx-storyboard/lib/components.js";
import type { ConvertViewOptions } from "../converters/interfaces.js";
import { lowLevelConvertToStoryboard } from "../converters/raw-data-generate/convert.js";
import { parseDataSource } from "../converters/expressions.js";
import { getPreGeneratedAttrViews } from "../converters/getPreGeneratedAttrViews.js";
import { findObjectIdByUsedDataContexts } from "./findObjectIdByUsedDataContexts.js";

export default async function convertTable(
  component: Component,
  view: ConstructResult,
  options: ConvertViewOptions
): Promise<BrickConf> {
  const { properties } = component;
  const { dataSource, size, columns, rowKey, pagination, ...restProps } =
    properties as Omit<TableProps<any, boolean>, "dataSource"> & {
      dataSource: string | object;
      size?: "small" | "medium" | "large";
      pagination?: boolean;
    };

  const parsedDataSource = parseDataSource(dataSource);

  const objectId = findObjectIdByUsedDataContexts(
    parsedDataSource.usedContexts,
    view.dataSources,
    view.variables
  );

  const attrViews = objectId
    ? await getPreGeneratedAttrViews(objectId)
    : undefined;

  const configuredColumns = new Map<string, any>();

  if (attrViews?.size) {
    for (const column of columns) {
      const candidate = attrViews.get(column.dataIndex);
      if (candidate) {
        const brick = lowLevelConvertToStoryboard(candidate, ".cellData");
        if (brick) {
          brick.slot = `[${column.dataIndex}]`;
          configuredColumns.set(column.dataIndex, brick);
        }
      }
    }
  }

  return {
    brick: "eo-next-table",
    properties: {
      dataSource: parsedDataSource.isString
        ? parsedDataSource.embedded
        : dataSource,
      ...restProps,
      rowKey: rowKey ?? columns[0]?.key,
      columns: columns.map((column) => {
        const brick = configuredColumns.get(column.dataIndex);
        return brick
          ? {
              ...column,
              useChildren: `[${column.dataIndex}]`,
            }
          : column;
      }),
      themeVariant: "elevo",
      scrollConfig: {
        x: "max-content",
      },
      ...(options.expanded
        ? {
            bordered: true,
            pagination,
            size: "large",
          }
        : {
            size: "middle",
            pagination: false,
          }),
    },
    children:
      configuredColumns.size > 0 ? Array.from(configuredColumns.values()) : [],
  };
}
